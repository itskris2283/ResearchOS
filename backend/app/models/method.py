from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional


class Method(Document):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    papers: list[str] = Field(default_factory=list)
    related_methods: list[str] = Field(default_factory=list)
    datasets: list[str] = Field(default_factory=list)
    architectures: list[str] = Field(default_factory=list)

    class Settings:
        name = "methods"
        indexes = [
            [("name", 1)],
            [("category", 1)],
        ]
