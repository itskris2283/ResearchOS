from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.concept_service import ConceptService

router = APIRouter()


async def get_concept_service():
    return ConceptService()


@router.get("/")
async def list_concepts(
    q: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: ConceptService = Depends(get_concept_service),
):
    try:
        result = await service.search_concepts(q) if q else []
        return {"status": "success", "message": "Concepts retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{concept_id}")
async def get_concept(
    concept_id: str, service: ConceptService = Depends(get_concept_service)
):
    try:
        result = await service.get_concept_details(concept_id)
        if not result:
            raise HTTPException(status_code=404, detail="Concept not found")
        return {
            "status": "success",
            "message": "Concept details retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{concept_id}/evolution")
async def get_concept_evolution(
    concept_id: str, service: ConceptService = Depends(get_concept_service)
):
    try:
        result = await service.get_concept_evolution(concept_id)
        return {
            "status": "success",
            "message": "Concept evolution retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{concept_id}/papers")
async def get_concept_papers(
    concept_id: str, service: ConceptService = Depends(get_concept_service)
):
    try:
        result = await service.get_concept_papers(concept_id)
        return {
            "status": "success",
            "message": "Concept papers retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{concept_id}/family-tree")
async def get_concept_family_tree(
    concept_id: str, service: ConceptService = Depends(get_concept_service)
):
    try:
        result = await service.get_family_tree(concept_id)
        return {"status": "success", "message": "Family tree retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
