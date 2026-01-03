from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.models import UserCreate, UserLogin, UserResponse
from app.services import get_password_hash, verify_password, create_access_token, get_current_user
from app.services.user_helper import create_self_conversation

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(user_data: UserCreate):
    db = get_database()
    
    # Kiểm tra tên đăng nhập đã tồn tại chưa
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại"
        )
    
    # Tạo người dùng mới
    user_doc = {
        "username": user_data.username,
        "display_name": user_data.display_name,
        "password_hash": get_password_hash(user_data.password),
        "avatar_url": None,
        "status": "offline",
        "created_at": datetime.now(timezone.utc),
        "last_online": None,
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Tạo cuộc hội thoại "Cloud của tôi"
    await create_self_conversation(db, user_id)
    
    # Tạo token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user_data.username,
            "display_name": user_data.display_name,
        }
    }

@router.post("/login")
async def login(credentials: UserLogin):
    db = get_database()
    
    user = await db.users.find_one({"username": credentials.username})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )
    
    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id})
    
    # Cập nhật thời gian online
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_online": datetime.now(timezone.utc), "status": "online"}}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user["username"],
            "display_name": user["display_name"],
            "avatar_url": user.get("avatar_url"),
        }
    }

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "display_name": current_user["display_name"],
        "avatar_url": current_user.get("avatar_url"),
        "status": current_user.get("status", "offline"),
    }