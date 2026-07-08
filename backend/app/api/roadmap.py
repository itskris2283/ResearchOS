from fastapi import APIRouter, HTTPException, Depends
from app.services.roadmap_service import RoadmapService
from app.services.workspace_service import WorkspaceService

router = APIRouter()


async def get_roadmap_service():
    return RoadmapService()


async def get_workspace_service():
    return WorkspaceService()


@router.get("/{workspace_id}")
async def get_roadmap(
    workspace_id: str, service: RoadmapService = Depends(get_roadmap_service)
):
    try:
        result = await service.get_roadmap(workspace_id)
        return {"status": "success", "message": "Roadmap retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/generate")
async def generate_roadmap(
    workspace_id: str, service: RoadmapService = Depends(get_roadmap_service)
):
    try:
        result = await service.generate_roadmap(workspace_id)
        await service.store_roadmap(workspace_id, result)
        return {"status": "success", "message": "Roadmap generated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
