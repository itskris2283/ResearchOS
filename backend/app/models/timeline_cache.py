from beanie import Document, Indexed
from pydantic import Field, BaseModel

from datetime import datetime


class TimelineCache(Document):
    workspace_id: str
    events: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "timeline_caches"
        indexes = [
            [("workspace_id", 1)],
        ]
