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
