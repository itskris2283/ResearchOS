from fastapi import APIRouter, HTTPException, Depends
from app.services.timeline_service import TimelineService

router = APIRouter()


async def get_timeline_service():
    return TimelineService()


@router.get("/{workspace_id}")
async def get_timeline(
    workspace_id: str, service: TimelineService = Depends(get_timeline_service)
):
    try:
        result = await service.get_timeline(workspace_id)
        return {"status": "success", "message": "Timeline retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/regenerate")
async def regenerate_timeline(
    workspace_id: str, service: TimelineService = Depends(get_timeline_service)
):
    try:
        result = await service.regenerate_timeline(workspace_id)
        return {"status": "success", "message": "Timeline regenerated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/play")
async def play_timeline(
    workspace_id: str, service: TimelineService = Depends(get_timeline_service)
):
    try:
        result = await service.get_animation_data(workspace_id)
        return {
            "status": "success",
            "message": "Timeline animation data retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
