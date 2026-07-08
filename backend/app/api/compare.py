from fastapi import APIRouter, HTTPException, Depends
from app.services.compare_service import CompareService

router = APIRouter()


async def get_compare_service():
    return CompareService()


@router.post("/papers")
async def compare_papers(
    paper_ids: list[str], service: CompareService = Depends(get_compare_service)
):
    try:
        result = await service.compare_papers(paper_ids)
        return {
            "status": "success",
            "message": "Paper comparison completed",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/methods")
async def compare_methods(
    method_ids: list[str], service: CompareService = Depends(get_compare_service)
):
    try:
        result = await service.compare_methods(method_ids)
        return {
            "status": "success",
            "message": "Method comparison completed",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/datasets")
async def compare_datasets(
    dataset_ids: list[str], service: CompareService = Depends(get_compare_service)
):
    try:
        result = await service.compare_datasets(dataset_ids)
        return {
            "status": "success",
            "message": "Dataset comparison completed",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
