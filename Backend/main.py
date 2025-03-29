from fastapi import FastAPI
from schemas import CreateUser, LoginUser, ChangePassword
from config import get_db
from model import User
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException
from passlib.context import CryptContext



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
