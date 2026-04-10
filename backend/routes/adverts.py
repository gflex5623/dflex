from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.AdvertOut])
def list_adverts(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    q = db.query(models.Advert).filter(models.Advert.is_active == True)
    if search:
        q = q.filter(models.Advert.title.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(models.Advert.category_id == category_id)
    if min_price is not None:
        q = q.filter(models.Advert.price >= min_price)
    if max_price is not None:
        q = q.filter(models.Advert.price <= max_price)
    return q.order_by(models.Advert.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/my", response_model=List[schemas.AdvertOut])
def my_adverts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Advert).filter(models.Advert.owner_id == current_user.id).all()

@router.get("/{advert_id}", response_model=schemas.AdvertOut)
def get_advert(advert_id: int, db: Session = Depends(get_db)):
    advert = db.query(models.Advert).filter(models.Advert.id == advert_id).first()
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")
    return advert

@router.post("/", response_model=schemas.AdvertOut)
def create_advert(data: schemas.AdvertCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    advert = models.Advert(**data.dict(), owner_id=current_user.id)
    db.add(advert)
    db.commit()
    db.refresh(advert)
    return advert

@router.put("/{advert_id}", response_model=schemas.AdvertOut)
def update_advert(advert_id: int, data: schemas.AdvertUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    advert = db.query(models.Advert).filter(models.Advert.id == advert_id).first()
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")
    if advert.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(advert, key, value)
    db.commit()
    db.refresh(advert)
    return advert

@router.delete("/{advert_id}")
def delete_advert(advert_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    advert = db.query(models.Advert).filter(models.Advert.id == advert_id).first()
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")
    if advert.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(advert)
    db.commit()
    return {"message": "Advert deleted"}
