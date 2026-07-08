"""Quick test to verify the ResearchOS backend starts and responds."""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))


async def test():
    from httpx import AsyncClient

    base = "http://127.0.0.1:8000"

    async with AsyncClient(base_url=base) as client:
        r = await client.get("/")
        print(f"GET / -> {r.status_code}")
        print(f"  Response: {r.json()}")

        r = await client.get("/health")
        print(f"GET /health -> {r.status_code}")
        print(f"  Response: {r.json()}")

        r = await client.post(
            "/api/v1/workspaces/",
            params={
                "user_id": "test-user",
                "topic": "Vision Transformers for Pest Classification",
                "title": "Test Workspace",
            },
        )
        print(f"POST /api/v1/workspaces/ -> {r.status_code}")
        print(f"  Response: {r.json()}")
        ws_id = r.json().get("data", {}).get("workspace_id")

        r = await client.get("/api/v1/workspaces/", params={"user_id": "test-user"})
        print(f"GET /api/v1/workspaces/ -> {r.status_code}")
        print(f"  Response: {r.json()}")

        if ws_id:
            r = await client.get(f"/api/v1/workspaces/{ws_id}")
            print(f"GET /api/v1/workspaces/{ws_id} -> {r.status_code}")
            print(f"  Response: {r.json()}")

        print("\n✅ All endpoints working!")


if __name__ == "__main__":
    asyncio.run(test())
