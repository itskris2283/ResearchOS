from fastapi import APIRouter, HTTPException, Depends
from app.services.export_service import ExportService

router = APIRouter()


async def get_export_service():
    return ExportService()


@router.post("/workspace/{workspace_id}")
async def export_workspace(
    workspace_id: str,
    format: str = "markdown",
    service: ExportService = Depends(get_export_service),
):
    try:
        result = await service.export_workspace(workspace_id, format)
        return {"status": "success", "message": "Workspace exported", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/review/{workspace_id}")
async def export_review(
    workspace_id: str,
    format: str = "markdown",
    service: ExportService = Depends(get_export_service),
):
    try:
        result = await service.export_review(workspace_id, format)
        return {"status": "success", "message": "Review exported", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/graph/{workspace_id}")
async def export_graph(
    workspace_id: str,
    format: str = "json",
    service: ExportService = Depends(get_export_service),
):
    try:
        result = await service.export_graph(workspace_id, format)
        return {"status": "success", "message": "Graph exported", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
