from fastapi import APIRouter, HTTPException, Depends
from app.services.hypothesis_service import HypothesisService

router = APIRouter()


async def get_hypothesis_service():
    return HypothesisService()


@router.post("/test")
async def test_hypothesis(
    hypothesis: str,
    workspace_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
):
    try:
        result = await service.test_hypothesis(hypothesis, workspace_id)
        return {"status": "success", "message": "Hypothesis tested", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/generate")
async def generate_proposal(
    topic: str,
    workspace_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
):
    try:
        result = await service.generate_proposal(topic, workspace_id)
        return {
            "status": "success",
            "message": "Research proposal generated",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/novelty")
async def estimate_novelty(
    idea: str,
    workspace_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
):
    try:
        result = await service.estimate_novelty(idea, workspace_id)
        return {"status": "success", "message": "Novelty estimated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
