from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Roadmap(Document):
    workspace_id: str
    steps: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "roadmaps"
        indexes = [
            [("workspace_id", 1)],
        ]
