from datetime import datetime
from bson import ObjectId

async def create_self_conversation(db, user_id: str):
    """Tạo cuộc hội thoại 'Cloud của tôi' cho user"""
    self_conversation = {
        "type": "self",
        "name": "Cloud của tôi",
        "members": [{"user_id": user_id, "role": "admin", "joined_at": datetime.utcnow()}],
        "created_by": user_id,
        "created_at": datetime.utcnow(),
        "last_message_at": None,
    }
    await db.conversations.insert_one(self_conversation)
