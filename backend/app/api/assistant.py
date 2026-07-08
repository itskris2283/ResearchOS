from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Optional
from pydantic import BaseModel
from app.services.assistant_service import AssistantService

router = APIRouter()


class ChatRequest(BaseModel):
    workspace_id: str
    message: str
    history: Optional[list] = None


class SummarizeRequest(BaseModel):
    paper_id: str


class CompareRequest(BaseModel):
    paper_ids: list[str]


class ExplainRequest(BaseModel):
    concept_name: str
    workspace_id: str


async def get_assistant_service():
    return AssistantService()


@router.post("/chat")
async def chat(
    body: ChatRequest,
    service: AssistantService = Depends(get_assistant_service),
):
    try:
        result = await service.chat(body.workspace_id, body.message, body.history or [])
        return {"status": "success", "message": "Response generated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/summarize")
async def summarize_paper(
    body: SummarizeRequest,
    service: AssistantService = Depends(get_assistant_service),
):
    try:
        result = await service.summarize_paper(body.paper_id)
        return {"status": "success", "message": "Summary generated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare")
async def compare_papers(
    body: CompareRequest,
    service: AssistantService = Depends(get_assistant_service),
):
    try:
        result = await service.compare_papers(body.paper_ids)
        return {"status": "success", "message": "Comparison generated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/explain")
async def explain_concept(
    body: ExplainRequest,
    service: AssistantService = Depends(get_assistant_service),
):
    try:
        result = await service.explain_concept(body.concept_name, body.workspace_id)
        return {"status": "success", "message": "Explanation generated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/history")
async def get_chat_history(
    workspace_id: str, service: AssistantService = Depends(get_assistant_service)
):
    try:
        result = await service.get_chat_history(workspace_id)
        return {
            "status": "success",
            "message": "Chat history retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
