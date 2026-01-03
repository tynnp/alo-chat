from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class FileAttachment(BaseModel):
    url: str
    name: str
    size: int
    mime_type: Optional[str] = None

class MessageStatus(BaseModel):
    user_id: str
    status: str = "sent"  # sent, delivered, read
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    conversation_id: str
    content: str
    type: str = "text"  # text, file, image, system
    file: Optional[FileAttachment] = None

class MessageResponse(BaseModel):
    id: str = Field(..., alias="_id")
    conversation_id: str
    sender_id: str
    content: str
    type: str
    file: Optional[FileAttachment] = None
    status: List[MessageStatus] = []
    created_at: datetime
    
    class Config:
        populate_by_name = True