import os
import sys
import bcrypt
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List

# ── Database ──────────────────────────────────────────────
DATABASE_URL = "sqlite:///./dflex.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Models ────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    adverts = relationship("Advert", back_populates="owner")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    adverts = relationship("Advert", back_populates="category")

class Advert(Base):
    __tablename__ = "adverts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = relationship("Category", back_populates="adverts")
    owner = relationship("User", back_populates="adverts")

Base.metadata.create_all(bind=engine)

# ── Auth ──────────────────────────────────────────────────
SECRET_KEY = "dflex-secret-key-2024"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p, h): return bcrypt.checkpw(p.encode(), h.encode())
def create_token(uid): return jwt.encode({"sub": uid, "exp": datetime.utcnow() + timedelta(hours=24)}, SECRET_KEY, ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        user = db.query(User).filter(User.id == uid).first()
        if not user: raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── Schemas ───────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str; email: str; password: str

class UserLogin(BaseModel):
    email: str; password: str

class AdvertCreate(BaseModel):
    title: str; description: str
    price: Optional[float] = None; location: Optional[str] = None
    contact: Optional[str] = None; image_url: Optional[str] = None
    category_id: Optional[int] = None

class AdvertUpdate(BaseModel):
    title: Optional[str] = None; description: Optional[str] = None
    price: Optional[float] = None; location: Optional[str] = None
    contact: Optional[str] = None; image_url: Optional[str] = None
    category_id: Optional[int] = None; is_active: Optional[bool] = None

# ── App ───────────────────────────────────────────────────
app = FastAPI(title="dFlex API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

SEED_CATS = ["Real Estate","Vehicles","Electronics","Jobs","Services","Fashion","Food & Drinks","Other"]

# ── Routes ────────────────────────────────────────────────
@app.post("/api/auth/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, password_hash=hash_password(data.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_token(user.id), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "created_at": str(user.created_at)}}

@app.post("/api/auth/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token(user.id), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "created_at": str(user.created_at)}}

@app.get("/api/categories/")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    if not cats:
        for n in SEED_CATS: db.add(Category(name=n))
        db.commit(); cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in cats]

@app.get("/api/adverts/")
def list_adverts(search: Optional[str] = None, category_id: Optional[int] = None,
                 min_price: Optional[float] = None, max_price: Optional[float] = None,
                 skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    q = db.query(Advert).filter(Advert.is_active == True)
    if search: q = q.filter(Advert.title.ilike(f"%{search}%"))
    if category_id: q = q.filter(Advert.category_id == category_id)
    if min_price is not None: q = q.filter(Advert.price >= min_price)
    if max_price is not None: q = q.filter(Advert.price <= max_price)
    return [_advert_out(a) for a in q.order_by(Advert.created_at.desc()).offset(skip).limit(limit).all()]

@app.get("/api/adverts/my")
def my_adverts(db: Session = Depends(get_db), u=Depends(get_current_user)):
    return [_advert_out(a) for a in db.query(Advert).filter(Advert.owner_id == u.id).all()]

@app.get("/api/adverts/{advert_id}")
def get_advert(advert_id: int, db: Session = Depends(get_db)):
    a = db.query(Advert).filter(Advert.id == advert_id).first()
    if not a: raise HTTPException(404, "Not found")
    return _advert_out(a)

@app.post("/api/adverts/")
def create_advert(data: AdvertCreate, db: Session = Depends(get_db), u=Depends(get_current_user)):
    a = Advert(**data.dict(), owner_id=u.id)
    db.add(a); db.commit(); db.refresh(a)
    return _advert_out(a)

@app.put("/api/adverts/{advert_id}")
def update_advert(advert_id: int, data: AdvertUpdate, db: Session = Depends(get_db), u=Depends(get_current_user)):
    a = db.query(Advert).filter(Advert.id == advert_id).first()
    if not a: raise HTTPException(404, "Not found")
    if a.owner_id != u.id: raise HTTPException(403, "Forbidden")
    for k, v in data.dict(exclude_unset=True).items(): setattr(a, k, v)
    db.commit(); db.refresh(a)
    return _advert_out(a)

@app.delete("/api/adverts/{advert_id}")
def delete_advert(advert_id: int, db: Session = Depends(get_db), u=Depends(get_current_user)):
    a = db.query(Advert).filter(Advert.id == advert_id).first()
    if not a: raise HTTPException(404, "Not found")
    if a.owner_id != u.id: raise HTTPException(403, "Forbidden")
    db.delete(a); db.commit()
    return {"message": "Deleted"}

def _advert_out(a):
    return {"id": a.id, "title": a.title, "description": a.description,
            "price": a.price, "location": a.location, "contact": a.contact,
            "image_url": a.image_url, "is_active": a.is_active,
            "created_at": str(a.created_at),
            "category": {"id": a.category.id, "name": a.category.name} if a.category else None,
            "owner": {"id": a.owner.id, "name": a.owner.name, "email": a.owner.email, "created_at": str(a.owner.created_at)}}

# ── Static frontend ───────────────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "static")
if os.path.exists(os.path.join(STATIC_DIR, "index.html")):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    @app.get("/{full_path:path}")
    async def frontend(full_path: str):
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    def root(): return {"status": "dFlex API running", "docs": "/docs"}
