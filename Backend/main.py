from fastapi import FastAPI
from schemas import CreateUser 
from config import get_db
from model import User
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException

#Setting up application with FastAPI
app = FastAPI()

#Methods for hashing passwords and checking them

#Define routes
@app.get("/")
async def root():
    return {"msg" : "The Nest Exchange"}

@app.post("/signup")
async def sign_up(user:CreateUser, db: Session = Depends(get_db)):
    try: 
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="User already exists")
        else:
            db_user = User(email=user.email, username=user.username, password_hash=user.password_hash, role=user.role, first_name=user.first_name, last_name=user.last_name, phone=user.phone)
            db.add(db_user)
            db.commit()
            return {"msg" : "Successfully signed up!"}
    except Exception as e: 
        return {e}
