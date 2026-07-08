from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class Paper(Document):
    workspace_id: str
    title: str
    abstract: Optional[str] = None
    summary: Optional[str] = None
    year: Optional[int] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    pdf_url: Optional[str] = None
    paper_url: Optional[str] = None
    citation_count: int = 0
    keywords: list[str] = Field(default_factory=list)
    methods: list[str] = Field(default_factory=list)
    datasets: list[str] = Field(default_factory=list)
    authors: list[dict] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)
    citations: list[str] = Field(default_factory=list)
    related_papers: list[str] = Field(default_factory=list)
    implementation_links: list[str] = Field(default_factory=list)
    paper_source: Optional[str] = None
    embedding_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "papers"
        indexes = [
            [("workspace_id", 1)],
            [("workspace_id", 1), ("title", 1)],
            [("doi", 1)],
            [("keywords", 1)],
            [("year", -1)],
        ]
