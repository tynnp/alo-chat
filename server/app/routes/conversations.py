from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import List
from app.database import get_database
from app.models import ConversationCreate, ConversationResponse
from app.services import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    cursor = db.conversations.find({"members.user_id": user_id}).sort("last_message_at", -1)
    conversations = await cursor.to_list(100)
    
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    
    return {"conversations": conversations}

@router.post("")
async def create_conversation(data: ConversationCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    if data.type == "private":
        if len(data.member_ids) != 1:
            raise HTTPException(status_code=400, detail="Chat riêng cần đúng 1 thành viên khác")
        
        other_user_id = data.member_ids[0]
        
        # Kiểm tra cuộc hội thoại riêng đã tồn tại chưa
        existing = await db.conversations.find_one({
            "type": "private",
            "members.user_id": {"$all": [user_id, other_user_id]}
        })
        if existing:
            existing["_id"] = str(existing["_id"])
            return existing
    
    members = [{"user_id": user_id, "role": "admin", "joined_at": datetime.utcnow()}]
    for member_id in data.member_ids:
        members.append({"user_id": member_id, "role": "member", "joined_at": datetime.utcnow()})
    
    conversation = {
        "type": data.type,
        "name": data.name,
        "members": members,
        "created_by": user_id,
        "created_at": datetime.utcnow(),
        "last_message_at": None,
    }
    
    result = await db.conversations.insert_one(conversation)
    conversation["_id"] = str(result.inserted_id)
    
    return conversation


@router.get("/{conversation_id}/messages")
async def get_messages(conversation_id: str, limit: int = 50, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    # Xác minh người dùng là thành viên
    conversation = await db.conversations.find_one({
        "_id": ObjectId(conversation_id),
        "members.user_id": user_id
    })
    if not conversation:
        raise HTTPException(status_code=404, detail="Không tìm thấy cuộc hội thoại")
    
    cursor = db.messages.find({"conversation_id": conversation_id}).sort("created_at", -1).limit(limit)
    messages = await cursor.to_list(limit)
    
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    
    return {"messages": list(reversed(messages))}

@router.post("/{conversation_id}/members")
async def add_member(conversation_id: str, member_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    conversation = await db.conversations.find_one({
        "_id": ObjectId(conversation_id),
        "members": {"$elemMatch": {"user_id": user_id, "role": "admin"}}
    })
    if not conversation:
        raise HTTPException(status_code=403, detail="Chỉ admin mới có thể thêm thành viên")
    
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$push": {"members": {"user_id": member_id, "role": "member", "joined_at": datetime.utcnow()}}}
    )
    
    return {"message": "Đã thêm thành viên"}