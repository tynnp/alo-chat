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
| GET | `/api/conversations` | Danh sách hội thoại | Trả về `{"conversations": [...]}` kèm `last_message`, `unread_count`, `is_pinned` |
| POST | `/api/conversations` | Tạo hội thoại mới | `{type, member_ids, name?}` -> Trả về thông tin hội thoại mới |
| GET | `/api/conversations/{id}/messages` | Lấy lịch sử tin nhắn | Trả về `{"messages": [...]}` (mặc định 50 tin gần nhất) |
| POST | `/api/conversations/{id}/members` | Thêm thành viên | `{member_id}` (Chỉ Admin) |
| PUT | `/api/conversations/{id}/pin` | Ghim/Bỏ ghim | Toggle trạng thái ghim của hội thoại |
| DELETE | `/api/conversations/{id}/messages` | Xóa lịch sử chat | `{"deleted_count", "message"}` |
| DELETE | `/api/conversations/{id}` | Xóa hội thoại | `{"message"}` (Trừ hội thoại "self") |

### Users & Friends
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users/search?q=...` | Tìm kiếm người dùng theo username |
| POST | `/api/users/avatar` | Upload ảnh đại diện (Multipart/form-data) |
| GET | `/api/users/{id}` | Lấy profile người dùng khác |
| GET | `/api/friends` | Danh sách bạn bè hiện tại |
| GET | `/api/friends/requests` | Danh sách lời mời chờ | Trả về `{"requests": [...]}` kèm thông tin người gửi |
| POST | `/api/friends/request` | Gửi lời mời kết bạn | `{to_user_id}` -> `{"message", "request_id"}` |
| POST | `/api/friends/accept/{id}` | Chấp nhận kết bạn | `{"message", "new_friend": FriendResponse}` |
| DELETE | `/api/friends/{id}` | Hủy kết bạn |

### Files
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/files/upload` | Upload file/ảnh gửi trong chat | Trả về `{"file_url", "file_name", "file_size", "file_type"}` |

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
| `message:status`| `{messageId, status, userId, conversationId}` | Cập nhật trạng thái tin nhắn |
| `message:read_all` | `{conversationId, userId}` | Thông báo đã đọc tất cả tin nhắn trong hội thoại |
| `user:status` | `{userId, status, lastOnline?}` | Cập nhật trạng thái online/offline của bạn bè |
| `user:update` | `{userId, avatarUrl?, displayName?}` | Cập nhật thông tin profile (ví dụ: đổi avatar) |
| `user:typing` | `{conversationId, userId, userName}` | Người khác đang soạn thảo tin nhắn |
| `friend:request_received` | `{id, from_user_id, from_user_name, ...}` | Nhận được lời mời kết bạn mới |
| `friend:request_accepted` | `{request_id, new_friend}` | Lời mời kết bạn đã gửi được chấp nhận |
| `conversation:deleted` | `{conversationId, deletedBy}` | Một cuộc hội thoại bị xóa |