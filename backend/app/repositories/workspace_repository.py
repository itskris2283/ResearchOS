from typing import Optional
from loguru import logger
from bson import ObjectId
from app.models.workspace import Workspace


class WorkspaceRepository:
    async def create_workspace(self, data: dict) -> Workspace:
        workspace = Workspace(**data)
        await workspace.insert()
        logger.info(f"Created workspace {workspace.id}")
        return workspace

    async def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        workspace = await Workspace.get(ObjectId(workspace_id))
        if not workspace:
            logger.warning(f"Workspace {workspace_id} not found")
        return workspace

    async def get_user_workspaces(self, user_id: str) -> list[Workspace]:
        workspaces = (
            await Workspace.find(Workspace.user_id == user_id)
            .sort(-Workspace.updated_at)
            .to_list()
        )
        logger.debug(f"Found {len(workspaces)} workspaces for user {user_id}")
        return workspaces

    async def update_workspace(
        self, workspace_id: str, data: dict
    ) -> Optional[Workspace]:
        workspace = await self.get_workspace(workspace_id)
        if not workspace:
            return None
        for key, value in data.items():
            setattr(workspace, key, value)
        await workspace.save()
        logger.info(f"Updated workspace {workspace_id}")
        return workspace

    async def delete_workspace(self, workspace_id: str) -> bool:
        workspace = await self.get_workspace(workspace_id)
        if not workspace:
            return False
        await workspace.delete()
        logger.info(f"Deleted workspace {workspace_id}")
        return True

    async def get_workspace_statistics(self, workspace_id: str) -> Optional[dict]:
        workspace = await self.get_workspace(workspace_id)
        if not workspace:
            return None
        return workspace.statistics
