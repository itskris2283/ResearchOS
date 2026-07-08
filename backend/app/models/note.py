from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Note(Document):
    workspace_id: str
    paper_id: Optional[str] = None
    title: str
    markdown: str = ""
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notes"
        indexes = [
            [("workspace_id", 1)],
            [("workspace_id", 1), ("paper_id", 1)],
            [("tags", 1)],
        ]
