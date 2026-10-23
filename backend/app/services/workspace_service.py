from loguru import logger
from typing import Optional
from datetime import datetime
from app.models.workspace import Workspace
from app.repositories.workspace_repository import WorkspaceRepository
from app.services.discovery_service import DiscoveryService
from app.utils.logger import setup_logger

logger = setup_logger()


class WorkspaceService:
    def __init__(self):
        self.workspace_repo = WorkspaceRepository()
        self.discovery_service = DiscoveryService()

    async def create_workspace(self, user_id: str, topic: str, title: str) -> dict:
        workspace = await self.workspace_repo.create_workspace(
            {
                "user_id": user_id,
                "topic": topic,
                "title": title,
                "status": "creating",
            }
        )
        workspace_id = str(workspace.id)
        logger.info(
            f"Created workspace {workspace_id} for user {user_id} on topic '{topic}'"
        )

        # Trigger discovery pipeline in background (caller should fire-and-forget)
        import asyncio

        asyncio.ensure_future(
            self.discovery_service.discover_topic(topic, workspace_id)
        )

        return workspace.model_dump(by_alias=True)

    async def get_workspace(self, workspace_id: str) -> Optional[dict]:
        workspace = await self.workspace_repo.get_workspace(workspace_id)
        if not workspace:
            return None
        return workspace.model_dump(by_alias=True)

    async def get_user_workspaces(self, user_id: str) -> list:
        workspaces = await self.workspace_repo.get_user_workspaces(user_id)
        return [w.model_dump(by_alias=True) for w in workspaces]

    async def update_workspace(self, workspace_id: str, data: dict) -> Optional[dict]:
        data["updated_at"] = datetime.utcnow()
        workspace = await self.workspace_repo.update_workspace(workspace_id, data)
        if not workspace:
            return None
        return workspace.model_dump(by_alias=True)

    async def delete_workspace(self, workspace_id: str):
        await self.workspace_repo.delete_workspace(workspace_id)
        logger.info(f"Deleted workspace {workspace_id}")

    async def sync_workspace(self, workspace_id: str):
        workspace = await self.workspace_repo.get_workspace(workspace_id)
        if not workspace:
            logger.warning(f"Cannot sync: workspace {workspace_id} not found")
            return
            
        import asyncio
        asyncio.ensure_future(
            self.discovery_service.discover_topic(workspace.topic, workspace_id)
        )

    async def get_workspace_progress(self, workspace_id: str) -> dict:
        workspace = await self.workspace_repo.get_workspace(workspace_id)
        if not workspace:
            return {}
        status_parts = (workspace.status or "unknown:0").split(":")
        return {
            "workspace_id": workspace_id,
            "stage": status_parts[0] if len(status_parts) > 0 else "unknown",
            "progress": int(status_parts[1]) if len(status_parts) > 1 else 0,
        }

    async def export_all_user_data(self, user_id: str) -> dict:
        from app.models.workspace import Workspace
        from app.models.paper import Paper
        from app.models.graph_cache import GraphCache
        from app.models.literature_review import LiteratureReview
        from app.models.roadmap import Roadmap
        from app.models.note import Note
        from app.models.session import Session
        from app.models.author import Author
        from app.models.dataset import Dataset
        from app.models.method import Method
        from app.models.concept import Concept
        from app.models.timeline_cache import TimelineCache
        from app.models.bookmark import Bookmark

        workspaces = await Workspace.find(Workspace.user_id == user_id).to_list()
        workspace_ids = [str(w.id) for w in workspaces]

        papers = await Paper.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        graphs = await GraphCache.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        reviews = await LiteratureReview.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        roadmaps = await Roadmap.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        notes = await Note.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        sessions = await Session.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        authors = await Author.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        datasets = await Dataset.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        methods = await Method.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        concepts = await Concept.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        timelines = await TimelineCache.find({"workspace_id": {"$in": workspace_ids}}).to_list() if workspace_ids else []
        bookmarks = await Bookmark.find(Bookmark.user_id == user_id).to_list()

        return {
            "user_id": user_id,
            "exported_at": datetime.utcnow().isoformat(),
            "workspaces": [w.model_dump(by_alias=True) for w in workspaces],
            "papers": [p.model_dump(by_alias=True) for p in papers],
            "graphs": [g.model_dump(by_alias=True) for g in graphs],
            "literature_reviews": [r.model_dump(by_alias=True) for r in reviews],
            "roadmaps": [r.model_dump(by_alias=True) for r in roadmaps],
            "notes": [n.model_dump(by_alias=True) for n in notes],
            "sessions": [s.model_dump(by_alias=True) for s in sessions],
            "authors": [a.model_dump(by_alias=True) for a in authors],
            "datasets": [d.model_dump(by_alias=True) for d in datasets],
            "methods": [m.model_dump(by_alias=True) for m in methods],
            "concepts": [c.model_dump(by_alias=True) for c in concepts],
            "timelines": [t.model_dump(by_alias=True) for t in timelines],
            "bookmarks": [b.model_dump(by_alias=True) for b in bookmarks],
        }

    async def delete_all_user_data(self, user_id: str):
        from app.models.workspace import Workspace
        from app.models.paper import Paper
        from app.models.graph_cache import GraphCache
        from app.models.literature_review import LiteratureReview
        from app.models.roadmap import Roadmap
        from app.models.note import Note
        from app.models.session import Session
        from app.models.author import Author
        from app.models.dataset import Dataset
        from app.models.method import Method
        from app.models.concept import Concept
        from app.models.timeline_cache import TimelineCache
        from app.models.bookmark import Bookmark

        workspaces = await Workspace.find(Workspace.user_id == user_id).to_list()
        workspace_ids = [str(w.id) for w in workspaces]

        if workspace_ids:
            await Paper.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await GraphCache.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await LiteratureReview.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Roadmap.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Note.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Session.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Author.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Dataset.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Method.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await Concept.find({"workspace_id": {"$in": workspace_ids}}).delete()
            await TimelineCache.find({"workspace_id": {"$in": workspace_ids}}).delete()

        await Bookmark.find(Bookmark.user_id == user_id).delete()
        await Workspace.find(Workspace.user_id == user_id).delete()

        logger.info(f"Deleted all data for user {user_id}")
