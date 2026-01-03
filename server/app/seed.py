import os
import json
from datetime import datetime, timezone
from app.services.user_helper import create_self_conversation

async def seed_users(db, get_password_hash):
    json_path = os.path.join(os.getcwd(), "default_users.json")
    
    if not os.path.exists(json_path):
        print(f"Dữ liệu mẫu: Không tìm thấy {json_path}. Bỏ qua bước tạo tài khoản mặc định.")
        return []

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            default_users = json.load(f)
    except Exception as e:
        print(f"Lỗi dữ liệu mẫu: Không thể tải file {json_path}: {e}")
        return []

    created_users = []
    
    for user_data in default_users:
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
