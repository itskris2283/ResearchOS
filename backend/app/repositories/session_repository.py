from typing import Optional
from loguru import logger
from app.models.session import Session


class SessionRepository:
    async def create_session(self, data: dict) -> Session:
        session = Session(**data)
        await session.insert()
        logger.info(
            f"Created session {session.id} for workspace {data.get('workspace_id')}"
        )
        return session

    async def get_workspace_sessions(self, workspace_id: str) -> list[Session]:
        sessions = (
            await Session.find(Session.workspace_id == workspace_id)
            .sort(-Session.session_number)
            .to_list()
        )
        logger.debug(f"Found {len(sessions)} sessions for workspace {workspace_id}")
        return sessions

    async def get_latest_session(self, workspace_id: str) -> Optional[Session]:
        session = await Session.find_one(
            Session.workspace_id == workspace_id,
            sort=-Session.session_number,
        )
        if not session:
            logger.debug(f"No sessions found for workspace {workspace_id}")
        return session
