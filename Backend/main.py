from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, Request, Response
from schemas import CreateUser, LoginUser, ChangePassword, ItemCreate, ItemUpdate, ReportReason, ItemResponse, CreateActivityLog, UpdateUser, ResolveReport, ResolveAction
from config import get_db 
from model import User, Item, ListingPhoto, Claim, Listing, Report, Category, SupportMessage, ActivityLog
from sqlalchemy.orm import Session 
from passlib.context import CryptContext
from typing import List, Optional 
from redis import StrictRedis
import json 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from uuid import uuid4
from fastapi.staticfiles import StaticFiles

#AI tools (GitHub Copilot and Chatgpt) were used for debugging purposes

#Setting up application with FastAPI
app = FastAPI()

#Having to make a directory for binary files for photos. Making absolute path so we all have the same one
BASE_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIRECTORY = os.path.join(BASE_DIRECTORY, "uploads")
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
app.mount("/uploads",StaticFiles(directory=UPLOAD_DIRECTORY),name="uploads")


#Setting up CORS for security. Only backend and frontend can access. We'll need to add the actual link to nestexchange
origins = [
    "http://localhost:8000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"]
)

#Redis cache setup
redis_client = StrictRedis(
    host="localhost",
    port=6379,
    decode_responses=True,
    db=0
)

#Setting hash up 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#Function to set up session authentication for current users
def get_current_user (request:Request):
    session_id = request.cookies.get("session_id")
    print(f"The session ID for logged in user: {session_id}")
    if not session_id:
        raise HTTPException(status_code=401, detail="User is not logged in")
    user_data = redis_client.get(f"session:{session_id}")
    if not user_data:
        raise HTTPException(status_code=401, detail="User is not logged in")
    return json.loads(user_data)

#Function to use for admin functionalities (RBAC)
def admin_required(current_user: dict = Depends(get_current_user)):
    #if the current user isn't an admin, they won't have permission
    if current_user.get("role") not in ["Admin", "admin"]:
        raise HTTPException(status_code=403, detail="Administrator users can only access this function")
    return current_user


#Define Nest Exchange routes
@app.get("/")
async def root():
    return {"msg" : "The Nest Exchange"}

#Function to create a user and store their info in database
@app.post("/signup")
async def sign_up(user:CreateUser, db: Session = Depends(get_db)):
    try: 
        #If user already found in db, will print user already exists. If not, user can sign up
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="User already exists")
        else:
            password_hash = pwd_context.hash(user.password_hash)
            user.password_hash = password_hash 
            db_user = User(email=user.email, username=user.username, password_hash=user.password_hash, role=user.role, first_name=user.first_name, last_name=user.last_name, phone=user.phone)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return JSONResponse(content="Successfully signed up!")
    except Exception as e: 
        raise HTTPException(status_code=500, detail=f"Server error occurred:{str(e)}")

#Function to log user in to Nest Exchange. It sets their session ID as well
@app.post("/login")
async def login(response: Response, user:LoginUser, db: Session = Depends(get_db)):
    #If user is found in db, can try to login. If not, will print user not found 
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
            if pwd_context.verify(user.password, db_user.password_hash):
                try:
                    session_id = str(uuid4())
                    user_data = {
                    "id":db_user.id,
                    "email":db_user.email,
                    "role":db_user.role
                     }
                    redis_client.set(f"session:{session_id}", json.dumps(user_data), ex=3600)
                    print(f"The stored user data in Redis is: {user_data}")
                    response = JSONResponse(content="Successfully logged in!")
                    response.set_cookie(key="session_id",value=session_id, httponly=True, secure=False, samesite="Lax", path="/")
                    return response
                except Exception as e:
                    return JSONResponse(content="Redis error occurred in setting up cookie or session: {e}")
            else:
                return JSONResponse(content="Cannot login. Invalid credentials")
    else: 
        raise HTTPException(status_code=404, detail="User not found")

#Function to change user info from settings page 
@app.patch("/update/user")
async def update_user(user:UpdateUser, db : Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to update the user's account")
    user_id = current_user["id"]
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user
    
#Function to get first and last name on the profile page
@app.get("/name")
async def get_name(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"first_name": db_user.first_name, "last_name": db_user.last_name}

#Function to logout the user and end their session 
@app.post("/logout")
async def logout(response: Response, request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id: 
        raise HTTPException(status_code=400, detail="User is not logged in")
    
    redis_client.delete(f"session:{session_id}")
    response.delete_cookie("session_id", path="/")
    return JSONResponse(content="Successfully logged out!")

#Function to change user's password. Will be accessed from the settings page
@app.post("/changepassword")
async def change_password(user:ChangePassword, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    #If user enters email and current passw correctly, can change password. If not, will print errors
    db_user = db.query(User).filter(User.email == current_user["email"]).first()
    if db_user:
        if pwd_context.verify(user.current_password, db_user.password_hash):
            db_user.password_hash = pwd_context.hash(user.new_password)
            db.commit()
            return JSONResponse(content="Successfully changed password!")
        else:
            return JSONResponse(content="Current password is incorrect")
    else: 
        raise HTTPException(status_code=404, detail="Email not found")

#Function that allows users to delete their Nest Exchange accounts and all their data. Will be on the settings page
@app.delete("/deleteaccount")
async def delete_account(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to delete the user's account")
    db_user = db.query(User).filter(User.id == current_user["id"]).first()
    if db_user:
        
        db.query(Claim).filter(Claim.claimer_id == current_user["id"]).delete()
        db.query(Listing).filter(Listing.lister_id == current_user["id"]).delete()
        db.query(ListingPhoto).filter(ListingPhoto.item_id.in_(
            db.query(Item.id).filter(Item.lister_id == current_user["id"])
        )).delete()
        db.query(Item).filter(Item.lister_id == current_user["id"]).delete()
        db.query(User).filter(User.id == current_user["id"]).delete()
        db.commit()
        response = JSONResponse(content= "Your account has been deleted")
        response.delete_cookie("session_id")
        return response 
    
# Lister Functionalities
#Function to create or list an item
@app.post("/items/")
async def create_item(item: ItemCreate, db: Session = Depends(get_db),current_user:dict = Depends(get_current_user)): 
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to list an item")
    
    db_item = Item(title = item.title, description = item.description, pickup_details = item.pickup_details, category_id = item.category_id, lister_id = current_user["id"],is_active=True,  # Default to active
        is_claimed=False)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    #redis_client.delete("items")  
    db_listing = Listing(
        title=item.title,
        description=item.description,
        lister_id=current_user["id"],
        item_id=db_item.id,
        category_id=db_item.category_id,  
        is_active=True  
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    #For activity log
    add_activity(
        CreateActivityLog(
            user_id=current_user["id"],
            action= "added a new listing"
        ),
        db
    )
    return {"item": db_item, "listing": db_listing}  

#Function to update an item's data  
@app.put("/items/{item_id}")
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db), current_user:dict=Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to update this listing")
    #Get item from the database with the query. If it's found and user has permission, can change the item
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.lister_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have permission to update this item")
    #Make sure that the category is in the database too
    if item.category_id is not None:
        category = db.query(Category).filter(Category.id == item.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="The category is not found")
    
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    
   
    #redis_client.delete(f"item:{item_id}")
    #redis_client.delete("items")
    
    return db_item

#Function to delete a listing. Can be accessed from lister's profile by lister or by admin     
@app.delete("/items/delete/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: dict=Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Only the lister of this item or an administrator user can delete this")
    
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.lister_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this item")
    # Have to delete the other rows in database associated with this item like the photo and claims
    db.query(ListingPhoto).filter(ListingPhoto.item_id == item_id).delete()
    db.query(Claim).filter(Claim.item_id == item_id).delete()
    db.query(Listing).filter(Listing.item_id == item_id).delete()
    db.delete(db_item)
    db.commit()

    # Invalidate the Redis cache
    try:
        redis_client.delete(f"item:{item_id}")
    except Exception as e:
        print(f"Redis error: {e}")

    return

#Function to add photos to item listed
@app.post("/items/photos/")
async def upload_item_photo(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict=Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to add a photo for this item")
    db_item = db.query(Item).filter(Item.lister_id == current_user["id"]).order_by(Item.id.desc()).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File could not be read: {str(e)}")
    photo_url = f"/uploads/{filename}"
    db_listing_photo = ListingPhoto(item_id=db_item.id, photo_url=photo_url)
    db.add(db_listing_photo)
    db.commit()
    db.refresh(db_listing_photo)
    return {"photo": db_listing_photo, "photo_url": photo_url}

#Function to get the claims for a specific item 
@app.get("/items/{item_id}/claims/")
def get_item_claims(item_id: int, db: Session = Depends(get_db), current_user: dict=Depends(get_current_user)):
    if not isinstance(current_user, dict):
        raise HTTPException(status_code=401, detail="You don't have permission to get claims for this item")
   
    cached_claims = redis_client.get(f"claims:item:{item_id}")

    if cached_claims:
        return {"cached": True, "claims": json.loads(cached_claims)}
    
    claims = db.query(Claim).filter(Claim.item_id == item_id).all()

    redis_client.setex(f"claims:item:{item_id}", 3600, json.dumps([claim.__dict__ for claim in claims]))
    return {"cached": False, "claims": claims}

#Function to get user's listings(the ones they created)
@app.get("/items/", response_model=List[ItemResponse])
def get_items(db: Session = Depends(get_db), current_user:dict=Depends(get_current_user)):
    if not current_user or not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You don't have permission to get the user's listings")
    
    items = db.query(Item).filter(Item.lister_id == current_user["id"])
    return items

#Function to get all listings in the database based on category
@app.get("/listings", response_model=dict)
async def get_listings(category: str = Query(None), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    print(current_user)
    print(f"Received category: {category}")  
    if category:
        category_obj = db.query(Category).filter(Category.name == category).first()
        print(f"Category object: {category_obj}") 
        if not category_obj:
            raise HTTPException(status_code=422, detail="Not a category")

        # Fetch all listings in database for chosen category
        listings = db.query(Listing).filter(Listing.category_id == category_obj.id).all()
        print(f"Listings for category: {listings}")  
    else:
        #Can also just get all listings in database not based on the category if category not chosen
        listings = db.query(Listing).all()
        print(f"All listings: {listings}")  

    return {"listings": [listing.to_dict() for listing in listings]}

#Get a specific listing and its details when it is clicked
@app.get("/listings/{id}", response_model=dict)
async def get_listing(id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return listing.to_dict()

#Function to create report
@app.post("/listings/{listing_id}/report")
def report_listing(listing_id: int,report:ReportReason, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to report listings")
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    new_report = Report(
        listing_id=listing_id,
        reason = report.reason,
        reported_by = current_user["id"],
        resolved = False,

    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
     #For activity log
    add_activity(
        CreateActivityLog(
            user_id=current_user["id"],
            action= "reported a listing"
        ),
        db
    )

    return new_report
# Claimer Functionalities

#Function to get all the listings a user has claimed
@app.get("/claimed")
async def get_claimed(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to get the user's claimed items")
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    claimed_items = user.claimed_items
    claimed_items_format = [{"id": item.id, "title": item.title, "description": item.description} for item in claimed_items]
    return claimed_items_format

#Function for searching items
@app.get("/items/search/", response_model=List[ItemResponse])
def search_items(keyword: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to search")

    items = db.query(Item).filter(Item.title.ilike(f"%{keyword}%")).all()
    return items

#Function to filter items by the categories
@app.get("/items/filter/", response_model=List[ItemResponse])
def filter_items(category_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to view listings")

    items = db.query(Item).filter(Item.category_id == category_id).all()
    return items

#Function to claim a listing
@app.post("/items/{listing_id}/claims/")
def create_claim(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
   
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="You do not have permission to claim")

    #Check to see if the selected item is in the database
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Item not found")

    db_item = db_listing.item
    if not db_item: 
        raise HTTPException(status_code=404, detail="Item not found")
    #The item's lister (owner) can't claim their own item
    if db_item.lister_id == current_user["id"]:
        raise HTTPException(status_code=403, detail="You cannot claim your own item")

    #Check to see if the item is claimable (active and not already claimed)
    if not db_item.is_active or db_item.is_claimed:
        raise HTTPException(status_code=400, detail="Item is already claimed or inactive")
    pickup_details = db_item.pickup_details
    db_claim = Claim(
        item_id=db_item.id,
        lister_id = db_item.lister_id,
        claimer_id=current_user["id"],  
        pickup_details = pickup_details,
        claim_status = "claimed"
    )
    db.add(db_claim)

    db_item.is_claimed = True
    db_item.is_active = False
    db_item.claimer_id = current_user["id"]
    db_listing.is_active = False
    db.commit()
    db.refresh(db_claim)

     #For activity log
    add_activity(
        CreateActivityLog(
            user_id=current_user["id"],
            action= "claimed a listing"
        ),
        db
    )

    return db_claim

# Admin Functionalities
#Function to allow admin users to delete inappropriate listings
@app.delete("/admin/listings/{listing_id}", status_code=200)
async def remove_listing(listing_id: int, db: Session = Depends(get_db), current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(db_listing)
    db.commit()
    return {"msg": "Listing has been deleted"}

#Function to add activities to activity log
def add_activity(activity: CreateActivityLog, db:Session = Depends(get_db)):
    db_activity = ActivityLog(user_id = activity.user_id, action = activity.action)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

#Function to give admin users the activity log
@app.get("/admin/activitylog")
async def view_activity_log(db: Session = Depends(get_db), current_user: dict = Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    activities = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()
    return activities 

#Function to let admin users take care of/resolve reports
@app.post("/admin/reports/resolve")
async def resolve_report(resolve:ResolveReport, db: Session = Depends(get_db), current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    #Look for the report in database. If not there, error. If already resolved, will say so
    db_report = db.query(Report).filter(Report.id == resolve.report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    if db_report.resolved: 
        raise HTTPException(status_code=400, detail="Report has already been resolved")
    #Make sure listing id matches up with the one in report 
    listing = db.query(Listing).filter(Listing.id == db_report.listing_id).first()
    
    #If admin user selects delete listing, will check for listing in db and then delete if it's there. Report will be resolved
    if resolve.action == ResolveAction.delete_listing:
        if not listing: 
            raise HTTPException(status_code=404, detail="Listing has already been deleted")
        db.delete(listing)
        db_report.resolved = True
    
    #If admin user selects reject report, the report will be resolved
    if resolve.action == ResolveAction.reject:
        db_report.resolved = True

    db.commit()
    return {"msg": "Report status updated", "report": db_report.__dict__}

#Function to give admin users all the reports from database
@app.get("/admin/reports")
async def get_reports(db:Session = Depends(get_db), current_user: dict = Depends(admin_required)):
    print(f"Admin:{current_user['email']}")
    reports = db.query(Report).all()
    return {"reports": [report.__dict__ for report in reports]}

#Function to give admin users usage reports/counts of everything
@app.get("/admin/usage", status_code=200)
async def view_usage_reports(db: Session = Depends(get_db), current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    total_listings = db.query(Listing).count()
    total_users = db.query(User).count()
    total_claims = db.query(Claim).count()
    total_reports = db.query(Report).count()
    return {
        "total_listings": total_listings,
        "total_users": total_users,
        "total_claims": total_claims,
        "total_reports": total_reports
    }

#Function to let admin users create a category
@app.post("/admin/categories")
async def add_category(name: str, db: Session = Depends(get_db),current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    new_category = Category(name=name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

#Function to let amdin users edit categories 
@app.put("/admin/categories/{category_id}")
async def edit_category(category_id: int, name: str, db: Session = Depends(get_db),current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db_category.name = name
    db.commit()
    db.refresh(db_category)
    return db_category

#Function to give admin users support messages
@app.get("/admin/support", status_code=200)
async def view_support_messages(db: Session = Depends(get_db),current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    messages = db.query(SupportMessage).all()
    return messages

#Function to let admin users respond to support messages
@app.put("/admin/support/{message_id}", status_code=200)
async def respond_support_message(message_id: int, response_text: str, db: Session = Depends(get_db),current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    db_message = db.query(SupportMessage).filter(SupportMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Support message not found")
    db_message.response = response_text
    db_message.status = "responded"
    db.commit()
    db.refresh(db_message)
    return db_message

