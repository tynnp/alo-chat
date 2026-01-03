from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    
    # Tạo indexes
    await db.users.create_index("username", unique=True)
    await db.conversations.create_index("members.user_id")
    await db.messages.create_index([("conversation_id", 1), ("created_at", -1)])
    
    print(f"Đã kết nối MongoDB: {settings.MONGODB_DB_NAME}")
    
    # Chạy seed data
    from app.seed import run_seed
    from app.services import get_password_hash
    await run_seed(db, get_password_hash)

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Đã đóng kết nối MongoDB")

def get_database():
    return db