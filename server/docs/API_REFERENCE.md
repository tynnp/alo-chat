# API Reference Specification

Tài liệu chi tiết về các API Endpoints và WebSocket Events của Alo Chat Server.

## API Endpoints

### System
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy thông tin phiên bản API |
| GET | `/health` | Kiểm tra trạng thái hoạt động của server |

### Authentication
| Method | Endpoint | Mô tả | Payload/Response |
|--------|----------|-------|------------------|
| POST | `/api/auth/register` | Đăng ký tài khoản | `{username, password, display_name}` |
| POST | `/api/auth/login` | Đăng nhập | `{username, password}` -> `{access_token, user}` |
| GET | `/api/auth/me` | Thông tin cá nhân | Header: `Authorization: Bearer <token>` |

### Conversations
| Method | Endpoint | Mô tả | Chi tiết |
|--------|----------|-------|----------|
| GET | `/api/conversations` | Danh sách hội thoại | Bao gồm tin nhắn cuối và số tin chưa đọc |
| POST | `/api/conversations` | Tạo hội thoại mới | `{type: "private"|"group", member_ids: [], name?}` |
| GET | `/api/conversations/{id}/messages` | Lấy lịch sử tin nhắn | Query: `limit=50` |
| POST | `/api/conversations/{id}/members` | Thêm thành viên | `{member_id}` (Chỉ Admin) |
| PUT | `/api/conversations/{id}/pin` | Ghim/Bỏ ghim | Toggle trạng thái ghim của hội thoại |
| DELETE | `/api/conversations/{id}/messages` | Xóa lịch sử chat | Xóa tất cả tin nhắn trong hội thoại |
| DELETE | `/api/conversations/{id}` | Xóa hội thoại | Xóa toàn bộ dữ liệu (trừ hội thoại "self") |

### Users & Friends
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users/search?q=...` | Tìm kiếm người dùng theo username |
| POST | `/api/users/avatar` | Upload ảnh đại diện (Multipart/form-data) |
| GET | `/api/users/{id}` | Lấy profile người dùng khác |
| GET | `/api/friends` | Danh sách bạn bè hiện tại |
| GET | `/api/friends/requests` | Danh sách lời mời kết bạn đang chờ |
| POST | `/api/friends/request` | Gửi lời mời kết bạn |
| POST | `/api/friends/accept/{id}` | Chấp nhận kết bạn |
| DELETE | `/api/friends/{id}` | Hủy kết bạn |

### Files
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/files/upload` | Upload file/ảnh gửi trong chat (Tối đa 10MB) |

---

## WebSocket Protocol (`/ws?token=...`)

Giao thức giao tiếp thời gian thực sử dụng định dạng JSON: `{"event": "string", "data": {}}`.

### Client -> Server (Events gửi lên)
| Event | Payload | Mô tả |
|-------|---------|-------|
| `ping` | `{}` | Duy trì kết nối, server sẽ phản hồi `pong` |
| `message:send` | `{conversationId, content, type, fileUrl?, fileName?}` | Gửi tin nhắn mới |
| `message:read` | `{conversationId, messageId}` | Đánh dấu một tin nhắn đã đọc |
| `message:read_all` | `{conversationId}` | Đánh dấu đã đọc toàn bộ hội thoại |
| `user:typing` | `{conversationId}` | Thông báo đang soạn thảo |

### Server -> Client (Events nhận về)
| Event | Payload | Mô tả |
|-------|---------|-------|
| `pong` | - | Response cho ping |
| `message:new` | `{_id, content, sender_id, ...}` | Nhận tin nhắn mới từ người khác |
| `message:status`| `{messageId, status: "read", userId}` | Cập nhật trạng thái tin nhắn (đã đọc) |
| `message:read_all` | `{conversationId, userId}` | Thông báo đã đọc tất cả |
| `user:status` | `{userId, status: "online"/"offline", lastOnline?}` | Cập nhật trạng thái bạn bè |
| `user:typing` | `{conversationId, userId}` | Người khác đang soạn thảo |
| `friend:request_received` | `{id, from_user_id, from_user_name, ...}` | Nhận lời mời kết bạn |
| `friend:request_accepted` | `{request_id, new_friend}` | Lời mời được chấp nhận |
| `conversation:deleted` | `{conversationId, deletedBy}` | Cuộc hội thoại bị xóa |