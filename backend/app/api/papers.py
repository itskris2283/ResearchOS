from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.paper_service import PaperService

router = APIRouter()


async def get_paper_service():
    return PaperService()


@router.get("/")
async def search_papers(
    q: str = Query(""),
    workspace_id: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: Optional[str] = Query(None),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    venue: Optional[str] = Query(None),
    service: PaperService = Depends(get_paper_service),
):
    try:
        if workspace_id:
            from app.models.paper import Paper
            
            # Simple text search if query provided, else return all workspace papers
            if q:
                # Basic regex search on title and abstract
                query = {
                    "workspace_id": workspace_id,
                    "$or": [
                        {"title": {"$regex": q, "$options": "i"}},
                        {"abstract": {"$regex": q, "$options": "i"}}
                    ]
                }
                papers = await Paper.find(query).skip(offset).limit(limit).to_list()
            else:
                papers = await Paper.find(Paper.workspace_id == workspace_id).skip(offset).limit(limit).to_list()
            
            return {"status": "success", "message": "Papers retrieved from workspace", "data": [p.dict() for p in papers]}
            
        if not q:
            return {"status": "success", "message": "Papers retrieved", "data": []}
        result = await service.search_all_sources(q)
        return {"status": "success", "message": "Papers retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search")
async def full_discovery_search(
    query: str, limit: int = 20, service: PaperService = Depends(get_paper_service)
):
    try:
        result = await service.search_all_sources(query)
        deduped = await service.deduplicate(result)
        return {
            "status": "success",
            "message": "Discovery search complete",
            "data": deduped[:limit],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{paper_id}")
async def get_paper(paper_id: str, service: PaperService = Depends(get_paper_service)):
    try:
        result = await service.get_paper_details(paper_id)
        if not result:
            raise HTTPException(status_code=404, detail="Paper not found")
        return {
            "status": "success",
            "message": "Paper details retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def add_paper(
    workspace_id: str, paper_id: str, service: PaperService = Depends(get_paper_service)
):
    try:
        result = await service.get_paper_details(paper_id)
        return {
            "status": "success",
            "message": "Paper added to workspace",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{paper_id}")
async def remove_paper(
    paper_id: str,
    workspace_id: str = Query(...),
    service: PaperService = Depends(get_paper_service),
):
    try:
        return {
            "status": "success",
            "message": "Paper removed",
            "data": {"paper_id": paper_id},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{paper_id}/similar")
async def find_similar_papers(
    paper_id: str, service: PaperService = Depends(get_paper_service)
):
    try:
        result = await service.get_paper_details(paper_id)
        return {
            "status": "success",
            "message": "Similar papers retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
