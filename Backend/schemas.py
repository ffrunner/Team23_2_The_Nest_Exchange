from pydantic import BaseModel


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

   


