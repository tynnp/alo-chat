# Database Architecture & Schema

Tài liệu chi tiết về cấu trúc dữ liệu và các Collection trong MongoDB của Alo Chat.

## Collections

### Collection: `users`

```javascript
{
  _id: ObjectId,
  username: String,           // Unique
  display_name: String,
  password_hash: String,
  avatar_url: String | null,
  status: "online" | "offline",
  created_at: DateTime,
  last_online: DateTime | null
}
```

### Collection: `conversations`

```javascript
{
  _id: ObjectId,
  type: "private" | "group" | "self",
  name: String | null,        // Tên nhóm (group chat)
  members: [
    {
      user_id: String,
      role: "admin" | "member",
      joined_at: DateTime
    }
  ],
  created_by: String,
  created_at: DateTime,
  last_message_at: DateTime | null,
  pinned_by: [String]         // Danh sách user_id đã ghim
}
```

### Collection: `messages`

```javascript
{
  _id: ObjectId,
  conversation_id: String,
  sender_id: String,
  content: String,
  type: "text" | "file" | "image" | "system",
  file_url: String | null,
  file_name: String | null,
  status: [
    {
      user_id: String,
      status: "sent" | "delivered" | "read",
      at: DateTime
    }
  ],
  created_at: DateTime
}
```

### Collection: `friendships`

```javascript
{
  _id: ObjectId,
  from_user_id: String,       // Người gửi lời mời
  to_user_id: String,         // Người nhận lời mời
  status: "pending" | "accepted" | "rejected",
  created_at: DateTime,
  accepted_at: DateTime | null,
  rejected_at: DateTime | null
}
```

## Indexes

Các index được tạo tự động khi khởi động server:

- `users.username` - Unique index: Đảm bảo không trùng lặp tên đăng nhập.
- `conversations.members.user_id` - Index trên mảng thành viên: Tối ưu việc tìm danh sách cuộc hội thoại của một người dùng.
- `messages.conversation_id` + `messages.created_at` - Compound index: Tối ưu việc lấy lịch sử tin nhắn theo thời gian giảm dần.
