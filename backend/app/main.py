from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.mongodb import init_mongodb, close_mongodb
from app.database.chromadb import init_chromadb, close_chromadb
from app.middleware.rate_limit import RateLimitMiddleware
from app.utils.logger import setup_logger

logger = setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ResearchOS backend...")
    await init_mongodb()
    await init_chromadb()
    yield
    await close_mongodb()
    await close_chromadb()
    logger.info("ResearchOS backend shutdown complete.")


app = FastAPI(
    title="ResearchOS API",
    description="The AI Operating System for Scientific Discovery",
    version="2.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)

from app.api import (
    auth,
    workspaces,
    papers,
    authors,
    datasets,
    graph,
    timeline,
    review,
    roadmap,
    assistant,
    analytics,
    discovery,
    concepts,
    implementations,
    benchmark,
    institutions,
    hypothesis,
    sessions,
    search,
    bookmarks,
    notes,
    export,
    compare,
)

_routers = [
    (auth.router, "/auth", ["Authentication"]),
    (workspaces.router, "/workspaces", ["Workspaces"]),
    (papers.router, "/papers", ["Papers"]),
    (authors.router, "/authors", ["Authors"]),
    (datasets.router, "/datasets", ["Datasets"]),
    (graph.router, "/graph", ["Knowledge Graph"]),
    (timeline.router, "/timeline", ["Timeline"]),
    (review.router, "/review", ["Literature Review"]),
    (roadmap.router, "/roadmap", ["Roadmap"]),
    (assistant.router, "/assistant", ["AI Assistant"]),
    (analytics.router, "/analytics", ["Analytics"]),
    (discovery.router, "/discovery", ["Discovery"]),
    (concepts.router, "/concepts", ["Concepts"]),
    (implementations.router, "/implementations", ["Implementations"]),
    (benchmark.router, "/benchmarks", ["Benchmarks"]),
    (institutions.router, "/institutions", ["Institutions"]),
    (hypothesis.router, "/hypothesis", ["Hypothesis Lab"]),
    (sessions.router, "/sessions", ["Sessions"]),
    (search.router, "/search", ["Search"]),
    (bookmarks.router, "/bookmarks", ["Bookmarks"]),
    (notes.router, "/notes", ["Notes"]),
    (export.router, "/export", ["Export"]),
    (compare.router, "/compare", ["Compare"]),
]

for r, path, tags in _routers:
    app.include_router(r, prefix=f"/api/v1{path}", tags=tags)
    app.include_router(r, prefix=path, tags=tags, include_in_schema=False)


@app.get("/")
async def root():
    return {"message": "ResearchOS API v2.0", "status": "operational"}


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}
