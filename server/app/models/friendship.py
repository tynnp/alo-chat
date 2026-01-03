from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class FriendRequestCreate(BaseModel):
    to_user_id: str = Field(..., description="ID người nhận lời mời")

class FriendRequestResponse(BaseModel):
    id: str
    from_user_id: str
    from_user_name: str
    from_user_avatar: Optional[str] = None
    to_user_id: str
    to_user_name: str
    to_user_avatar: Optional[str] = None
    status: Literal["pending", "accepted", "rejected"]
    created_at: datetime

class FriendResponse(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    status: str = "offline"

# MongoDB Schema cho friendships collection:
# {
#   _id: ObjectId,
#   from_user_id: str,           # ID người gửi lời mời
#   to_user_id: str,             # ID người nhận lời mời  
#   status: "pending" | "accepted" | "rejected",
#   created_at: DateTime,
#   accepted_at: DateTime | null,
#   rejected_at: DateTime | null
# }