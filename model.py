from config import Base
from sqlalchemy import Column, Integer, DateTime, Text, VARCHAR


#Set up SQLAlchemy models based on postgresql database. These models are the ones used to perform queries. 
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True,index=True)
    username = Column(VARCHAR(50),nullable = False, index=True )
    password_hash = Column(Text(150),nullable = False, index=True)
    role = Column(VARCHAR(20), nullable = False, index=True)
    email = Column(VARCHAR(100), unique = True, nullable = False, index=True)
    first_name = Column(VARCHAR(50), index=True)
    last_name = Column(VARCHAR(50), index=True)
    phone = Column(VARCHAR(15), index=True)
    date_created = Column(DateTime, nullable = False, index=True)
    last_login = Column(DateTime, nullable=False, index=True)