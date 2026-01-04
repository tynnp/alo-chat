@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo =============================================
echo   Alo Chat Server - Build and Save Script
echo =============================================
echo.

set IMAGE_NAME=alo-chat-server
set IMAGE_TAG=latest
set OUTPUT_DIR=docker-image
set TAR_FILE=%IMAGE_NAME%.tar

:: Kiểm tra Docker đang chạy
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker chưa được khởi động. Vui lòng mở Docker Desktop trước.
    pause
    exit /b 1
)

:: Bước 1: Build Docker image
echo [1/4] Đang build Docker image...
docker build --no-cache -t %IMAGE_NAME%:%IMAGE_TAG% .
if errorlevel 1 (
    echo [ERROR] Build image thất bại!
    pause
    exit /b 1
)
echo [OK] Build image thành công!
echo.

:: Bước 2: Tạo thư mục output
echo [2/4] Đang tạo thư mục %OUTPUT_DIR%...
if exist %OUTPUT_DIR% (
    rmdir /s /q %OUTPUT_DIR%
)
mkdir %OUTPUT_DIR%
echo [OK] Tạo thư mục thành công!
echo.

:: Bước 3: Export image thành file .tar
echo [3/4] Đang export image thành file .tar...
docker save -o %OUTPUT_DIR%\%TAR_FILE% %IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo [ERROR] Export image thất bại!
    pause
    exit /b 1
)
echo [OK] Export image thành công!
echo.

:: Bước 4: Copy các file cần thiết
echo [4/4] Đang copy các file cần thiết...
copy docker-compose.yml %OUTPUT_DIR%\ >nul
copy deploy.sh %OUTPUT_DIR%\ >nul
copy .env.example %OUTPUT_DIR%\.env.example >nul
copy default_users.json.example %OUTPUT_DIR%\default_users.json.example >nul

:: Tạo file README cho thư mục deploy
(
echo # Hướng dẫn Deploy Alo Chat Server
echo.
echo ## Các bước thực hiện:
echo.
echo 1. Copy toàn bộ thư mục này lên server
echo.
echo 2. Tạo file cấu hình từ template:
echo    cp .env.example .env
echo    cp default_users.json.example default_users.json
echo.
echo 3. Chỉnh sửa file .env với thông tin thực tế:
echo    - MONGODB_URL: Connection string MongoDB Atlas
echo    - JWT_SECRET_KEY: Secret key cho JWT
echo.
echo 4. Chỉnh sửa file default_users.json ^(tùy chọn^):
echo    - Thêm/sửa các tài khoản mặc định cho hệ thống
echo.
echo 5. Cấp quyền thực thi cho script:
echo    chmod +x deploy.sh
echo.
echo 6. Load Docker image:
echo    ./deploy.sh load
echo.
echo 7. Khởi động server:
echo    ./deploy.sh up
echo.
echo ## Các lệnh khác:
echo - ./deploy.sh down     ^| Dừng server
echo - ./deploy.sh restart  ^| Khởi động lại
echo - ./deploy.sh logs     ^| Xem logs
echo - ./deploy.sh status   ^| Kiểm tra trạng thái
echo - ./deploy.sh clean    ^| Dọn dẹp Docker
) > %OUTPUT_DIR%\README.md

echo [OK] Copy files thành công!
echo.

echo =============================================
echo   BUILD HOÀN TẤT!
echo =============================================
echo.
echo Thư mục "%OUTPUT_DIR%" đã sẵn sàng để copy lên server.
echo.
echo Nội dung thư mục:
dir /b %OUTPUT_DIR%
echo.
echo Kích thước image:
for %%A in (%OUTPUT_DIR%\%TAR_FILE%) do (
    set /a SIZE_MB=%%~zA / 1048576
    echo   !SIZE_MB! MB
)
echo.

pause