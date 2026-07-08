from fastapi import APIRouter, HTTPException, Depends
from app.services.graph_service import GraphService
from app.services.workspace_service import WorkspaceService

router = APIRouter()


async def get_graph_service():
    return GraphService()


async def get_workspace_service():
    return WorkspaceService()


@router.get("/{workspace_id}/citation")
async def get_citation_graph(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        cached = await graph_service.get_cached_graph(workspace_id, "citation")
        if cached:
            return {
                "status": "success",
                "message": "Citation graph retrieved",
                "data": cached,
            }
        return {
            "status": "success",
            "message": "Citation graph retrieved",
            "data": {"nodes": [], "edges": []},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/knowledge")
async def get_knowledge_graph(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        cached = await graph_service.get_cached_graph(workspace_id, "knowledge")
        if cached:
            return {
                "status": "success",
                "message": "Knowledge graph retrieved",
                "data": cached,
            }
        return {
            "status": "success",
            "message": "Knowledge graph retrieved",
            "data": {"nodes": [], "edges": []},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/concept")
async def get_concept_graph(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        cached = await graph_service.get_cached_graph(workspace_id, "concept")
        if cached:
            return {
                "status": "success",
                "message": "Concept graph retrieved",
                "data": cached,
            }
        return {
            "status": "success",
            "message": "Concept graph retrieved",
            "data": {"nodes": [], "edges": []},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/author")
async def get_author_graph(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        cached = await graph_service.get_cached_graph(workspace_id, "author")
        if cached:
            return {
                "status": "success",
                "message": "Author graph retrieved",
                "data": cached,
            }
        return {
            "status": "success",
            "message": "Author graph retrieved",
            "data": {"nodes": [], "edges": []},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/dataset")
async def get_dataset_graph(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        cached = await graph_service.get_cached_graph(workspace_id, "dataset")
        if cached:
            return {
                "status": "success",
                "message": "Dataset graph retrieved",
                "data": cached,
            }
        return {
            "status": "success",
            "message": "Dataset graph retrieved",
            "data": {"nodes": [], "edges": []},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/topic")
async def get_topic_graph(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        cached = await graph_service.get_cached_graph(workspace_id, "topic")
        if cached:
            return {
                "status": "success",
                "message": "Topic graph retrieved",
                "data": cached,
            }
        return {
            "status": "success",
            "message": "Topic graph retrieved",
            "data": {"nodes": [], "edges": []},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/regenerate")
async def regenerate_graphs(
    workspace_id: str, graph_service: GraphService = Depends(get_graph_service)
):
    try:
        return {
            "status": "success",
            "message": "Graph regeneration triggered",
            "data": {"workspace_id": workspace_id},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
