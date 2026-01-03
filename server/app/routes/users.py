from fastapi import APIRouter, Depends, UploadFile, File
import os
import uuid
from bson import ObjectId
from app.database import get_database
from app.services import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/search")
async def search_users(q: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    cursor = db.users.find({
        "username": {"$regex": q, "$options": "i"},
        "_id": {"$ne": ObjectId(current_user["_id"])}
    }).limit(20)
    
    users = await cursor.to_list(20)
    
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "display_name": user["display_name"],
            "avatar_url": user.get("avatar_url"),
            "status": user.get("status", "offline"),
        })
    
    return {"users": result}

@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    settings = get_settings()
    db = get_database()
    
    avatar_dir = os.path.join("uploads", "avatars")
    if not os.path.exists(avatar_dir):
        os.makedirs(avatar_dir)

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(avatar_dir, filename)
    
    # Lưu file
    with open(file_path, "wb") as f:
        f.write(await file.read())
    avatar_url = f"/uploads/avatars/{filename}"
    
    # Cập nhật database
    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"avatar_url": avatar_url}}
    )
    
    return {"avatar_url": avatar_url}

@router.get("/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "Người dùng không tồn tại"}
    
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "display_name": user["display_name"],
        "avatar_url": user.get("avatar_url"),
        "status": user.get("status", "offline"),
    }