from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Author(Document):
    name: str
    institution: Optional[str] = None
    country: Optional[str] = None
    orcid: Optional[str] = None
    h_index: int = 0
    citation_count: int = 0
    paper_count: int = 0
    topics: list[str] = Field(default_factory=list)
    papers: list[str] = Field(default_factory=list)
    coauthors: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "authors"
        indexes = [
            [("name", 1)],
            [("orcid", 1)],
            [("topics", 1)],
            [("h_index", -1)],
        ]
