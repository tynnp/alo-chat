from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    avatar_url: Optional[str] = None
    status: str = "offline"
    created_at: datetime
    
    class Config:
        populate_by_name = True

class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    password_hash: str
    avatar_url: Optional[str] = None
    status: str = "offline"
    created_at: datetime
    last_online: Optional[datetime] = None