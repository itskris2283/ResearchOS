from beanie import Document, Indexed
from pydantic import Field, BaseModel
from datetime import datetime


class Bookmark(Document):
    user_id: str
    entity_type: str
    entity_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "bookmarks"
        indexes = [
            [("user_id", 1)],
            [("user_id", 1), ("entity_type", 1)],
            [("user_id", 1), ("entity_type", 1), ("entity_id", 1)],
        ]
