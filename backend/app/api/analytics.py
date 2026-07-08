from fastapi import APIRouter, HTTPException, Depends
from app.services.analytics_service import AnalyticsService

router = APIRouter()


async def get_analytics_service():
    return AnalyticsService()


@router.get("/{workspace_id}")
async def get_workspace_analytics(
    workspace_id: str, service: AnalyticsService = Depends(get_analytics_service)
):
    try:
        result = await service.get_analytics(workspace_id)
        return {"status": "success", "message": "Analytics retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/trends")
async def get_research_trends(
    workspace_id: str, service: AnalyticsService = Depends(get_analytics_service)
):
    try:
        result = await service.get_trends(workspace_id)
        return {"status": "success", "message": "Trends retrieved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/distributions")
async def get_distributions(
    workspace_id: str, service: AnalyticsService = Depends(get_analytics_service)
):
    try:
        result = await service.get_distributions(workspace_id)
        return {
            "status": "success",
            "message": "Distributions retrieved",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
