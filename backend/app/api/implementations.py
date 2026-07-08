from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.implementation_service import ImplementationService

router = APIRouter()


async def get_implementation_service():
    return ImplementationService()


@router.get("/search")
async def search_implementations(
    paper_id: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    service: ImplementationService = Depends(get_implementation_service),
):
    try:
        result = await service.search_implementations(paper_id or query or "")
        return {
            "status": "success",
            "message": "Implementations retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{paper_id}")
async def get_implementations(
    paper_id: str, service: ImplementationService = Depends(get_implementation_service)
):
    try:
        result = await service.get_implementations(paper_id)
        return {
            "status": "success",
            "message": "Implementations retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{paper_id}/models")
async def get_pretrained_models(
    paper_id: str, service: ImplementationService = Depends(get_implementation_service)
):
    try:
        result = await service.get_pretrained_models(paper_id)
        return {
            "status": "success",
            "message": "Pretrained models retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
