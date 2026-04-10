from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_current_user
from typing import List

router = APIRouter()

SEED_CATEGORIES = ["Real Estate", "Vehicles", "Electronics", "Jobs", "Services", "Fashion", "Food & Drinks", "Other"]

@router.get("/", response_model=List[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(models.Category).all()
    if not cats:
        for name in SEED_CATEGORIES:
            db.add(models.Category(name=name))
        db.commit()
        cats = db.query(models.Category).all()
    return cats

@router.post("/", response_model=schemas.CategoryOut)
def create_category(name: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existing = db.query(models.Category).filter(models.Category.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = models.Category(name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
