from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, Request, Response
from schemas import CreateUser, LoginUser, ChangePassword, ItemCreate, ItemUpdate, ClaimCreate, ItemResponse, ForgotPassword
from config import get_db #,settings 
from model import User, Item, ListingPhoto, Claim, Listing, Report, Category, SupportMessage
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List, Optional 
import redis 
import json 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from uuid import uuid4
#from fastapi_mail import FastMail, MessageSchema, MessageType
#from fastapi_mail.config import ConnectionConfig

#Setting up application with FastAPI
app = FastAPI()
UPLOAD_DIRECTORY = "./uploads"


#Setting up email system/function
#conf = ConnectionConfig(
   # MAIL_USERNAME = settings.SMTP_USER,
   # MAIL_PASSWORD = settings.SMTP_PASSWORD,
   # MAIL_FROM = settings.SMTP_FROM_EMAIL,
   # MAIL_PORT = settings.SMTP_PORT,
   # MAIL_SERVER = settings.SMTP_HOST,
   # MAIL_TLS = True,
   # MAIL_SSL = False, 
    #USE_CREDENTIALS = True,
    #VALIDATE_CERTS = True
#)
#mail = FastMail(conf)

#can add more origins. We'll need to add the actual link to nestexchange
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
redis_client = redis.StrictRedis(
    host='localhost',
    port=6379,
    db=0
)

#Setting hash up
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#function to set up session authentication
def get_current_user (request:Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_data = redis_client.get(f"session:{session_id}")
    if not user_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return json.loads(user_data)

# Admin access control dependency
def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return current_user

#Define routes
@app.get("/")
async def root():
    return {"msg" : "The Nest Exchange"}

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
            return JSONResponse(content="Successfully signed up!")
    except Exception as e: 
        raise HTTPException(status_code=500, detail=f"Server error occurred:{str(e)}")
        
@app.post("/login")
async def login(response: Response, user:LoginUser, db: Session = Depends(get_db)):
    #If user is found in db, can try to login. If not, will print user not found 
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
            if pwd_context.verify(user.password, db_user.password_hash):
                session_id = str(uuid4())
                redis_client.set(f"session:{session_id}", json.dumps({"id":db_user.id , "email": db_user.email, "role":db_user.role}), ex=3600)
                response.set_cookie(key="session_id",value=session_id, httponly=True, secure=False, samesite="lax")
                return JSONResponse(content="Successfully logged in!")
            else:
                return JSONResponse(content="Invalid credentials")
    else: 
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/logout")
async def logout(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id:
        redis_client.delete(f"session:{session_id}")
    response = JSONResponse(content="Successfully logged out!")
    return response

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
        raise HTTPException(status_code=404, detail="Incorrect email")

#@app.post("/forgotpassword")
#async def forgot_password(user:ForgotPassword, db: Session = Depends(get_db)):
    #db_user = db.query(User).filter(User.email == user.email).first()
   # if db_user:
       # reset_link = f"http://localhost:8000/changepassword"
       # message = MessageSchema(
         #   subject = "Nest Exchange Password",
          #  recipients=[user.email],
          #  body=f"To reset your Nest Exchange password, visit : {reset_link}",
          #  subtype=MessageType.plain)
       # try: 
           # await mail.send_message(message)
       # except Exception as e:
           # raise HTTPException(status_code=500, detail=f"Email failed to send: str{e}")
       # return JSONResponse(content="Password reset link has been sent to email")
   # else:
        #raise HTTPException(status_code=404, detail="User not found")

# Lister Functionalities

@app.post("/items/")
def create_item(item: ItemCreate, db: Session = Depends(get_db),current_user:dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
    
    db_item = Item(title = item.title, description = item.description, category_id = item.category_id, lister_id = current_user["id"],is_active=True,  # Default to active
        is_claimed=False)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    #redis_client.delete("items")  # Invalidate general items cache
    db_listing = Listing(
        title=item.title,
        description=item.description,
        lister_id=current_user["id"],
        item_id=db_item.id,
        category_id=db_item.category_id,  # Link the listing to the item
        is_active=True  # Default to active
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_item, db_listing  
        
@app.put("/items/{item_id}")
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db), current_user:dict=Depends(get_current_user)):
    # Fetch the item from the database
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
    
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.lister_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have permission to update this item")
    # Validate category_id if provided
    if item.category_id is not None:
        category = db.query(Category).filter(Category.id == item.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category_id")
    
    # Apply updates
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)

    # Commit changes to the database
    db.commit()
    db.refresh(db_item)
    
    # Invalidate cache
    #redis_client.delete(f"item:{item_id}")
    #redis_client.delete("items")
    
    return db_item
      
@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: dict=Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
    
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not db_item.lister_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this item")
    # Delete related records (e.g., photos, claims)
    db.query(ListingPhoto).filter(ListingPhoto.item_id == item_id).delete()
    db.query(Claim).filter(Claim.item_id == item_id).delete()

    # Delete the item
    db.delete(db_item)
    db.commit()

    # Invalidate cache
    try:
        redis_client.delete(f"item:{item_id}")
    except Exception as e:
        print(f"Redis error: {e}")

    return

@app.post("/items/{item_id}/photos/")
async def upload_item_photo(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict=Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
    
    # Validate item_id
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.lister_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have permission to upload a photo for this item")
    # Ensure the upload directory exists
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

    # Save the file
    photo_url = os.path.join(UPLOAD_DIRECTORY, file.filename)
    try:
        with open(photo_url, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Save the photo record in the database
    db_listing_photo = ListingPhoto(item_id=item_id, photo_url=photo_url)
    db.add(db_listing_photo)
    db.commit()
    db.refresh(db_listing_photo)
    return db_listing_photo

@app.get("/items/{item_id}/claims/")
def get_item_claims(item_id: int, db: Session = Depends(get_db), current_user: dict=Depends(get_current_user)):
    if not isinstance(current_user, dict):
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
   
    cached_claims = redis_client.get(f"claims:item:{item_id}")

    if cached_claims:
        return {"cached": True, "claims": json.loads(cached_claims)}
    
    claims = db.query(Claim).filter(Claim.item_id == item_id).all()

    redis_client.setex(f"claims:item:{item_id}", 3600, json.dumps([claim.__dict__ for claim in claims]))
    return {"cached": False, "claims": claims}

@app.get("/items/", response_model=List[ItemResponse])
def get_items(db: Session = Depends(get_db), current_user:dict=Depends(get_current_user)):
    if not isinstance(current_user, dict):
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
    
    items = db.query(Item).all()
    return items

@app.get("/listings", response_model=dict)
def get_listings(category: str = Query(None), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")
    
    print(f"Received category: {category}")  # Debug: Check the category parameter
    if category:
        category_obj = db.query(Category).filter(Category.name == category).first()
        print(f"Category object: {category_obj}")  # Debug: Check the category object
        if not category_obj:
            raise HTTPException(status_code=422, detail="Invalid category")

        # Fetch listings for the category
        listings = db.query(Listing).filter(Listing.category_id == category_obj.id).all()
        print(f"Listings for category: {listings}")  # Debug: Check the listings
    else:
        # Fetch all listings if no category is provided
        listings = db.query(Listing).all()
        print(f"All listings: {listings}")  # Debug: Check all listings

    # Return the listings
    return {"listings": [listing.to_dict() for listing in listings]}
       

# Claimer Functionalities

@app.get("/items/search/", response_model=List[ItemResponse])
def search_items(keyword: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")

    items = db.query(Item).filter(Item.title.ilike(f"%{keyword}%")).all()
    return items

@app.get("/items/filter/", response_model=List[ItemResponse])
def filter_items(category_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")

    items = db.query(Item).filter(Item.category_id == category_id).all()
    return items

@app.post("/items/{item_id}/claims/")
def create_claim(
    item_id: int,
    claim: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Validate the current user session
    if not isinstance(current_user, dict) or "id" not in current_user:
        raise HTTPException(status_code=401, detail="Invalid or missing user session")

    # Fetch the item from the database
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Prevent the item's lister (owner) from creating a claim for their own item
    if db_item.lister_id == current_user["id"]:
        raise HTTPException(status_code=403, detail="You cannot claim your own item")

    # Ensure the item is claimable (active and not already claimed)
    if not db_item.is_active or db_item.is_claimed:
        raise HTTPException(status_code=400, detail="Item is not available for claiming")

    # Create the claim record
    db_claim = Claim(
        item_id=item_id,
        claimer_id=current_user["id"],  # Associate claim with the logged-in user
        message=claim.message,
        status="pending"  # Default status for new claims
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)

    return db_claim
# Admin Functionalities

@app.delete("/admin/listings/{listing_id}", status_code=200)
async def remove_listing(listing_id: int, db: Session = Depends(get_db), current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(db_listing)
    db.commit()
    return {"msg": "Listing removed"}

@app.put("/admin/reports/{report_id}", status_code=200)
async def respond_report(report_id: int, action: str, db: Session = Depends(get_db), current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    db_report.status = action
    db.commit()
    db.refresh(db_report)
    return {"msg": "Report status updated", "report": db_report.__dict__}

@app.get("/admin/usage", status_code=200)
async def view_usage_reports(db: Session = Depends(get_db), current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    total_listings = db.query(Listing).count()
    total_items = db.query(Item).count()
    total_claims = db.query(Claim).count()
    total_reports = db.query(Report).count()
    return {
        "total_listings": total_listings,
        "total_items": total_items,
        "total_claims": total_claims,
        "total_reports": total_reports
    }

@app.post("/admin/categories")
async def add_category(name: str, db: Session = Depends(get_db),current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    new_category = Category(name=name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

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

@app.get("/admin/support", status_code=200)
async def view_support_messages(db: Session = Depends(get_db),current_user: dict =Depends(admin_required)):
    print(f"Admin: {current_user['email']}")
    messages = db.query(SupportMessage).all()
    return messages

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
