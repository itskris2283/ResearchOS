from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Concept(Document):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    papers: list[str] = Field(default_factory=list)
    related_concepts: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "concepts"
        indexes = [
            [("name", 1)],
            [("category", 1)],
        ]
