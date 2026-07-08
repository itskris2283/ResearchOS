from fastapi import APIRouter, HTTPException, Depends, Body
from app.services.discovery_service import DiscoveryService

router = APIRouter()


async def get_discovery_service():
    return DiscoveryService()


@router.post("/search")
async def discovery_search(
    topic: str = Body(...),
    limit: int = Body(20),
    service: DiscoveryService = Depends(get_discovery_service),
):
    try:
        result = await service.discover_topic(topic, "")
        return {
            "status": "success",
            "message": "Discovery search complete",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/expand")
async def expand_query(
    query: str, service: DiscoveryService = Depends(get_discovery_service)
):
    try:
        result = await service.expand_query(query)
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
