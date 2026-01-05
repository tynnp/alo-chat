<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=50&pause=1000&color=24C8DB&center=true&vCenter=true&width=435&lines=ALO+CHAT)](https://git.io/typing-svg)

<img src="https://img.shields.io/badge/version-0.2.2-blue?style=for-the-badge" alt="Version" />
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
<img src="https://img.shields.io/badge/status-Active-success?style=for-the-badge" alt="Status" />

<br/>

![Tauri](https://img.shields.io/badge/Tauri-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-009485?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=websocket&logoColor=white)

**Ứng dụng nhắn tin thời gian thực đa nền tảng, thuận tiện và dễ dàng cho công việc!**

</div>

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
- Hiển thị trạng thái online/offline, đang soạn tin nhắn của bạn bè
- Đánh dấu trạng thái tin nhắn đã gửi, đã nhận, đã xem

### Quản lý hội thoại
- Chat riêng tư (1-1) với bạn bè
- "Cloud của tôi" cho ghi chú cá nhân
- Ghim hội thoại quan trọng lên đầu danh sách
- Xóa lịch sử chat hoặc xóa toàn bộ hội thoại

### Quản lý bạn bè
- Tìm kiếm người dùng theo tên đăng nhập
- Gửi/nhận/chấp nhận/từ chối lời mời kết bạn
- Xem danh sách bạn bè kèm trạng thái online/offline

### Chia sẻ tệp tin
- Upload và gửi hình ảnh trong chat
- Hỗ trợ nhiều định dạng file (PDF, DOC, ZIP, RAR, TXT...)

### Ứng dụng Desktop (Tauri)
- Chạy dưới dạng ứng dụng độc lập trên Windows, macOS, Linux
- Tích hợp thông báo hệ thống và giao diện tùy biến

## Cài đặt chương trình

### Yêu cầu hệ thống
- Node.js 18+ và npm/yarn
- Python 3.10+
- MongoDB 6.0+ (Local hoặc MongoDB Atlas)
- Rust và Cargo (cho Tauri desktop app)

### 1. Cài đặt Client

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

### 2. Cài đặt Server (Backend)

Xem hướng dẫn cài đặt chi tiết trong [`server/README.md`](server/README.md).


### 3. Build Desktop App (Tùy chọn)

```bash
# Từ thư mục gốc
npm run tauri build
```

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
