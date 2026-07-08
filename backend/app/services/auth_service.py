from app.repositories.workspace_repository import WorkspaceRepository


class AuthService:
    async def login(self, email: str, password: str):
        return {"user_id": "mock-user-id", "email": email, "name": "Test User"}

    async def register(self, email: str, password: str, name: str):
        return {"user_id": "mock-user-id", "email": email, "name": name}

    async def get_current_user(self, user_id: str):
        return {
            "_id": user_id,
            "name": "Test User",
            "email": "test@example.com",
            "is_guest": False,
        }

    async def create_guest_session(self):
        return {"user_id": "guest-123456", "is_guest": True, "name": "Guest User"}
