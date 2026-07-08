from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.institution_service import InstitutionService

router = APIRouter()


async def get_institution_service():
    return InstitutionService()


@router.get("/")
async def list_institutions(
    q: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: InstitutionService = Depends(get_institution_service),
):
    try:
        result = await service.search_institutions(q) if q else []
        return {
            "status": "success",
            "message": "Institutions retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{institution_id}")
async def get_institution(
    institution_id: str, service: InstitutionService = Depends(get_institution_service)
):
    try:
        result = await service.get_institution_details(institution_id)
        if not result:
            raise HTTPException(status_code=404, detail="Institution not found")
        return {
            "status": "success",
            "message": "Institution details retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{institution_id}/researchers")
async def get_institution_researchers(
    institution_id: str, service: InstitutionService = Depends(get_institution_service)
):
    try:
        result = await service.get_researchers(institution_id)
        return {"status": "success", "message": "Researchers retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
