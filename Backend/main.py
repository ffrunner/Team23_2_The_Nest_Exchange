from fastapi import FastAPI
from schemas import CreateUser, LoginUser, ChangePassword
from config import get_db
from model import User, Claim, Item, Category, Claim, ListingPhoto, Listing
from schemas import ItemCreate, ItemUpdate, ClaimCreate, ListingPhotoCreate
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from passlib.context import CryptContext
from typing import List, Optional



#Setting up application with FastAPI
app = FastAPI()

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
            return {"msg" : "Successfully signed up!"}
    except Exception as e: 
        return {e}

@app.post("/login")
async def login(user:LoginUser, db: Session = Depends(get_db)):
    #If user is found in db, can try to login. If not, will print user not found 
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
            if pwd_context.verify(user.password, db_user.password_hash):
                return{"msg" : "Successfully logged in!"}
            #NEED TO TAKE USER TO FRONT END FORM/HOME PAGE
            else:
                return{"msg" : "Invalid credentials"}
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
            return{"Msg": "Successfully changed password!"}
        else:
            return{"Msg": "Current password is incorrect"}
    else: 
        raise HTTPException(status_code=404, detail="Incorrect email")



# Lister Functionalities

@app.post("/items/", response_model=Item)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(db_item)
    db.commit()
    return

@app.post("/items/{item_id}/photos/", response_model=ListingPhoto)
async def upload_item_photo(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    photo_url = f"/path/to/storage/{file.filename}"  # Change to your storage logic
    with open(photo_url, "wb") as buffer:
        buffer.write(await file.read())

    db_listing_photo = ListingPhoto(item_id=item_id, photo_url=photo_url)
    db.add(db_listing_photo)
    db.commit()
    db.refresh(db_listing_photo)
    return db_listing_photo

@app.get("/items/{item_id}/claims/")
def get_item_claims(item_id: int, db: Session = Depends(get_db)):
    claims = db.query(Claim).filter(Claim.item_id == item_id).all()
    return claims

# Claimer Functionalities

@app.get("/items/search/")
def search_items(keyword: str, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.title.ilike(f"%{keyword}%")).all()  # Flexible search by title
    return items

@app.get("/items/filter/")
def filter_items(category_id: Optional[int] = None, tags: Optional[List[str]] = None, db: Session = Depends(get_db)):
    query = db.query(Item)
    if category_id:
        query = query.filter(Item.category_id == category_id)
    if tags:
        # Implement tag filtering logic here (assuming a tags relationship)
        # Example implementation would depend on your actual tag configuration
        query = query.filter(Item.tags.any(tag.in_(tags)))  # Customize this as needed
    return query.all()

@app.post("/claims/", response_model=Claim)
def create_claim(claim: ClaimCreate, db: Session = Depends(get_db)):
    db_claim = Claim(**claim.dict())
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim
