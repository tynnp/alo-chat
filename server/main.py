from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from bson import ObjectId
import json
import asyncio
import os

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.routes import auth_router, conversations_router, users_router, friends_router, files_router
from app.websocket import manager
from app.services import decode_access_token

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    version="0.2.2",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routes
app.include_router(auth_router, prefix="/api")
app.include_router(conversations_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(friends_router, prefix="/api")
app.include_router(files_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Alo Chat API", "version": "0.2.2"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Xác thực token
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001)
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001)
        return
    
    await manager.connect(websocket, user_id)
    db = get_database()
    
    # Cập nhật trạng thái online
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": "online", "last_online": datetime.now(timezone.utc)}}
    )
    
    # Thông báo cho bạn bè rằng user này đã online
    await notify_friends_status(db, user_id, "online")
    
    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            payload = data.get("data", {})
            
            if event == "ping":
                await websocket.send_json({"event": "pong"})
                continue

            try:
                if event == "message:send":
                    await handle_message_send(user_id, payload, db)
                elif event == "message:read":
                    await handle_message_read(user_id, payload, db)
                elif event == "message:read_all":
                    await handle_conversation_read(user_id, payload, db)
                elif event == "user:typing":
                    await handle_typing(user_id, payload)
            except Exception:
                pass
    
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket, user_id)

        # Chỉ set offline nếu không còn kết nối nào khác
        if not manager.is_user_online(user_id):
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"status": "offline", "last_online": datetime.now(timezone.utc)}}
            )

            # Thông báo cho bạn bè rằng user này đã offline
            await notify_friends_status(db, user_id, "offline")

async def notify_friends_status(db, user_id: str, status: str):
    cursor = db.friendships.find({
        "status": "accepted",
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id": user_id}
        ]
    })
    friendships = await cursor.to_list(100)
    
    friend_ids = []
    for fs in friendships:
        friend_id = fs["to_user_id"] if fs["from_user_id"] == user_id else fs["from_user_id"]
        friend_ids.append(friend_id)
    
    if friend_ids:
        payload = {"userId": user_id, "status": status}
        if status == "offline":
            payload["lastOnline"] = datetime.now(timezone.utc).isoformat()
            
        await manager.broadcast_to_users({
            "event": "user:status",
            "payload": payload
        }, friend_ids)

async def handle_message_send(sender_id: str, payload: dict, db):
    conversation_id = payload.get("conversationId")
    content = payload.get("content")
    msg_type = payload.get("type", "text")
    file_url = payload.get("fileUrl")
    file_name = payload.get("fileName")
    
    now = datetime.now(timezone.utc)
    
    # Tạo tin nhắn
    message = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "content": content,
        "type": msg_type,
        "file_url": file_url,
        "file_name": file_name,
        "status": [{"user_id": sender_id, "status": "sent", "at": now}],
        "created_at": now,
    }
    
    result = await db.messages.insert_one(message)
    
    client_id = payload.get("clientId")
    
    sender = await db.users.find_one({"_id": ObjectId(sender_id)})
    sender_name = sender.get("display_name", "Người dùng") if sender else "Người dùng"
    sender_avatar = sender.get("avatar_url") if sender else None

    ws_message = {
        "_id": str(result.inserted_id),
        "clientId": client_id,
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "sender_avatar": sender_avatar,
        "content": content,
        "type": msg_type,
        "file_url": file_url,
        "file_name": file_name,
        "status": [{"user_id": sender_id, "status": "sent", "at": now.isoformat()}],
        "created_at": now.isoformat(),
    }

    await manager.send_personal_message({
        "event": "message:new",
        "payload": ws_message
    }, sender_id)
    
    async def background_tasks():
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"last_message_at": now}}
        )
        
        conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            return
            
        member_ids = [m["user_id"] for m in conversation["members"]]
        other_member_ids = [uid for uid in member_ids if uid != sender_id]
        
        if other_member_ids:
            await manager.broadcast_to_users({
                "event": "message:new",
                "payload": ws_message
            }, other_member_ids)

    asyncio.create_task(background_tasks())

async def handle_conversation_read(user_id: str, payload: dict, db):
    conversation_id = payload.get("conversationId")
    if not conversation_id:
        return
        
    await db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": user_id},
            "status.user_id": {"$ne": user_id}
        },
        {"$push": {"status": {"user_id": user_id, "status": "read", "at": datetime.now(timezone.utc)}}}
    )
    
    conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if conversation:
        member_ids = [m["user_id"] for m in conversation["members"] if m["user_id"] != user_id]
        if member_ids:
            asyncio.create_task(manager.broadcast_to_users({
                "event": "message:read_all",
                "payload": {
                    "conversationId": conversation_id,
                    "userId": user_id
                }
            }, member_ids))

async def handle_message_read(user_id: str, payload: dict, db):
    conversation_id = payload.get("conversationId")
    message_id = payload.get("messageId")
    
    await db.messages.update_one(
        {"_id": ObjectId(message_id)},
        {"$push": {"status": {"user_id": user_id, "status": "read", "at": datetime.now(timezone.utc)}}}
    )
    
    # Thông báo cho người gửi
    message = await db.messages.find_one({"_id": ObjectId(message_id)})
    if message:
        await manager.send_personal_message({
            "event": "message:status",
            "payload": {
                "conversationId": conversation_id,
                "messageId": message_id,
                "status": "read",
                "userId": user_id
            }
        }, message["sender_id"])

async def handle_typing(user_id: str, payload: dict):
    conversation_id = payload.get("conversationId")
    db = get_database()
    
    conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if conversation:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        user_name = user.get("display_name", user.get("username", "Người dùng")) if user else "Người dùng"
        
        member_ids = [m["user_id"] for m in conversation["members"] if m["user_id"] != user_id]
        asyncio.create_task(manager.broadcast_to_users({
            "event": "user:typing",
            "payload": {"conversationId": conversation_id, "userId": user_id, "userName": user_name}
        }, member_ids))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)