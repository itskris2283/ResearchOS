from fastapi import APIRouter, HTTPException, Depends, Body
from app.services.note_service import NoteService

router = APIRouter()


async def get_note_service():
    return NoteService()


@router.get("/{workspace_id}")
async def list_notes(
    workspace_id: str, service: NoteService = Depends(get_note_service)
):
    try:
        result = await service.get_workspace_notes(workspace_id)
        return {"status": "success", "message": "Notes retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def create_note(
    workspace_id: str = Body(...),
    title: str = Body(...),
    content: str = Body(""),
    service: NoteService = Depends(get_note_service),
):
    try:
        note = await service.create_note(workspace_id, title, content)
        return {"status": "success", "message": "Note created", "data": note}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/{note_id}")
async def get_note(
    workspace_id: str, note_id: str, service: NoteService = Depends(get_note_service)
):
    try:
        result = await service.get_note(note_id)
        if not result:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"status": "success", "message": "Note retrieved", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{workspace_id}/{note_id}")
async def update_note(
    workspace_id: str,
    note_id: str,
    data: dict,
    service: NoteService = Depends(get_note_service),
):
    try:
        result = await service.update_note(note_id, data)
        if not result:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"status": "success", "message": "Note updated", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{workspace_id}/{note_id}")
async def delete_note(
    workspace_id: str, note_id: str, service: NoteService = Depends(get_note_service)
):
    try:
        await service.delete_note(note_id)
        return {"status": "success", "message": "Note deleted", "data": None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
