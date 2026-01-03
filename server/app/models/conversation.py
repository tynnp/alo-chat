from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class ConversationMember(BaseModel):
    user_id: str
    role: str = "member"  # admin hoặc member
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConversationCreate(BaseModel):
    type: str = Field(..., pattern="^(private|group|self)$")
    name: Optional[str] = None
    member_ids: List[str] = []

class ConversationResponse(BaseModel):
    id: str = Field(..., alias="_id")
    type: str
    name: Optional[str] = None
    members: List[ConversationMember]
    created_by: str
    created_at: datetime
    unread_count: int = 0
    last_message_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True