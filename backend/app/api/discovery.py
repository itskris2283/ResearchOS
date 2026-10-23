from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from app.services.discovery_service import DiscoveryService

router = APIRouter()


class DiscoverySearchRequest(BaseModel):
    topic: Optional[str] = None
    query: Optional[str] = None
    limit: Optional[int] = 20


class ExpandQueryRequest(BaseModel):
    query: str


async def get_discovery_service():
    return DiscoveryService()


@router.post("/search")
async def discovery_search(
    body: DiscoverySearchRequest,
    service: DiscoveryService = Depends(get_discovery_service),
):
    try:
        topic_term = body.topic or body.query or ""
        result = await service.discover_topic(topic_term, None)
        papers = result.get("papers", []) if isinstance(result, dict) else result
        return {
            "status": "success",
            "message": "Discovery search complete",
            "data": papers,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/expand")
async def expand_query(
    body: ExpandQueryRequest, service: DiscoveryService = Depends(get_discovery_service)
):
    try:
        result = await service.expand_query(body.query)
        return {
            "status": "success",
            "message": "Query expanded",
            "data": {"expanded_terms": result},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/trending")
async def get_trending_topics(
    service: DiscoveryService = Depends(get_discovery_service),
):
    try:
        return {"status": "success", "message": "Trending topics retrieved", "data": []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
