<div align="center">

# Alo Chat

<img src="https://img.shields.io/badge/version-0.1.0--beta-blue?style=for-the-badge" alt="Version" />
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
<img src="https://img.shields.io/badge/status-Active-success?style=for-the-badge" alt="Status" />

<br/>

**Ứng dụng nhắn tin thời gian thực đa nền tảng, xây dựng với React, Tauri và FastAPI**

</div>

## Công nghệ Sử dụng

<table>
<tr>
<td align="center" width="50%">

### Frontend

<img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4.1.18-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
<img src="https://img.shields.io/badge/Tauri-2.9.1-FFC131?style=flat-square&logo=tauri&logoColor=white" alt="Tauri" />

</td>
<td align="center" width="50%">

### Backend

<img src="https://img.shields.io/badge/FastAPI-0.109.0-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
<img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/MongoDB-Motor-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/WebSocket-12.0-010101?style=flat-square&logo=websocket&logoColor=white" alt="WebSocket" />

</td>
</tr>
</table>

## Cấu trúc dự án

```
alo-chat/
├── src/                        # Mã nguồn React frontend
│   ├── components/             # Các component React (Chat, Sidebar, Auth...)
│   ├── pages/                  # Các trang chính (Login, Register, Chat)
│   ├── services/               # API services và WebSocket client
│   ├── stores/                 # Zustand state management
│   └── styles/                 # CSS stylesheets
├── src-tauri/                  # Tauri desktop app (Rust)
│   ├── src/                    # Rust source code
│   └── tauri.conf.json         # Cấu hình Tauri
├── server/                     # Ứng dụng FastAPI backend
│   ├── app/                    # Application modules
│   │   ├── config.py           # Cấu hình ứng dụng
│   │   ├── database.py         # Kết nối MongoDB
│   │   ├── models/             # Pydantic schemas
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic
│   │   └── websocket/          # WebSocket manager
│   ├── main.py                 # FastAPI app và WebSocket endpoint
│   ├── docs/                   # Tài liệu kỹ thuật server
│   └── README.md               # Hướng dẫn cài đặt server
├── .github/                    # GitHub workflows và templates
├── CHANGELOG.md                # Lịch sử thay đổi
├── DEPENDENCIES.md             # Danh sách thư viện
└── README.md                   # File này
```

## Tính năng chính

### Nhắn tin thời gian thực
- Gửi và nhận tin nhắn tức thì qua WebSocket
- Hiển thị trạng thái online/offline của bạn bè
- Thông báo "đang gõ" (typing indicator)
- Đánh dấu tin nhắn đã đọc

### Quản lý hội thoại
- Chat riêng tư (1-1) với bạn bè
- Chat nhóm với nhiều thành viên
- "Cloud của tôi" - ghi chú cá nhân (tương tự Saved Messages của Telegram)
- Ghim hội thoại quan trọng lên đầu danh sách
- Xóa lịch sử chat hoặc xóa toàn bộ hội thoại

### Quản lý bạn bè
- Tìm kiếm người dùng theo tên
- Gửi/nhận/chấp nhận/từ chối lời mời kết bạn
- Thông báo real-time về lời mời kết bạn mới
- Xem danh sách bạn bè với trạng thái online

### Chia sẻ tệp tin
- Upload và gửi hình ảnh trong chat
- Hỗ trợ nhiều định dạng file (PDF, DOC, XLS, ZIP...)
- Giới hạn kích thước file: 10MB

### Ứng dụng Desktop
- Đóng gói thành ứng dụng desktop với Tauri
- Hỗ trợ Windows, macOS và Linux
- Thông báo hệ thống (system notifications)

## Cài đặt chương trình

### Yêu cầu hệ thống
- Node.js 18+ và npm/yarn
- Python 3.8+
- MongoDB (local hoặc MongoDB Atlas)
- Rust và Cargo (cho Tauri desktop app)

### 1. Cài đặt Frontend

```bash
# Clone repository
git clone https://github.com/tynnp/alo-chat.git
cd alo-chat

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 2. Cài đặt Backend

```bash
# Di chuyển vào thư mục server
cd server

# Tạo virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/macOS

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env từ template
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/macOS

# Chạy server
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`

### 3. Build Desktop App (Tùy chọn)

```bash
# Từ thư mục gốc
npm run tauri build
```

## Tài liệu API

Khi server đang chạy, tài liệu API có sẵn tại:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Tài khoản Demo

Khi khởi động lần đầu, hệ thống sẽ tự động tạo các tài khoản demo từ file `server/default_users.json` để bạn có thể test ứng dụng.

## Tài liệu

- [`server/README.md`](server/README.md) - Hướng dẫn cài đặt và phát triển Backend
- [`server/docs/API_REFERENCE.md`](server/docs/API_REFERENCE.md) - Tài liệu API và WebSocket
- [`server/docs/DATABASE_SCHEMA.md`](server/docs/DATABASE_SCHEMA.md) - Cấu trúc Database MongoDB
- [`CHANGELOG.md`](CHANGELOG.md) - Lịch sử thay đổi các phiên bản
- [`DEPENDENCIES.md`](DEPENDENCIES.md) - Danh sách thư viện và dependencies
- [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) - Hướng dẫn đóng góp
- [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md) - Bộ quy tắc ứng xử

---

<div align="center">

<img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="MIT License" />

<br/>

Dự án này được phát hành theo giấy phép **MIT License**

Bạn có thể tự do sử dụng, sao chép, chỉnh sửa và phân phối theo các điều khoản của giấy phép.

---
</div>
