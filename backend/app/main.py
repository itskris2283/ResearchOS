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
    allow_origins=settings.CORS_ORIGINS,
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

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(workspaces.router, prefix="/api/v1/workspaces", tags=["Workspaces"])
app.include_router(papers.router, prefix="/api/v1/papers", tags=["Papers"])
app.include_router(authors.router, prefix="/api/v1/authors", tags=["Authors"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(graph.router, prefix="/api/v1/graph", tags=["Knowledge Graph"])
app.include_router(timeline.router, prefix="/api/v1/timeline", tags=["Timeline"])
app.include_router(review.router, prefix="/api/v1/review", tags=["Literature Review"])
app.include_router(roadmap.router, prefix="/api/v1/roadmap", tags=["Roadmap"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["AI Assistant"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(discovery.router, prefix="/api/v1/discovery", tags=["Discovery"])
app.include_router(concepts.router, prefix="/api/v1/concepts", tags=["Concepts"])
app.include_router(
    implementations.router, prefix="/api/v1/implementations", tags=["Implementations"]
)
app.include_router(benchmark.router, prefix="/api/v1/benchmarks", tags=["Benchmarks"])
app.include_router(
    institutions.router, prefix="/api/v1/institutions", tags=["Institutions"]
)
app.include_router(
    hypothesis.router, prefix="/api/v1/hypothesis", tags=["Hypothesis Lab"]
)
app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["Sessions"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(bookmarks.router, prefix="/api/v1/bookmarks", tags=["Bookmarks"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["Notes"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])
app.include_router(compare.router, prefix="/api/v1/compare", tags=["Compare"])


@app.get("/")
async def root():
    return {"message": "ResearchOS API v2.0", "status": "operational"}


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}
