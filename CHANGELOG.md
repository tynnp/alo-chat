# Changelog

Tất cả các thay đổi đáng chú ý đối với dự án này sẽ được ghi lại trong file này. Xem thêm mẫu changelog [ở đây](.github/CHANGELOG_TEMPLATE.md).

## [0.2.0] - 2026-01-04

### Thêm mới
- Trạng thái "Đang soạn tin nhắn".
- Tìm kiếm người dùng theo tên.
- Emoij cho trò chuyện.

### Sửa lỗi
- Request lời mời kết bạn và đồng ý kết bạn bị gửi 2 lần 1 lúc.

## [0.1.0] - 2026-01-04

### Thêm mới
- **Nền tảng ứng dụng:** Khởi tạo dự án đa nền tảng sử dụng Tauri và React.
- **Hệ thống Backend:** Xây dựng máy chủ API với FastAPI và cơ sở dữ liệu MongoDB.
- **Nhắn tin thời gian thực:** Tích hợp WebSocket cho việc gửi/nhận tin nhắn tức thì.
- **Quản lý hội thoại:** Hỗ trợ chat riêng tư (1-1), chat nhóm và hội thoại cá nhân (Cloud của tôi).
- **Tính năng hội thoại:** Ghim hội thoại, xóa lịch sử tin nhắn và xóa hội thoại.
- **Quản lý bạn bè:** Tìm kiếm người dùng, gửi và xử lý lời mời kết bạn (chấp nhận/từ chối), hiển thị trạng thái online/offline.
- **Chia sẻ tệp tin:** Hỗ trợ tải lên và gửi hình ảnh, tài liệu (PDF, DOC, ZIP...) với giới hạn 10MB/tệp.
- **Tài liệu dự án:** Hoàn thiện README, API Reference, Database Schema và các tài liệu hướng dẫn cộng đồng.

### Bảo mật
- **Xác thực:** Triền khai hệ thống đăng nhập/đăng ký với mã hóa mật khẩu bcrypt và JWT access tokens.
- **Phân quyền:** Bảo vệ các API endpoints và kết nối WebSocket yêu cầu xác thực người dùng.