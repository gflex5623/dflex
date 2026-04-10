from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Auth
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Category
class CategoryOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

# Advert
class AdvertCreate(BaseModel):
    title: str
    description: str
    price: Optional[float] = None
    location: Optional[str] = None
    contact: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class AdvertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    contact: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class AdvertOut(BaseModel):
    id: int
    title: str
    description: str
    price: Optional[float]
    location: Optional[str]
    contact: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    category: Optional[CategoryOut]
    owner: UserOut
    class Config:
        from_attributes = True
