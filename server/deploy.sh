#!/bin/bash

# =============================================================================
# Alo Chat Server - Deployment Script
# =============================================================================

IMAGE_NAME="alo-chat-server"
IMAGE_FILE="alo-chat-server.tar"
CONTAINER_NAME="alo-chat-server"

# Kiểm tra lệnh docker compose
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    print_error "Không tìm thấy lệnh 'docker compose' hoặc 'docker-compose' trên server."
    echo -e "${YELLOW}[TIP]${NC} Vui lòng cài đặt Docker Compose bằng lệnh:"
    echo "      sudo apt-get update && sudo apt-get install docker-compose-plugin"
    exit 1
fi

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Hiển thị hướng dẫn sử dụng
show_help() {
    echo "============================================="
    echo "  Alo Chat Server - Deployment Script"
    echo "============================================="
    echo ""
    echo "Cách sử dụng: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  load     Tải Docker image từ file .tar"
    echo "  up       Khởi động container"
    echo "  down     Dừng container"
    echo "  restart  Khởi động lại container"
    echo "  logs     Xem logs của container"
    echo "  status   Kiểm tra trạng thái container"
    echo "  clean    Dọn dẹp images và containers không sử dụng"
    echo "  help     Hiển thị hướng dẫn này"
    echo ""
}

# Load image từ file .tar
cmd_load() {
    if [ ! -f "$IMAGE_FILE" ]; then
        print_error "Không tìm thấy file $IMAGE_FILE"
        exit 1
    fi
    print_status "Đang tải image từ $IMAGE_FILE..."
    docker load -i "$IMAGE_FILE"
    print_status "Tải image thành công!"
}

# Khởi động container
cmd_up() {
    print_status "Đang khởi động container..."
    $DOCKER_COMPOSE up -d
    print_status "Container đã khởi động!"
    echo ""
    $DOCKER_COMPOSE ps
}

# Dừng container
cmd_down() {
    print_status "Đang dừng container..."
    $DOCKER_COMPOSE down
    print_status "Container đã dừng!"
}

# Khởi động lại container
cmd_restart() {
    print_status "Đang khởi động lại container..."
    $DOCKER_COMPOSE restart
    print_status "Container đã khởi động lại!"
}

# Xem logs
cmd_logs() {
    $DOCKER_COMPOSE logs -f
}

# Kiểm tra trạng thái
cmd_status() {
    echo ""
    echo "=== Container Status ==="
    $DOCKER_COMPOSE ps
    echo ""
    echo "=== Container Stats ==="
    docker stats --no-stream $CONTAINER_NAME 2>/dev/null || print_warning "Container chưa chạy"
}

# Dọn dẹp
cmd_clean() {
    print_warning "Đang dọn dẹp Docker..."
    $DOCKER_COMPOSE down --rmi local 2>/dev/null
    docker system prune -f
    print_status "Dọn dẹp hoàn tất!"
}

# Main
case "$1" in
    load)
        cmd_load
        ;;
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    restart)
        cmd_restart
        ;;
    logs)
        cmd_logs
        ;;
    status)
        cmd_status
        ;;
    clean)
        cmd_clean
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Lệnh không hợp lệ: $1"
        show_help
        exit 1
        ;;
esac