from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import os
import uuid
from app.services import get_current_user

router = APIRouter(prefix="/files", tags=["Files"])

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Kiểm tra extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Loại file không được hỗ trợ")
    
    content = await file.read()
    
    # Kiểm tra kích thước
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File quá lớn (tối đa 10MB)")
    
    files_dir = os.path.join("uploads", "files")
    if not os.path.exists(files_dir):
        os.makedirs(files_dir)
    
    # Tạo tên file unique
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(files_dir, filename)
    
    # Lưu file
    with open(file_path, "wb") as f:
        f.write(content)
    
    file_url = f"/uploads/files/{filename}"
    
    # Xác định loại file
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_type = "image" if file_ext in image_extensions else "file"
    
    return {
        "file_url": file_url,
        "file_name": file.filename,
        "file_size": len(content),
        "file_type": file_type
    }