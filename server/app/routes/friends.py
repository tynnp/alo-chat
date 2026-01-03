from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId
from typing import List
from app.database import get_database
from app.models.friendship import FriendRequestCreate, FriendRequestResponse, FriendResponse
from app.services import get_current_user
from app.websocket import manager

router = APIRouter(prefix="/friends", tags=["Friends"])

async def get_user_info(db, user_id: str):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        info = {
            "id": str(user["_id"]),
            "username": user["username"],
            "display_name": user.get("display_name", user["username"]),
            "avatar_url": user.get("avatar_url"),
            "status": user.get("status", "offline"),
        }
        if user.get("last_online"):
            last = user["last_online"]
            info["last_online"] = last.replace(tzinfo=timezone.utc).isoformat() if isinstance(last, datetime) else last
        return info
    return None

async def are_friends(db, user1_id: str, user2_id: str) -> bool:
    friendship = await db.friendships.find_one({
        "status": "accepted",
        "$or": [
            {"from_user_id": user1_id, "to_user_id": user2_id},
            {"from_user_id": user2_id, "to_user_id": user1_id}
        ]
    })
    return friendship is not None

@router.get("")
async def get_friends(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    # Tìm tất cả friendships đã accepted
    cursor = db.friendships.find({
        "status": "accepted",
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id": user_id}
        ]
    })
    friendships = await cursor.to_list(100)
    
    friends = []
    for fs in friendships:
        friend_id = fs["to_user_id"] if fs["from_user_id"] == user_id else fs["from_user_id"]
        friend_info = await get_user_info(db, friend_id)
        if friend_info:
            friends.append(friend_info)
    
    return {"friends": friends}

@router.get("/requests")
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    """Lấy danh sách lời mời kết bạn đang chờ"""
    db = get_database()
    user_id = current_user["_id"]
    
    cursor = db.friendships.find({
        "to_user_id": user_id,
        "status": "pending"
    }).sort("created_at", -1)
    requests = await cursor.to_list(50)
    
    result = []
    for req in requests:
        from_user = await get_user_info(db, req["from_user_id"])
        if from_user:
            result.append({
                "id": str(req["_id"]),
                "from_user_id": req["from_user_id"],
                "from_user_name": from_user["display_name"],
                "from_user_avatar": from_user.get("avatar_url"),
                "to_user_id": req["to_user_id"],
                "to_user_name": current_user.get("display_name", ""),
                "to_user_avatar": current_user.get("avatar_url"),
                "status": req["status"],
                "created_at": req["created_at"]
            })
    
    return {"requests": result}

@router.get("/sent")
async def get_sent_requests(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    cursor = db.friendships.find({
        "from_user_id": user_id,
        "status": "pending"
    }).sort("created_at", -1)
    requests = await cursor.to_list(50)
    
    result = []
    for req in requests:
        to_user = await get_user_info(db, req["to_user_id"])
        if to_user:
            result.append({
                "id": str(req["_id"]),
                "to_user_id": req["to_user_id"],
                "to_user_name": to_user["display_name"],
                "to_user_avatar": to_user.get("avatar_url"),
                "status": req["status"],
                "created_at": req["created_at"]
            })
    
    return {"sent_requests": result}

@router.post("/request")
async def send_friend_request(data: FriendRequestCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    to_user_id = data.to_user_id
    
    # Không thể kết bạn với chính mình
    if user_id == to_user_id:
        raise HTTPException(status_code=400, detail="Không thể kết bạn với chính mình")
    
    # Kiểm tra người nhận tồn tại
    to_user = await db.users.find_one({"_id": ObjectId(to_user_id)})
    if not to_user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    
    # Kiểm tra đã là bạn bè chưa
    if await are_friends(db, user_id, to_user_id):
        raise HTTPException(status_code=400, detail="Hai người đã là bạn bè")
    
    # Kiểm tra đã có lời mời pending chưa
    existing = await db.friendships.find_one({
        "status": "pending",
        "$or": [
            {"from_user_id": user_id, "to_user_id": to_user_id},
            {"from_user_id": to_user_id, "to_user_id": user_id}
        ]
    })
    if existing:
        if existing["from_user_id"] == user_id:
            raise HTTPException(status_code=400, detail="Bạn đã gửi lời mời rồi")
        else:
            raise HTTPException(status_code=400, detail="Người này đã gửi lời mời cho bạn, hãy chấp nhận")
    
    # Tạo friend request
    friend_request = {
        "from_user_id": user_id,
        "to_user_id": to_user_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "accepted_at": None,
        "rejected_at": None
    }
    
    result = await db.friendships.insert_one(friend_request)
    request_id = str(result.inserted_id)
    
    # Gửi WebSocket notification đến người nhận
    from_user_info = await get_user_info(db, user_id)
    await manager.send_personal_message({
        "event": "friend:request_received",
        "payload": {
            "id": request_id,
            "from_user_id": user_id,
            "from_user_name": from_user_info["display_name"] if from_user_info else "",
            "from_user_avatar": from_user_info.get("avatar_url") if from_user_info else None,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
    }, to_user_id)
    
    return {"message": "Đã gửi lời mời kết bạn", "request_id": request_id}

@router.post("/accept/{request_id}")
async def accept_friend_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Chấp nhận lời mời kết bạn"""
    db = get_database()
    user_id = current_user["_id"]
    
    # Tìm request
    request = await db.friendships.find_one({
        "_id": ObjectId(request_id),
        "to_user_id": user_id,
        "status": "pending"
    })
    
    if not request:
        raise HTTPException(status_code=404, detail="Không tìm thấy lời mời")
    
    # Cập nhật status
    await db.friendships.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "accepted", "accepted_at": datetime.utcnow()}}
    )
    
    # Gửi WebSocket notification đến người đã gửi lời mời
    from_user_id = request["from_user_id"]
    current_user_info = await get_user_info(db, user_id)
    
    await manager.send_personal_message({
        "event": "friend:request_accepted",
        "payload": {
            "request_id": request_id,
            "new_friend": current_user_info
        }
    }, from_user_id)
    
    return {"message": "Đã chấp nhận lời mời kết bạn"}

@router.post("/reject/{request_id}")
async def reject_friend_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Từ chối lời mời kết bạn"""
    db = get_database()
    user_id = current_user["_id"]
    
    # Tìm request
    request = await db.friendships.find_one({
        "_id": ObjectId(request_id),
        "to_user_id": user_id,
        "status": "pending"
    })
    
    if not request:
        raise HTTPException(status_code=404, detail="Không tìm thấy lời mời")
    
    # Cập nhật status
    await db.friendships.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected", "rejected_at": datetime.utcnow()}}
    )
    
    return {"message": "Đã từ chối lời mời kết bạn"}

@router.delete("/{friend_id}")
async def unfriend(friend_id: str, current_user: dict = Depends(get_current_user)):
    """Hủy kết bạn"""
    db = get_database()
    user_id = current_user["_id"]
    
    # Xóa friendship
    result = await db.friendships.delete_one({
        "status": "accepted",
        "$or": [
            {"from_user_id": user_id, "to_user_id": friend_id},
            {"from_user_id": friend_id, "to_user_id": user_id}
        ]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy quan hệ bạn bè")
    
    return {"message": "Đã hủy kết bạn"}

@router.delete("/request/{request_id}")
async def cancel_friend_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Hủy lời mời kết bạn đã gửi"""
    db = get_database()
    user_id = current_user["_id"]
    
    result = await db.friendships.delete_one({
        "_id": ObjectId(request_id),
        "from_user_id": user_id,
        "status": "pending"
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy lời mời")
    
    return {"message": "Đã hủy lời mời kết bạn"}