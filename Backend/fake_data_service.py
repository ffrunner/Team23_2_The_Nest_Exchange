from fastapi import FastAPI, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from faker import Faker
import random
from datetime import datetime, timezone

from config import get_db
from model import User, Category, Item, Listing, Claim, ListingPhoto, Report, SupportMessage, ActivityLog

#AI tool (Chatgpt) used for debugging purposes

app = FastAPI(title="Faker Data Service")
fake = Faker()

class FakeUser(BaseModel):
    email: str
    username: str
    role: str
    first_name: str
    last_name: str
    phone: str
    date_created: datetime
    last_login: datetime

class FakeCategory(BaseModel):
    name: str

class FakeItem(BaseModel):
    title: str
    description: Optional[str]
    pickup_details: Optional[str]
    category_id: int
    lister_id: int
    is_active: bool
    is_claimed: bool
    created_at: datetime

class FakeListing(BaseModel):
    title: str
    description: Optional[str]
    is_active: bool
    lister_id: int
    item_id: int
    category_id: Optional[int]

class FakeClaim(BaseModel):
    lister_id: int
    claimer_id: int
    pickup_details: Optional[str]
    claim_status: str
    item_id: int

class FakePhoto(BaseModel):
    item_id: int
    photo_url: str

class FakeReport(BaseModel):
    reason: str
    resolved: bool

class FakeSupportMessage(BaseModel):
    user_id: int
    message: str
    response: Optional[str]
    status: str

class FakeActivityLog(BaseModel):
    user_id: int
    action: str
    created_at: datetime


def gen_user() -> FakeUser:
    now = datetime.now(timezone.utc)
    return FakeUser(
        email=fake.email(),
        username=fake.user_name(),
        role=random.choice(["User","Admin"]),
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        phone=fake.phone_number(),
        date_created=now,
        last_login=now
    )

def gen_category() -> FakeCategory:
    return FakeCategory(name=fake.word().capitalize())

def gen_item(cat_ids: List[int], user_ids: List[int]) -> FakeItem:
    return FakeItem(
        title=fake.sentence(nb_words=4),
        description=fake.paragraph(),
        pickup_details=fake.address(),
        category_id=random.choice(cat_ids),
        lister_id=random.choice(user_ids),
        is_active=True,
        is_claimed=False,
        created_at=datetime.now(timezone.utc)
    )

def gen_listing(item_ids: List[int], user_ids: List[int], cat_ids: List[int]) -> FakeListing:
    return FakeListing(
        title=fake.sentence(nb_words=3),
        description=fake.paragraph(),
        is_active=True,
        lister_id=random.choice(user_ids),
        item_id=random.choice(item_ids),
        category_id=random.choice(cat_ids)
    )

def gen_claim(item_ids: List[int], user_ids: List[int]) -> FakeClaim:
    return FakeClaim(
        lister_id=random.choice(user_ids),
        claimer_id=random.choice(user_ids),
        pickup_details=fake.paragraph(),
        claim_status=random.choice(["pending","claimed","picked_up"]),
        item_id=random.choice(item_ids)
    )

def gen_photo(item_ids: List[int]) -> FakePhoto:
    return FakePhoto(
        item_id=random.choice(item_ids),
        photo_url=fake.image_url()
    )

def gen_report() -> FakeReport:
    return FakeReport(
        reason=fake.sentence(),
        resolved=random.choice([False, True])
    )

def gen_support(user_ids: List[int]) -> FakeSupportMessage:
    return FakeSupportMessage(
        user_id=random.choice(user_ids),
        message=fake.paragraph(),
        response=None,
        status="pending"
    )

def gen_activity(user_ids: List[int]) -> FakeActivityLog:
    return FakeActivityLog(
        user_id=random.choice(user_ids),
        action=random.choice(["logged_in","created_item","claimed_item","deleted_item"]),
        created_at=datetime.now(timezone.utc)
    )

@app.get("/fake/users", response_model=List[FakeUser])
async def fake_users(n: int = Query(10, ge=1, le=1000)):
    return [gen_user() for _ in range(n)]

@app.get("/fake/categories", response_model=List[FakeCategory])
async def fake_categories(n: int = Query(5, ge=1, le=100)):
    return [gen_category() for _ in range(n)]

@app.get("/fake/items", response_model=List[FakeItem])
async def fake_items(
    n: int = Query(20, ge=1, le=1000),
    user_count: int = Query(10, ge=1),
    category_count: int = Query(5, ge=1)
):
    user_ids = list(range(1, user_count+1))
    category_ids  = list(range(1, category_count+1))
    return [gen_item(category_ids, user_ids) for _ in range(n)]

@app.get("/fake/listings", response_model=List[FakeListing])
async def fake_listings(
    n: int = Query(20, ge=1, le=1000),
    user_count: int = Query(10, ge=1),
    item_count: int = Query(20, ge=1),
    category_count: int = Query(5, ge=1)
):
    return [
        gen_listing(list(range(1,item_count+1)),
                    list(range(1,user_count+1)),
                    list(range(1,category_count+1)))
        for _ in range(n)
    ]

@app.get("/fake/claims", response_model=List[FakeClaim])
async def fake_claims(
    n: int = Query(10, ge=1, le=500),
    user_count: int = Query(10, ge=1),
    item_count: int = Query(20, ge=1)
):
    return [
        gen_claim(list(range(1,item_count+1)),
                  list(range(1,user_count+1)))
        for _ in range(n)
    ]

@app.get("/fake/photos", response_model=List[FakePhoto])
async def fake_photos(n: int = Query(10, ge=1, le=500), item_count: int = Query(20, ge=1)):
    return [gen_photo(list(range(1,item_count+1))) for _ in range(n)]

@app.get("/fake/reports", response_model=List[FakeReport])
async def fake_reports(n: int = Query(10, ge=1, le=500)):
    return [gen_report() for _ in range(n)]

@app.get("/fake/support", response_model=List[FakeSupportMessage])
async def fake_support(n: int = Query(5, ge=1, le=100), user_count: int = Query(10, ge=1)):
    return [gen_support(list(range(1,user_count+1))) for _ in range(n)]

@app.get("/fake/activity", response_model=List[FakeActivityLog])
async def fake_activity(n: int = Query(10, ge=1, le=500), user_count: int = Query(10, ge=1)):
    return [gen_activity(list(range(1,user_count+1))) for _ in range(n)]

@app.post("/seed/users")
def seed_users(n: int = Query(10, ge=1, le=1000), db: Session = Depends(get_db)):
    created = []
    for u in fake_users(n):
        db_u = User(
            email=u.email, username=u.username, role=u.role,
            password_hash=fake.password(),
            first_name=u.first_name, last_name=u.last_name,
            phone=u.phone,
            date_created=u.date_created, last_login=u.last_login
        )
        db.add(db_u)
        created.append(db_u)
    db.commit()
    return {"inserted": len(created)}
