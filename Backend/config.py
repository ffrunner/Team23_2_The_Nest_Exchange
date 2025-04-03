from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker



#Declare base with SQLAlchemy
Base = declarative_base()

#Connect to database via connection string and create engine
DATABASE_URL = "postgresql://postgres:Team23_2@database-1.cjm0e6m6u6vm.us-east-2.rds.amazonaws.com:5432/postgres"
engine = create_engine(DATABASE_URL)

Base.metadata.create_all(bind=engine)

#Setting up database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Function to give database session
def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally: 
        db.close()