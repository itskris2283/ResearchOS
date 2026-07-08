from beanie import Document, Indexed
from pydantic import Field, BaseModel
from typing import Optional


class Dataset(Document):
    name: str
    description: Optional[str] = None
    task: Optional[str] = None
    classes: Optional[int] = None
    size: Optional[str] = None
    license: Optional[str] = None
    homepage: Optional[str] = None
    papers: list[str] = Field(default_factory=list)
    benchmarks: list[dict] = Field(default_factory=list)
    leaderboards: list[dict] = Field(default_factory=list)
    evaluation_metrics: list[str] = Field(default_factory=list)

    class Settings:
        name = "datasets"
        indexes = [
            [("name", 1)],
            [("task", 1)],
        ]
