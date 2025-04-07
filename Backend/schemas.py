from pydantic import BaseModel
from typing import List, Optional 

#Pydantic Models used for data management (requests and responses) 

#Data to get from user when signing up must match these data types/structure. Ex: Won't allow an int for a name
class CreateUser(BaseModel):
    email: str
    username: str 
    password_hash: str
    role: str
    first_name: str
    last_name: str
    phone: str

#Data to get from user when logging them in   
class LoginUser(BaseModel):
    email: str
    password: str 

#Data to get from user when changing their password
class ChangePassword(BaseModel):
    email: str 
    current_password: str 
    new_password: str  


class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: int
    lister_id: int

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None

class ClaimCreate(BaseModel):
    lister_id: int
    claimer_id: int
    pickup_details: Optional[str] = None
    claim_status: str

class ListingPhotoCreate(BaseModel):
    item_id: int
    photo_url: str

class ItemResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category_id: Optional[int]
    lister_id: int
    is_active: bool
    is_claimed: bool

    class Config:
        orm_mode = True
   
class ListingResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_active: bool
    lister_id: int
    item_id: int

    


# Pydantic schema for Category
class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True