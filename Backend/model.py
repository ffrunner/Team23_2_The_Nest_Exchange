from config import Base
from sqlalchemy import Column, Integer, Text, VARCHAR, TIMESTAMP, Boolean, ForeignKey, String, UniqueConstraint, CheckConstraint, Enum 
from sqlalchemy.orm import relationship 
import enum 

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
    date_created = Column(TIMESTAMP, nullable = False, index=True)
    last_login = Column(TIMESTAMP, nullable=False, index=True)

    listed_items = relationship("Item", foreign_keys="[Item.lister_id]", back_populates="lister")
    claimed_items = relationship("Item", foreign_keys="[Item.claimer_id]", back_populates="claimer")
    listed_claims = relationship("Claim", foreign_keys="[Claim.lister_id]", back_populates="lister")
    claimed_claims = relationship("Claim", foreign_keys="[Claim.claimer_id]", back_populates="claimer")
    
class Listing(Base):
    __tablename__ = "listings"
    
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    lister_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)  # Foreign key to items table

    # Relationships
    item = relationship("Item", back_populates="listing")

class ListingPhoto(Base):
    __tablename__ = "listing_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)  
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)  
    photo_url = Column(Text, nullable=False)  

    # Relationship to the Item model
    item = relationship("Item", back_populates="photos")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    is_claimed = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=None)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    is_active = Column(Boolean, default=True)
    lister_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    claimer_id = Column(Integer, ForeignKey('users.id'), nullable=True) 

    # Relationships
    listing = relationship("Listing", back_populates="item", uselist=False)  # One-to-one relationship
    lister = relationship("User", foreign_keys=[lister_id], back_populates="listed_items")
    claimer = relationship("User", foreign_keys=[claimer_id], back_populates="claimed_items")
    category = relationship("Category", back_populates="items")  
    photos = relationship("ListingPhoto", back_populates="item") 

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, autoincrement=True) 
    name = Column(String(50), nullable=False)

    __table_args__ = (
        UniqueConstraint('name', name='categories_name_key'),  
    )

    items = relationship("Item", back_populates="category")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, autoincrement=True)  
    lister_id = Column(Integer, ForeignKey('users.id'), nullable=False)  
    claimer_id = Column(Integer, ForeignKey('users.id'), nullable=False)  
    pickup_details = Column(Text, nullable=True)  
    claim_status = Column(String(50), nullable=False)

    # Check constraint for claim_status
    __table_args__ = (
        CheckConstraint(
            claim_status.in_(["pending", "claimed", "picked_up"]),
            name='claims_claim_status_check'
        ),
    )
    lister = relationship("User", foreign_keys=[lister_id], back_populates="listed_claims")
    claimer = relationship("User", foreign_keys=[claimer_id], back_populates="claimed_claims")

class ReportStatus(enum.Enum):
    pending = "pending"
    valid = "valid"
    invalid = "invalid"

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    reported_by = Column(Integer, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.pending)

class SupportMessage(Base):
    __tablename__ = "support_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    status = Column(String(50), default="pending")



    
