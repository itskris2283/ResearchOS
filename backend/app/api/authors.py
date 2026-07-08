from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.services.author_service import AuthorService

router = APIRouter()


async def get_author_service():
    return AuthorService()


@router.get("/")
async def list_authors(
    q: Optional[str] = Query(None),
    workspace_id: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    service: AuthorService = Depends(get_author_service),
):
    try:
        result = await service.search_authors(q, workspace_id=workspace_id, limit=limit, offset=offset)
        return {"status": "success", "message": "Authors retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{author_id}")
async def get_author(
    author_id: str, service: AuthorService = Depends(get_author_service)
):
    try:
        result = await service.get_author_details(author_id)
        if not result:
            raise HTTPException(status_code=404, detail="Author not found")
        return {
            "status": "success",
            "message": "Author details retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{author_id}/papers")
async def get_author_papers(
    author_id: str, service: AuthorService = Depends(get_author_service)
):
    try:
        result = await service.get_author_papers(author_id)
        return {
            "status": "success",
            "message": "Author papers retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{author_id}/coauthors")
async def get_author_coauthors(
    author_id: str, service: AuthorService = Depends(get_author_service)
):
    try:
        result = await service.get_coauthor_network(author_id)
        return {
            "status": "success",
            "message": "Coauthor network retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
