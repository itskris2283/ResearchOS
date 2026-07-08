from fastapi import APIRouter, HTTPException, Depends
from app.services.session_service import SessionService

router = APIRouter()


async def get_session_service():
    return SessionService()


@router.get("/{workspace_id}")
async def list_sessions(
    workspace_id: str, service: SessionService = Depends(get_session_service)
):
    try:
        result = await service.get_workspace_sessions(workspace_id)
        return {"status": "success", "message": "Sessions retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}")
async def create_session(
    workspace_id: str, service: SessionService = Depends(get_session_service)
):
    try:
        session_id = await service.create_session(workspace_id)
        return {
            "status": "success",
            "message": "Session created",
            "data": {"session_id": session_id},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/{session_id}")
async def get_session(
    workspace_id: str,
    session_id: str,
    service: SessionService = Depends(get_session_service),
):
    try:
        result = await service.get_session(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return {
            "status": "success",
            "message": "Session details retrieved",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
