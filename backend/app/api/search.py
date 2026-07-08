from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.search_service import SearchService

router = APIRouter()


async def get_search_service():
    return SearchService()


@router.get("/")
async def global_search(
    q: str = Query(...),
    type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    service: SearchService = Depends(get_search_service),
):
    try:
        result = await service.global_search(q, type, limit)
        return {
            "status": "success",
            "message": "Search results retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(...), service: SearchService = Depends(get_search_service)
):
    try:
        result = await service.get_suggestions(q)
        return {"status": "success", "message": "Suggestions retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history")
async def get_search_history(
    user_id: Optional[str] = Query(None),
    service: SearchService = Depends(get_search_service),
):
    try:
        result = await service.get_search_history(user_id)
        return {
            "status": "success",
            "message": "Search history retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
