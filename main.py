import os
import sys
import bcrypt
import secrets
import smtplib
import threading
import urllib.request
from email.mime.text import MIMEText
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, Session, relationship, DeclarativeBase
from pydantic import BaseModel
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List

class Base(DeclarativeBase):
    pass

# ── Database ──────────────────────────────────────────────
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://dflex_db_n34u_user:FDfnGatpYo1yYDLaRmRCFmB3VdraZLVG@dpg-d7e6c9vlk1mc73f5hkk0-a.oregon-postgres.render.com:5432/dflex_db_n34u"
)
# Fix for SQLAlchemy — replace postgres:// with postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
    plan = Column(String, default="free")  # free, basic, pro
    is_verified = Column(Boolean, default=False)
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
    video_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    currency = Column(String, default="USD")
    created_at = Column(DateTime, default=datetime.utcnow)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = relationship("Category", back_populates="adverts")
    owner = relationship("User", back_populates="adverts")

class PasswordReset(Base):
    __tablename__ = "password_resets"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# ── Monetization Models ───────────────────────────────────
class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan = Column(String, nullable=False)  # free, basic, pro
    status = Column(String, default="active")
    paystack_ref = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    user = relationship("User")

class BannerAd(Base):
    __tablename__ = "banner_ads"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    link_url = Column(String, nullable=True)
    advertiser = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    starts_at = Column(DateTime, default=datetime.utcnow)
    ends_at = Column(DateTime, nullable=True)
    paystack_ref = Column(String, nullable=True)

class Commission(Base):
    __tablename__ = "commissions"
    id = Column(Integer, primary_key=True, index=True)
    advert_id = Column(Integer, ForeignKey("adverts.id"), nullable=False)
    buyer_name = Column(String, nullable=False)
    buyer_email = Column(String, nullable=False)
    deal_amount = Column(Float, nullable=False)
    commission_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, paid
    paystack_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    advert = relationship("Advert")

class VerificationRequest(Base):
    __tablename__ = "verification_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, verified, rejected
    paystack_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

Base.metadata.create_all(bind=engine)

# Keep-alive: ping self every 10 minutes to prevent Render free tier sleep
def keep_alive():
    import time
    time.sleep(60)  # wait 1 min after startup
    while True:
        try:
            port = os.environ.get("PORT", "10000")
            urllib.request.urlopen(f"http://localhost:{port}/ping", timeout=10)
        except:
            pass
        time.sleep(600)  # every 10 minutes

threading.Thread(target=keep_alive, daemon=True).start()

# Run migration to add new columns if they don't exist
try:
    with engine.connect() as conn:
        for col, typedef in [
            ("currency", "VARCHAR DEFAULT 'NGN'"),
            ("video_url", "VARCHAR"),
        ]:
            try:
                conn.execute(__import__('sqlalchemy').text(
                    f"ALTER TABLE adverts ADD COLUMN IF NOT EXISTS {col} {typedef}"
                ))
            except:
                pass
        # Add user monetization columns
        for col, typedef in [
            ("plan", "VARCHAR DEFAULT 'free'"),
            ("is_verified", "BOOLEAN DEFAULT FALSE"),
        ]:
            try:
                conn.execute(__import__('sqlalchemy').text(
                    f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} {typedef}"
                ))
            except:
                pass
        conn.commit()
except:
    pass

# ── Auth ──────────────────────────────────────────────────
SECRET_KEY = "dflex-secret-key-2024"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p, h): return bcrypt.checkpw(p.encode(), h.encode())
def create_token(uid): return jwt.encode({"sub": str(uid), "exp": datetime.utcnow() + timedelta(days=30)}, SECRET_KEY, ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == int(uid)).first()
        if not user: raise HTTPException(status_code=401, detail="User not found")
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
    video_url: Optional[str] = None
    category_id: Optional[int] = None; currency: Optional[str] = "NGN"

class AdvertUpdate(BaseModel):
    title: Optional[str] = None; description: Optional[str] = None
    price: Optional[float] = None; location: Optional[str] = None
    contact: Optional[str] = None; image_url: Optional[str] = None
    video_url: Optional[str] = None
    category_id: Optional[int] = None; is_active: Optional[bool] = None
    currency: Optional[str] = None

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str

# Email config — set these as Render env vars
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
APP_URL = os.environ.get("APP_URL", "https://dflex-fdya.onrender.com")

def send_reset_email(to_email: str, token: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return False
    reset_link = f"{APP_URL}/reset-password?token={token}"
    body = f"""Hi,

You requested a password reset for your dFlex account.

Click the link below to reset your password (valid for 1 hour):
{reset_link}

If you didn't request this, ignore this email.

— dFlex Team
"""
    msg = MIMEText(body)
    msg["Subject"] = "dFlex — Reset Your Password"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

# ── App ───────────────────────────────────────────────────
app = FastAPI(title="dFlex API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

SEED_CATS = ["Real Estate","Vehicles","Electronics","Jobs","Services","Fashion","Food & Drinks","Other"]

@app.get("/ping")
async def ping():
    return {"status": "ok"}

@app.get("/sitemap.xml")
async def sitemap():
    from fastapi.responses import Response
    xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://dflex-fdya.onrender.com/</loc><priority>1.0</priority></url>
  <url><loc>https://dflex-fdya.onrender.com/register</loc><priority>0.9</priority></url>
  <url><loc>https://dflex-fdya.onrender.com/login</loc><priority>0.8</priority></url>
  <url><loc>https://dflex-fdya.onrender.com/post</loc><priority>0.8</priority></url>
</urlset>"""
    return Response(content=xml, media_type="application/xml")

@app.get("/robots.txt")
async def robots():
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("User-agent: *\nAllow: /\nSitemap: https://dflex-fdya.onrender.com/sitemap.xml")

# ── Paystack Config ───────────────────────────────────────
PAYSTACK_SECRET = os.environ.get("PAYSTACK_SECRET_KEY", "")
PAYSTACK_PUBLIC = os.environ.get("PAYSTACK_PUBLIC_KEY", "")

PLANS = {
    "free":  {"name": "Free",  "price": 0,     "adverts": 3,   "features": ["3 adverts/month", "Photo upload"]},
    "basic": {"name": "Basic", "price": 200000, "adverts": 10,  "features": ["10 adverts/month", "Photo & video upload", "Priority listing"]},
    "pro":   {"name": "Pro",   "price": 500000, "adverts": 999, "features": ["Unlimited adverts", "Photo & video upload", "Featured badge", "Top placement"]},
}
COMMISSION_RATE = 0.02   # 2%
VERIFICATION_FEE = 100000  # ₦1,000 in kobo
BANNER_FEE = 1000000       # ₦10,000/month in kobo

# ── Monetization Schemas ──────────────────────────────────
class PaystackVerify(BaseModel):
    reference: str

class CommissionReport(BaseModel):
    advert_id: int
    buyer_name: str
    buyer_email: str
    deal_amount: float

class BannerAdCreate(BaseModel):
    title: str
    image_url: str
    link_url: Optional[str] = None
    advertiser: str

# ── Routes ────────────────────────────────────────────────
@app.post("/api/auth/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, password_hash=hash_password(data.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_token(user.id), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email,
                     "plan": user.plan, "is_verified": user.is_verified,
                     "created_at": str(user.created_at)}}

@app.post("/api/auth/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token(user.id), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email,
                     "plan": user.plan, "is_verified": user.is_verified,
                     "created_at": str(user.created_at)}}

@app.get("/api/auth/me")
def get_me(u=Depends(get_current_user)):
    return {"id": u.id, "name": u.name, "email": u.email,
            "plan": u.plan, "is_verified": u.is_verified,
            "created_at": str(u.created_at)}

@app.post("/api/auth/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    # Always return success to prevent email enumeration
    if user:
        # Delete old tokens for this email
        db.query(PasswordReset).filter(PasswordReset.email == data.email).delete()
        token = secrets.token_urlsafe(32)
        db.add(PasswordReset(email=data.email, token=token))
        db.commit()
        sent = send_reset_email(data.email, token)
        if not sent:
            # Return token in response if email not configured (dev mode)
            return {"message": "Reset link generated", "reset_token": token, "note": "Email not configured — use this token directly"}
    return {"message": "If that email exists, a reset link has been sent"}

@app.post("/api/auth/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    reset = db.query(PasswordReset).filter(PasswordReset.token == data.token).first()
    if not reset:
        raise HTTPException(400, "Invalid or expired reset token")
    # Check token is less than 1 hour old
    if (datetime.utcnow() - reset.created_at).total_seconds() > 3600:
        db.delete(reset); db.commit()
        raise HTTPException(400, "Reset token has expired")
    user = db.query(User).filter(User.email == reset.email).first()
    if not user:
        raise HTTPException(400, "User not found")
    user.password_hash = hash_password(data.new_password)
    db.delete(reset)
    db.commit()
    return {"message": "Password reset successfully"}

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
            "image_url": a.image_url, "video_url": getattr(a, 'video_url', None),
            "is_active": a.is_active, "currency": a.currency or "NGN",
            "created_at": str(a.created_at),
            "category": {"id": a.category.id, "name": a.category.name} if a.category else None,
            "owner": {"id": a.owner.id, "name": a.owner.name, "email": a.owner.email, "created_at": str(a.owner.created_at)}}

# ── Monetization Routes ───────────────────────────────────

# Plans info
@app.get("/api/plans")
def get_plans():
    return PLANS

# Initialize Paystack payment
@app.post("/api/payments/initialize")
def init_payment(data: dict, u=Depends(get_current_user)):
    import json as _json
    payment_type = data.get("type")  # subscription, verification, banner, commission
    plan = data.get("plan", "basic")

    amount_map = {
        "subscription_basic": 200000,
        "subscription_pro": 500000,
        "verification": VERIFICATION_FEE,
        "banner": BANNER_FEE,
    }
    amount = amount_map.get(f"{payment_type}_{plan}" if payment_type == "subscription" else payment_type, 0)
    if not amount:
        raise HTTPException(400, "Invalid payment type")

    if not PAYSTACK_SECRET:
        # Demo mode — return mock reference
        ref = secrets.token_hex(8)
        return {"authorization_url": f"https://dflex-fdya.onrender.com/pricing?demo=1&ref={ref}", "reference": ref, "demo": True}

    payload = _json.dumps({
        "email": u.email,
        "amount": amount,
        "reference": secrets.token_hex(16),
        "metadata": {"payment_type": payment_type, "plan": plan, "user_id": u.id}
    }).encode()
    req = urllib.request.Request("https://api.paystack.co/transaction/initialize",
        data=payload, headers={"Authorization": f"Bearer {PAYSTACK_SECRET}", "Content-Type": "application/json"})
    try:
        res = urllib.request.urlopen(req)
        result = _json.loads(res.read())
        return result.get("data", {})
    except Exception as e:
        raise HTTPException(500, f"Payment init failed: {e}")

# Verify Paystack payment
@app.post("/api/payments/verify")
def verify_payment(data: PaystackVerify, db: Session = Depends(get_db), u=Depends(get_current_user)):
    import json as _json
    ref = data.reference

    if not PAYSTACK_SECRET:
        # Demo mode — just activate based on ref pattern
        return {"status": "success", "message": "Demo payment verified"}

    req = urllib.request.Request(f"https://api.paystack.co/transaction/verify/{ref}",
        headers={"Authorization": f"Bearer {PAYSTACK_SECRET}"})
    try:
        res = urllib.request.urlopen(req)
        result = _json.loads(res.read())
        tx = result.get("data", {})
        if tx.get("status") != "success":
            raise HTTPException(400, "Payment not successful")
        meta = tx.get("metadata", {})
        payment_type = meta.get("payment_type")
        plan = meta.get("plan")

        if payment_type == "subscription":
            u.plan = plan
            db.add(Subscription(user_id=u.id, plan=plan, paystack_ref=ref,
                expires_at=datetime.utcnow() + timedelta(days=30)))
        elif payment_type == "verification":
            u.is_verified = True
            db.add(VerificationRequest(user_id=u.id, status="verified", paystack_ref=ref))
        db.commit()
        return {"status": "success", "plan": u.plan, "is_verified": u.is_verified}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Verification failed: {e}")

# Get subscription status
@app.get("/api/subscription")
def get_subscription(u=Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.user_id == u.id, Subscription.status == "active").order_by(Subscription.id.desc()).first()
    return {"plan": u.plan, "is_verified": u.is_verified,
            "expires_at": str(sub.expires_at) if sub else None,
            "plans": PLANS}

# Commission report (buyer reports a deal)
@app.post("/api/commissions")
def report_commission(data: CommissionReport, db: Session = Depends(get_db)):
    advert = db.query(Advert).filter(Advert.id == data.advert_id).first()
    if not advert: raise HTTPException(404, "Advert not found")
    commission = data.deal_amount * COMMISSION_RATE
    c = Commission(advert_id=data.advert_id, buyer_name=data.buyer_name,
                   buyer_email=data.buyer_email, deal_amount=data.deal_amount,
                   commission_amount=commission)
    db.add(c); db.commit(); db.refresh(c)
    return {"commission_amount": commission, "rate": f"{COMMISSION_RATE*100}%",
            "message": f"Commission of ₦{commission:,.0f} recorded. Payment link will be sent to {data.buyer_email}"}

# Get active banners
@app.get("/api/banners")
def get_banners(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    banners = db.query(BannerAd).filter(
        BannerAd.is_active == True,
        (BannerAd.ends_at == None) | (BannerAd.ends_at > now)
    ).all()
    return [{"id": b.id, "title": b.title, "image_url": b.image_url,
             "link_url": b.link_url, "advertiser": b.advertiser} for b in banners]

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
