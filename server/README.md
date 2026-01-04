# Alo Chat Server

Backend API server cho ứng dụng Alo Chat, xây dựng với FastAPI và MongoDB.

---

## Cấu trúc thư mục

```
server/
├── main.py                 # Entry point, WebSocket handlers
├── requirements.txt        # Python dependencies
├── default_users.json      # Seed data cho users mặc định
├── .env                    # Biến môi trường
├── .env.example            # Template cho .env
├── uploads/                # Thư mục lưu trữ file uploads
│   └── avatars/            # Avatar người dùng
└── app/
    ├── __init__.py
    ├── config.py           # Cấu hình ứng dụng (Settings)
    ├── database.py         # Kết nối MongoDB
    ├── seed.py             # Seed data khi khởi động
    ├── models/             # Pydantic schemas
    │   ├── __init__.py
    │   ├── user.py         # User models
    │   ├── conversation.py # Conversation models
    │   ├── message.py      # Message models
    │   └── friendship.py   # Friendship models
    ├── routes/             # API route handlers
    │   ├── __init__.py
    │   ├── auth.py         # Authentication endpoints
    │   ├── conversations.py# Conversation endpoints
    │   ├── users.py        # User endpoints
    │   ├── friends.py      # Friend endpoints
    │   └── files.py        # File upload endpoints
    ├── services/           # Business logic
    │   ├── __init__.py
    │   ├── auth_service.py # JWT, password hashing
    │   └── user_helper.py  # User helper functions
    └── websocket/          # WebSocket handlers
        ├── __init__.py
        └── manager.py      # Connection manager
```

## Yêu cầu hệ thống

- Python 3.10+
- MongoDB 6.0+ (Local hoặc MongoDB Atlas)
- pip (Python package manager)

## Cài đặt

### 1. Tạo virtual environment (khuyến nghị)

```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình environment

Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

## Cấu hình

Các biến môi trường trong file `.env`:

| Biến | Mô tả | Giá trị mặc định |
|------|-------|------------------|
| `APP_NAME` | Tên ứng dụng | `Alo Chat API` |
| `DEBUG` | Chế độ debug | `true` |
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Tên database | `alo_chat` |
| `JWT_SECRET_KEY` | Secret key cho JWT | `secret-key` |
| `JWT_ALGORITHM` | Thuật toán mã hóa JWT | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Thời gian hết hạn token (phút) | `10080` (7 ngày) |
| `CORS_ORIGINS` | Danh sách origins được phép (JSON array) | `["*"]` |

## Chạy server

### Development

```bash
python main.py
```

Hoặc sử dụng uvicorn trực tiếp:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server sẽ chạy tại: `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`


## Technical Documentation

Tài liệu chi tiết về hệ thống kỹ thuật của Alo Chat Server:

- [API Reference Specification](docs/API_REFERENCE.md): Chi tiết về các RESTful API endpoints và WebSocket communication protocol.
- [Database Architecture & Schema](docs/DATABASE_SCHEMA.md): Mô tả cấu trúc dữ liệu, các collections và chỉ mục (indexing).