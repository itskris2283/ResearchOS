from loguru import logger
from typing import Optional
from datetime import datetime
from app.models.session import Session
from app.repositories.session_repository import SessionRepository
from app.utils.logger import setup_logger

logger = setup_logger()


class SessionService:
    def __init__(self):
        self.session_repo = SessionRepository()

    async def create_session(self, workspace_id: str) -> str:
        latest = await self.session_repo.get_latest_session(workspace_id)
        next_number = (latest.session_number + 1) if latest else 1
        session = await self.session_repo.create_session(
            {
                "workspace_id": workspace_id,
                "session_number": next_number,
            }
        )
        logger.info(
            f"Created session {session.id} (number {next_number}) for workspace {workspace_id}"
        )
        return str(session.id)

    async def get_workspace_sessions(self, workspace_id: str) -> list:
        sessions = await self.session_repo.get_workspace_sessions(workspace_id)
        return [s.model_dump() for s in sessions]

    async def get_session(self, session_id: str) -> Optional[dict]:
        session = await Session.find_one(Session.id == session_id)
        if not session:
            logger.warning(f"Session {session_id} not found")
            return None
        return session.model_dump()

    async def update_session(self, session_id: str, data: dict):
        session = await Session.find_one(Session.id == session_id)
        if not session:
            logger.warning(f"Session {session_id} not found")
            return
        for key, value in data.items():
            setattr(session, key, value)
        await session.save()
        logger.info(f"Updated session {session_id}")
