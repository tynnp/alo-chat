# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án Alo Chat! Tài liệu này sẽ hướng dẫn bạn cách tham gia phát triển dự án.

## Quy trình đóng góp

### 1. Fork Repository

Fork repository về tài khoản GitHub của bạn bằng cách nhấn nút **Fork** ở góc trên bên phải trang repository.

### 2. Clone Repository

```bash
git clone https://github.com/<your-username>/alo-chat.git
cd alo-chat
```

### 3. Tạo Branch mới

Tạo một branch mới cho tính năng hoặc bản sửa lỗi của bạn:

```bash
git checkout -b feature/ten-tinh-nang
# hoặc
git checkout -b fix/ten-loi
```

**Quy tắc đặt tên branch:**
- `feature/` - Tính năng mới
- `fix/` - Sửa lỗi
- `docs/` - Cập nhật tài liệu
- `refactor/` - Tái cấu trúc code

### 4. Thực hiện Thay đổi

- Viết code theo chuẩn của dự án
- Đảm bảo code chạy được và không gây lỗi
- Thêm comments nếu cần thiết

### 5. Commit Changes

```bash
git add .
git commit -m "Mô tả ngắn gọn về thay đổi"
```

**Quy tắc viết commit message:**
- Sử dụng tiếng Việt
- Mô tả ngắn gọn, rõ ràng
- Ví dụ: `Thêm tính năng gửi file trong chat`

### 6. Push lên GitHub
Ví dụ như: 

```bash
git push origin feature/ten-tinh-nang
```

### 7. Tạo Pull Request

1. Truy cập repository gốc trên GitHub
2. Nhấn **New Pull Request**
3. Chọn branch của bạn và điền thông tin:
   - Tiêu đề mô tả thay đổi
   - Mô tả chi tiết những gì đã làm
   - Liên kết đến issue liên quan (nếu có)

## Quy tắc Code

### Frontend (React/TypeScript)

- Sử dụng TypeScript cho tất cả các file
- Đặt tên component theo PascalCase: `ChatWindow.tsx`
- Đặt tên file utility theo camelCase: `formatDate.ts`
- Sử dụng functional components và hooks
- Comments bằng tiếng Việt

### Backend (Python/FastAPI)

- Tuân thủ PEP 8
- Đặt tên file và function theo snake_case
- Sử dụng type hints
- Viết docstrings cho các function quan trọng
- Comments bằng tiếng Việt

### CSS/Styling

- Sử dụng Tailwind CSS classes
- Tránh inline styles khi có thể
- Đặt tên class CSS theo kebab-case

## Báo cáo Lỗi

Khi báo cáo lỗi, vui lòng cung cấp:

1. **Mô tả lỗi**: Lỗi gì xảy ra?
2. **Các bước tái hiện**: Làm sao để gặp lỗi này?
3. **Kết quả mong đợi**: Bạn mong đợi điều gì xảy ra?
4. **Kết quả thực tế**: Điều gì thực sự xảy ra?
5. **Môi trường**: OS, Browser, Node version, Python version...
6. **Screenshots**: Nếu có thể

## Đề xuất Tính năng

Khi đề xuất tính năng mới:

1. Kiểm tra xem đã có ai đề xuất chưa
2. Mô tả rõ ràng tính năng
3. Giải thích tại sao tính năng này hữu ích
4. Đề xuất cách triển khai (nếu có)

## Liên hệ

Nếu có câu hỏi, vui lòng tạo Issue trên GitHub hoặc liên hệ qua email: **tynnp.dhsp@gmail.com**