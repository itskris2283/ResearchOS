from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.dataset_service import DatasetService

router = APIRouter()


async def get_dataset_service():
    return DatasetService()


@router.get("/")
async def list_datasets(
    q: Optional[str] = Query(None),
    workspace_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: DatasetService = Depends(get_dataset_service),
):
    try:
        result = (
            await service.search_datasets(q)
            if q
            else await service.list_datasets(workspace_id)
        )
        return {"status": "success", "message": "Datasets retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{dataset_id}")
async def get_dataset(
    dataset_id: str, service: DatasetService = Depends(get_dataset_service)
):
    try:
        result = (
            await service.get_dataset_details(dataset_id)
            if hasattr(service, "get_dataset_details")
            else {"id": dataset_id}
        )
        return {
            "status": "success",
            "message": "Dataset details retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{dataset_id}/papers")
async def get_dataset_papers(
    dataset_id: str, service: DatasetService = Depends(get_dataset_service)
):
    try:
        return {"status": "success", "message": "Papers retrieved", "data": []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{dataset_id}/leaderboard")
async def get_dataset_leaderboard(
    dataset_id: str, service: DatasetService = Depends(get_dataset_service)
):
    try:
        result = await service.get_dataset_leaderboard(dataset_id)
        return {"status": "success", "message": "Leaderboard retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
