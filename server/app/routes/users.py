from fastapi import APIRouter, Depends
from bson import ObjectId
from app.database import get_database
from app.services import get_current_user

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