from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class User(Document):
    email: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    auth_provider: str = Field(default="email")
    auth_id: Optional[str] = None
    is_guest: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            [("email", 1)],
            [("auth_provider", 1), ("auth_id", 1)],
        ]
