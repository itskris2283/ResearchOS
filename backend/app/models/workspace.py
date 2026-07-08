from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Workspace(Document):
    user_id: str
    title: str
    topic: Optional[str] = None
    description: Optional[str] = None
    status: str = Field(default="creating")
    statistics: dict = Field(
        default_factory=lambda: {
            "papers": 0,
            "authors": 0,
            "datasets": 0,
            "methods": 0,
            "citations": 0,
        }
    )
    graph_ids: list[str] = Field(default_factory=list)
    timeline_id: Optional[str] = None
    literature_review_id: Optional[str] = None
    roadmap_id: Optional[str] = None
    research_gap_id: Optional[str] = None
    last_sync: Optional[datetime] = None
    search_history: list[dict] = Field(default_factory=list)
    settings: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "workspaces"
        indexes = [
            [("user_id", 1)],
            [("status", 1)],
            [("user_id", 1), ("updated_at", -1)],
        ]
