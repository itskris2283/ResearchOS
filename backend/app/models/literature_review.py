from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class LiteratureReview(Document):
    workspace_id: str
    sections: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "literature_reviews"
        indexes = [
            [("workspace_id", 1)],
        ]
