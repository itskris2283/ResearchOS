from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class GraphCache(Document):
    workspace_id: str
    graph_type: str
    graph_data: dict = Field(default_factory=dict)
    node_count: int = 0
    edge_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "graph_caches"
        indexes = [
            [("workspace_id", 1)],
            [("workspace_id", 1), ("graph_type", 1)],
        ]
