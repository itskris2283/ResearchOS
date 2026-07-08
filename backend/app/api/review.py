from fastapi import APIRouter, HTTPException, Depends
from app.services.literature_service import LiteratureService

router = APIRouter()


async def get_literature_service():
    return LiteratureService()


@router.get("/{workspace_id}")
async def get_review(
    workspace_id: str, service: LiteratureService = Depends(get_literature_service)
):
    try:
        result = await service.get_review(workspace_id)
        return {
            "status": "success",
            "message": "Literature review retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/generate")
async def generate_review(
    workspace_id: str, service: LiteratureService = Depends(get_literature_service)
):
    try:
        result = await service.generate_literature_review(workspace_id)
        await service.store_review(workspace_id, result)
        return {
            "status": "success",
            "message": "Literature review generated",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/export")
async def export_review(
    workspace_id: str, service: LiteratureService = Depends(get_literature_service)
):
    try:
        result = await service.generate_literature_review(workspace_id)
        markdown = f"# Literature Review\n\n"
        for section in result.get("sections", []):
            markdown += f"## {section['title']}\n\n{section['content']}\n\n"
        return {
            "status": "success",
            "message": "Review exported",
            "data": {"markdown": markdown},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
