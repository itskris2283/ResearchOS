from fastapi import APIRouter, HTTPException, Depends, Query
from app.services.bookmark_service import BookmarkService

router = APIRouter()


async def get_bookmark_service():
    return BookmarkService()


@router.get("/")
async def list_bookmarks(
    user_id: str = Query(...), service: BookmarkService = Depends(get_bookmark_service)
):
    try:
        result = await service.get_user_bookmarks(user_id)
        return {"status": "success", "message": "Bookmarks retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def add_bookmark(
    user_id: str,
    entity_type: str,
    entity_id: str,
    service: BookmarkService = Depends(get_bookmark_service),
):
    try:
        bookmark = await service.add_bookmark(user_id, entity_type, entity_id)
        return {"status": "success", "message": "Bookmark added", "data": bookmark}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{bookmark_id}")
async def remove_bookmark(
    bookmark_id: str, service: BookmarkService = Depends(get_bookmark_service)
):
    try:
        await service.remove_bookmark(bookmark_id)
        return {"status": "success", "message": "Bookmark removed", "data": None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
