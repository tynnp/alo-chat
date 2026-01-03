from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from bson import ObjectId
import json

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.routes import auth_router, conversations_router, users_router
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
    version="0.1.0",
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

# Routes
app.include_router(auth_router, prefix="/api")
app.include_router(conversations_router, prefix="/api")
app.include_router(users_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Alo Chat API", "version": "0.1.0"}

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
        {"$set": {"status": "online", "last_online": datetime.utcnow()}}
    )
    
    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            payload = data.get("data", {})
            
            if event == "message:send":
                await handle_message_send(user_id, payload, db)
            elif event == "message:read":
                await handle_message_read(user_id, payload, db)
            elif event == "user:typing":
                await handle_typing(user_id, payload)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"status": "offline", "last_online": datetime.utcnow()}}
        )

async def handle_message_send(sender_id: str, payload: dict, db):
    conversation_id = payload.get("conversationId")
    content = payload.get("content")
    msg_type = payload.get("type", "text")
    
    # Tạo tin nhắn
    message = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "content": content,
        "type": msg_type,
        "status": [{"user_id": sender_id, "status": "sent", "at": datetime.utcnow()}],
        "created_at": datetime.utcnow(),
    }
    
    result = await db.messages.insert_one(message)
    message["_id"] = str(result.inserted_id)
    
    # Cập nhật thời gian tin nhắn cuối
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"last_message_at": datetime.utcnow()}}
    )
    
    # Lấy danh sách thành viên
    conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    member_ids = [m["user_id"] for m in conversation["members"]]
    
    # Gửi đến tất cả thành viên
    await manager.broadcast_to_users({
        "event": "message:new",
        "payload": message
    }, member_ids)

async def handle_message_read(user_id: str, payload: dict, db):
    conversation_id = payload.get("conversationId")
    message_id = payload.get("messageId")
    
    await db.messages.update_one(
        {"_id": ObjectId(message_id)},
        {"$push": {"status": {"user_id": user_id, "status": "read", "at": datetime.utcnow()}}}
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
        member_ids = [m["user_id"] for m in conversation["members"] if m["user_id"] != user_id]
        await manager.broadcast_to_users({
            "event": "user:typing",
            "payload": {"conversationId": conversation_id, "userId": user_id}
        }, member_ids)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)