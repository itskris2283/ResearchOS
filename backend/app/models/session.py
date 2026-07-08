from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Session(Document):
    workspace_id: str
    session_number: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    papers_read: int = 0
    new_papers: list[str] = Field(default_factory=list)
    generated_reviews: list[str] = Field(default_factory=list)
    notes: list[dict] = Field(default_factory=list)
    queries: list[str] = Field(default_factory=list)
    roadmap_version: Optional[int] = None

    class Settings:
        name = "sessions"
        indexes = [
            [("workspace_id", 1)],
            [("workspace_id", 1), ("session_number", -1)],
        ]
