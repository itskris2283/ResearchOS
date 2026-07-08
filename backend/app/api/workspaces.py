from fastapi import APIRouter, HTTPException, Depends, Query, Body
from pydantic import BaseModel
from app.services.workspace_service import WorkspaceService

router = APIRouter()


class CreateWorkspaceRequest(BaseModel):
    user_id: str
    topic: str
    title: str


class UpdateWorkspaceRequest(BaseModel):
    data: dict


async def get_workspace_service():
    return WorkspaceService()


@router.post("/")
async def create_workspace(
    body: CreateWorkspaceRequest,
    service: WorkspaceService = Depends(get_workspace_service),
):
    try:
        workspace = await service.create_workspace(body.user_id, body.topic, body.title)
        return {
            "status": "success",
            "message": "Workspace created",
            "data": workspace,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def list_workspaces(
    user_id: str = Query(...),
    service: WorkspaceService = Depends(get_workspace_service),
):
    try:
        workspaces = await service.get_user_workspaces(user_id)
        return {
            "status": "success",
            "message": "Workspaces retrieved",
            "data": workspaces,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}")
async def get_workspace(
    workspace_id: str, service: WorkspaceService = Depends(get_workspace_service)
):
    try:
        workspace = await service.get_workspace(workspace_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        return {
            "status": "success",
            "message": "Workspace retrieved",
            "data": workspace,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{workspace_id}")
async def update_workspace(
    workspace_id: str,
    body: UpdateWorkspaceRequest,
    service: WorkspaceService = Depends(get_workspace_service),
):
    try:
        workspace = await service.update_workspace(workspace_id, body.data)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        return {"status": "success", "message": "Workspace updated", "data": workspace}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: str, service: WorkspaceService = Depends(get_workspace_service)
):
    try:
        await service.delete_workspace(workspace_id)
        return {"status": "success", "message": "Workspace deleted", "data": None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/sync")
async def sync_workspace(
    workspace_id: str, service: WorkspaceService = Depends(get_workspace_service)
):
    try:
        await service.sync_workspace(workspace_id)
        return {
            "status": "success",
            "message": "Workspace sync triggered",
            "data": None,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/progress")
async def get_workspace_progress(
    workspace_id: str, service: WorkspaceService = Depends(get_workspace_service)
):
    try:
        progress = await service.get_workspace_progress(workspace_id)
        return {"status": "success", "message": "Progress retrieved", "data": progress}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
