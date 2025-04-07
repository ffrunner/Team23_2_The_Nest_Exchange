from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from schemas import CreateUser, LoginUser, ChangePassword, ItemCreate, ItemUpdate, ClaimCreate, ItemResponse, ListingResponse
from config import get_db
from model import User, Item, ListingPhoto, Claim, Listing, Report, Category, SupportMessage
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List, Optional 
import redis 
import json 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

#Setting up application with FastAPI
app = FastAPI()

UPLOAD_DIRECTORY = "./uploads" 

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
async def login(user:LoginUser, db: Session = Depends(get_db)):
    #If user is found in db, can try to login. If not, will print user not found 
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
            if pwd_context.verify(user.password, db_user.password_hash):
                return JSONResponse(content="Successfully logged in!")
            
            #NEED TO TAKE USER TO FRONT END FORM/HOME PAGE
            else:
                return JSONResponse(content="Invalid credentials")
    else: 
        raise HTTPException(status_code=404, detail="User not found")
    
@app.post("/changepassword")
async def change_password(user:ChangePassword, db: Session = Depends(get_db)):
    #If user enters email and current passw correctly, can change password. If not, will print errors
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        if pwd_context.verify(user.current_password, db_user.password_hash):
            db_user.password_hash = pwd_context.hash(user.new_password)
            db.commit()
            return JSONResponse(content="Successfully changed password!")
        else:
            return JSONResponse(content="Current password is incorrect")
    else: 
        raise HTTPException(status_code=404, detail="Incorrect email")



# Lister Functionalities

@app.post("/items/")
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(title = item.title, description = item.description, category_id = item.category_id, lister_id = item.lister_id,is_active=True,  # Default to active
        is_claimed=False)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    #redis_client.delete("items")  # Invalidate general items cache
    db_listing = Listing(
        title=item.title,
        description=item.description,
        lister_id=item.lister_id,
        item_id=db_item.id,  # Link the listing to the item
        is_active=True  # Default to active
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_item, db_listing  
        
@app.put("/items/{item_id}")
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    # Fetch the item from the database
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
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
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

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
async def upload_item_photo(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate item_id
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

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
def get_item_claims(item_id: int, db: Session = Depends(get_db)):
    cached_claims = redis_client.get(f"claims:item:{item_id}")

    if cached_claims:
        return {"cached": True, "claims": json.loads(cached_claims)}
    
    claims = db.query(Claim).filter(Claim.item_id == item_id).all()

    redis_client.setex(f"claims:item:{item_id}", 3600, json.dumps([claim.__dict__ for claim in claims]))
    return {"cached": False, "claims": claims}

@app.get("/items/", response_model=List[ItemResponse])
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items

@app.get("/listings/", response_model=List[ListingResponse])
def get_listings(category: str, db: Session = Depends(get_db)):
    listings = db.query(Listing).filter(Listing.category_id == category).all()
    return listings

# Claimer Functionalities

@app.get("/items/search/", response_model=List[ItemResponse])
def search_items(keyword: str, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.title.ilike(f"%{keyword}%")).all()
    return items

@app.get("/items/filter/", response_model=List[ItemResponse])
def filter_items(category_id: int, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.category_id == category_id).all()
    return items

@app.post("/claims/")
def create_claim(claim: ClaimCreate, db: Session = Depends(get_db)):
    db_claim = Claim(**claim.dict())
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

# Admin Functionalities

@app.delete("/admin/listings/{listing_id}", status_code=200)
async def remove_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(db_listing)
    db.commit()
    return {"msg": "Listing removed"}

@app.put("/admin/reports/{report_id}", status_code=200)
async def respond_report(report_id: int, action: str, db: Session = Depends(get_db)):
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    db_report.status = action
    db.commit()
    db.refresh(db_report)
    return {"msg": "Report status updated", "report": db_report.__dict__}

@app.get("/admin/usage", status_code=200)
async def view_usage_reports(db: Session = Depends(get_db)):
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
async def add_category(name: str, db: Session = Depends(get_db)):
    new_category = Category(name=name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@app.put("/admin/categories/{category_id}")
async def edit_category(category_id: int, name: str, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db_category.name = name
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/admin/support", status_code=200)
async def view_support_messages(db: Session = Depends(get_db)):
    messages = db.query(SupportMessage).all()
    return messages

@app.put("/admin/support/{message_id}", status_code=200)
async def respond_support_message(message_id: int, response_text: str, db: Session = Depends(get_db)):
    db_message = db.query(SupportMessage).filter(SupportMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Support message not found")
    db_message.response = response_text
    db_message.status = "responded"
    db.commit()
    db.refresh(db_message)
    return db_message
