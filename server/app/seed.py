from datetime import datetime, timezone
from app.services.user_helper import create_self_conversation

# Tài khoản mặc định
DEFAULT_USERS = [
    {
        "username": "admin",
        "display_name": "Quản trị viên",
        "password": "admin123",
        "is_admin": True,
    },
    {
        "username": "user1",
        "display_name": "Người dùng 1",
        "password": "user123",
        "is_admin": False,
    },
    {
        "username": "user2", 
        "display_name": "Người dùng 2",
        "password": "user123",
        "is_admin": False,
    },
]

async def seed_users(db, get_password_hash):
    created_users = []
    
    for user_data in DEFAULT_USERS:
        # Kiểm tra user đã tồn tại chưa
        existing = await db.users.find_one({"username": user_data["username"]})
        if existing:
            continue
        
        # Tạo user mới
        user_doc = {
            "username": user_data["username"],
            "display_name": user_data["display_name"],
            "password_hash": get_password_hash(user_data["password"]),
            "avatar_url": None,
            "status": "offline",
            "is_admin": user_data.get("is_admin", False),
            "created_at": datetime.now(timezone.utc),
            "last_online": None,
        }
        
        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Tạo cuộc hội thoại "Cloud của tôi"
        await create_self_conversation(db, user_id)
        
        created_users.append(user_data["username"])
    
    return created_users

async def run_seed(db, get_password_hash):
    await seed_users(db, get_password_hash)
