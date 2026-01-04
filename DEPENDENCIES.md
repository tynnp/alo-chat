# Danh sách thư viện và gói phụ thuộc

Tài liệu này liệt kê tất cả các thư viện và gói phụ thuộc được sử dụng trong dự án Alo Chat.

---

## Server

| Thư viện/Gói | Phiên bản | Giấy phép | Mô tả | URL |
|--------------|-----------|-----------|-------|-----|
| fastapi | 0.109.0 | MIT | Framework web hiện đại, nhanh cho xây dựng API với Python | https://fastapi.tiangolo.com/ |
| uvicorn[standard] | 0.27.0 | BSD-3-Clause | ASGI server để chạy ứng dụng FastAPI | https://www.uvicorn.org/ |
| motor | 3.3.2 | Apache-2.0 | Driver MongoDB bất đồng bộ cho Python | https://motor.readthedocs.io/ |
| pymongo | 4.6.1 | Apache-2.0 | Driver Python chính thức cho MongoDB | https://pymongo.readthedocs.io/ |
| pydantic | 2.5.3 | MIT | Validation dữ liệu sử dụng Python type hints | https://docs.pydantic.dev/ |
| pydantic-settings | 2.1.0 | MIT | Quản lý cấu hình ứng dụng với Pydantic | https://docs.pydantic.dev/latest/concepts/pydantic_settings/ |
| python-jose[cryptography] | 3.3.0 | MIT | Thư viện JOSE (JSON Object Signing and Encryption) cho JWT | https://github.com/mpdavis/python-jose |
| passlib[bcrypt] | 1.7.4 | BSD-3-Clause | Thư viện mã hóa mật khẩu hỗ trợ bcrypt | https://passlib.readthedocs.io/ |
| python-multipart | 0.0.6 | Apache-2.0 | Streaming multipart parser cho file uploads | https://github.com/andrew-d/python-multipart |
| websockets | 12.0 | BSD-3-Clause | Thư viện WebSocket cho Python (async) | https://websockets.readthedocs.io/ |
| python-dotenv | 1.0.0 | BSD-3-Clause | Đọc các cặp key-value từ file .env | https://github.com/theskumar/python-dotenv |

---

## Client

| Thư viện/Gói | Phiên bản | Giấy phép | Mô tả | URL |
|--------------|-----------|-----------|-------|-----|
| react | 19.2.0 | MIT | Thư viện JavaScript để xây dựng giao diện người dùng | https://react.dev/ |
| react-dom | 19.2.0 | MIT | Điểm vào DOM và server renderer cho React | https://react.dev/ |
| react-router-dom | 7.11.0 | MIT | Routing cho ứng dụng React | https://reactrouter.com/ |
| zustand | 5.0.9 | MIT | Thư viện quản lý state nhẹ và linh hoạt | https://zustand-demo.pmnd.rs/ |
| lucide-react | 0.562.0 | ISC | Thư viện icon đẹp và nhất quán cho React | https://lucide.dev/ |
| react-easy-crop | 5.5.6 | MIT | Component crop ảnh cho React | https://github.com/ricardo-ch/react-easy-crop |
| @tauri-apps/api | 2.9.1 | MIT/Apache-2.0 | API JavaScript cho Tauri desktop apps | https://tauri.app/ |
| @tauri-apps/plugin-dialog | 2.4.2 | MIT/Apache-2.0 | Plugin dialog cho Tauri | https://tauri.app/ |
| @tauri-apps/plugin-fs | 2.4.4 | MIT/Apache-2.0 | Plugin file system cho Tauri | https://tauri.app/ |
| @tauri-apps/plugin-notification | 2.3.3 | MIT/Apache-2.0 | Plugin thông báo cho Tauri | https://tauri.app/ |
| @tauri-apps/plugin-shell | 2.3.3 | MIT/Apache-2.0 | Plugin shell commands cho Tauri | https://tauri.app/ |
| @tauri-apps/plugin-websocket | 2.4.1 | MIT/Apache-2.0 | Plugin WebSocket cho Tauri | https://tauri.app/ |
| vite | 7.2.4 | MIT | Công cụ build frontend thế hệ mới | https://vitejs.dev/ |
| typescript | 5.9.3 | Apache-2.0 | Ngôn ngữ TypeScript và trình biên dịch | https://www.typescriptlang.org/ |
| tailwindcss | 4.1.18 | MIT | Framework CSS utility-first | https://tailwindcss.com/ |
| postcss | 8.5.6 | MIT | Công cụ biến đổi CSS bằng plugin JavaScript | https://postcss.org/ |
| autoprefixer | 10.4.23 | MIT | Tự động thêm tiền tố vendor cho CSS | https://github.com/postcss/autoprefixer |
| @tailwindcss/postcss | 4.1.18 | MIT | Plugin PostCSS cho Tailwind CSS | https://tailwindcss.com/ |
| eslint | 9.39.1 | MIT | Công cụ phân tích mã tĩnh (linting) JavaScript/TypeScript | https://eslint.org/ |
| @eslint/js | 9.39.1 | MIT | Cấu hình JavaScript cho ESLint | https://eslint.org/ |
| eslint-plugin-react-hooks | 7.0.1 | MIT | Quy tắc ESLint cho React Hooks | https://github.com/facebook/react |
| eslint-plugin-react-refresh | 0.4.24 | MIT | Xác nhận các component có thể được refresh an toàn | https://github.com/ArnaudBarre/eslint-plugin-react-refresh |
| typescript-eslint | 8.46.4 | MIT | Công cụ cho ESLint và Prettier để hỗ trợ TypeScript | https://typescript-eslint.io/ |
| globals | 16.5.0 | MIT | Định nghĩa các biến global cho ESLint | https://github.com/sindresorhus/globals |
| @vitejs/plugin-react | 5.1.1 | MIT | Plugin React chính thức cho Vite | https://github.com/vitejs/vite-plugin-react |
| @tauri-apps/cli | 2.9.6 | MIT/Apache-2.0 | CLI để phát triển ứng dụng Tauri | https://tauri.app/ |
| @types/node | 24.10.1 | MIT | Định nghĩa kiểu TypeScript cho Node.js | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react | 19.2.5 | MIT | Định nghĩa kiểu TypeScript cho React | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react-dom | 19.2.3 | MIT | Định nghĩa kiểu TypeScript cho React DOM | https://github.com/DefinitelyTyped/DefinitelyTyped |

---
