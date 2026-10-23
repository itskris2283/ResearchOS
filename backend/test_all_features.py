import asyncio
import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_all_features():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60.0) as client:
        results = []
        
        async def record(name, method, url, res):
            status = res.status_code
            ok = status in [200, 201, 204]
            results.append({
                "feature": name,
                "method": method,
                "url": url,
                "status": status,
                "ok": ok,
                "detail": str(res.json() if "application/json" in res.headers.get("content-type", "") else res.text[:100])
            })
            print(f"[{'PASS' if ok else 'FAIL'}] {method} {url} -> {status}")

        # 1. Health & Root
        r = await client.get("/")
        await record("Root", "GET", "/", r)
        r = await client.get("/health")
        await record("Health", "GET", "/health", r)

        # 2. Auth
        test_email = "deploy_test@researchos.ai"
        test_pass = "TestPassword123!"
        r = await client.post("/api/v1/auth/register", json={"email": test_email, "password": test_pass, "name": "Deploy Test"})
        await record("Auth Register", "POST", "/api/v1/auth/register", r)
        
        r = await client.post("/api/v1/auth/login", json={"email": test_email, "password": test_pass})
        await record("Auth Login", "POST", "/api/v1/auth/login", r)
        token = ""
        if r.status_code == 200:
            token = r.json().get("access_token", "")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        r = await client.get("/api/v1/auth/me", headers=headers)
        await record("Auth Me", "GET", "/api/v1/auth/me", r)

        # 3. Workspaces
        r = await client.get("/api/v1/workspaces/?user_id=guest")
        await record("List Workspaces", "GET", "/api/v1/workspaces/?user_id=guest", r)
        ws_id = ""
        if r.status_code == 200 and r.json().get("data"):
            ws_id = str(r.json()["data"][0].get("_id") or r.json()["data"][0].get("id"))
            print(f"Using workspace_id: {ws_id}")

        if not ws_id:
            r = await client.post("/api/v1/workspaces/", json={"user_id": "guest", "topic": "Robotics", "title": "Test Robotics"})
            await record("Create Workspace", "POST", "/api/v1/workspaces/", r)
            if r.status_code in [200, 201]:
                ws_id = str(r.json().get("data", {}).get("_id", ""))

        if ws_id:
            r = await client.get(f"/api/v1/workspaces/{ws_id}")
            await record("Get Workspace", "GET", f"/api/v1/workspaces/{ws_id}", r)

            # 4. Papers
            r = await client.get(f"/api/v1/papers/?workspace_id={ws_id}")
            await record("Papers List", "GET", f"/api/v1/papers/?workspace_id={ws_id}", r)

            # 5. Authors
            r = await client.get(f"/api/v1/authors/?workspace_id={ws_id}")
            await record("Authors List", "GET", f"/api/v1/authors/?workspace_id={ws_id}", r)

            # 6. Datasets
            r = await client.get(f"/api/v1/datasets/?workspace_id={ws_id}")
            await record("Datasets List", "GET", f"/api/v1/datasets/?workspace_id={ws_id}", r)

            # 7. Knowledge Graphs
            for gtype in ["knowledge", "citation", "concept", "author", "dataset", "topic"]:
                r = await client.get(f"/api/v1/graph/{ws_id}/{gtype}")
                await record(f"Graph {gtype}", "GET", f"/api/v1/graph/{ws_id}/{gtype}", r)

            # 8. Timeline
            r = await client.get(f"/api/v1/timeline/{ws_id}")
            await record("Timeline", "GET", f"/api/v1/timeline/{ws_id}", r)

            # 9. Literature Review
            r = await client.get(f"/api/v1/review/{ws_id}")
            await record("Review", "GET", f"/api/v1/review/{ws_id}", r)

            # 10. Roadmap
            r = await client.get(f"/api/v1/roadmap/{ws_id}")
            await record("Roadmap", "GET", f"/api/v1/roadmap/{ws_id}", r)

            # 11. Analytics
            r = await client.get(f"/api/v1/analytics/{ws_id}")
            await record("Analytics", "GET", f"/api/v1/analytics/{ws_id}", r)

            # 12. Concepts
            r = await client.get(f"/api/v1/concepts/?workspace_id={ws_id}")
            await record("Concepts", "GET", f"/api/v1/concepts/?workspace_id={ws_id}", r)

            # 13. Implementations
            r = await client.get(f"/api/v1/implementations/?workspace_id={ws_id}")
            await record("Implementations", "GET", f"/api/v1/implementations/?workspace_id={ws_id}", r)

            # 14. Benchmarks
            r = await client.get(f"/api/v1/benchmarks/?workspace_id={ws_id}")
            await record("Benchmarks", "GET", f"/api/v1/benchmarks/?workspace_id={ws_id}", r)

            # 15. Institutions
            r = await client.get(f"/api/v1/institutions/?workspace_id={ws_id}")
            await record("Institutions", "GET", f"/api/v1/institutions/?workspace_id={ws_id}", r)

            # 16. Notes
            r = await client.get(f"/api/v1/notes/?workspace_id={ws_id}")
            await record("Notes", "GET", f"/api/v1/notes/?workspace_id={ws_id}", r)

            # 17. Assistant (Chat)
            r = await client.post("/api/v1/assistant/chat", json={
                "workspace_id": ws_id,
                "message": "Summarize this workspace",
                "history": []
            })
            await record("Assistant Chat", "POST", "/api/v1/assistant/chat", r)

        # 18. Bookmarks
        r = await client.get("/api/v1/bookmarks/?user_id=guest")
        await record("Bookmarks", "GET", "/api/v1/bookmarks/?user_id=guest", r)

        # 19. Search
        r = await client.get("/api/v1/search/?q=robotics")
        await record("Search", "GET", "/api/v1/search/?q=robotics", r)

        # 20. Discovery
        r = await client.post("/api/v1/discovery/search", json={"query": "Vision Transformers", "limit": 5})
        await record("Discovery Search", "POST", "/api/v1/discovery/search", r)

        # 21. Sessions
        r = await client.get("/api/v1/sessions/?user_id=guest")
        await record("Sessions", "GET", "/api/v1/sessions/?user_id=guest", r)

        # 22. Export
        if ws_id:
            r = await client.get(f"/api/v1/workspaces/export/all?user_id=guest")
            await record("Export All", "GET", "/api/v1/workspaces/export/all?user_id=guest", r)

        # Print Summary
        passed = sum(1 for x in results if x["ok"])
        total = len(results)
        print(f"\n===============================")
        print(f"Summary: {passed}/{total} features passed")
        print(f"===============================")

        with open("test_results.json", "w") as f:
            json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(test_all_features())
