from loguru import logger
from datetime import datetime
from typing import Optional
from app.models.roadmap import Roadmap
from app.utils.logger import setup_logger

logger = setup_logger()


class RoadmapService:
    async def generate_roadmap(self, workspace_id: str) -> dict:
        from app.config import settings
        from app.models.paper import Paper
        from app.models.workspace import Workspace
        from bson import ObjectId
        import httpx
        import json

        workspace = await Workspace.get(ObjectId(workspace_id))
        topic = workspace.topic or workspace.title if workspace else "Research Topic"
        
        papers = await Paper.find(Paper.workspace_id == workspace_id).sort("-citation_count").limit(40).to_list()
        
        if not papers:
            return {"workspace_id": workspace_id, "steps": []}
            
        papers_context = ""
        for i, p in enumerate(papers):
            papers_context += f"[{i+1}] Title: {p.title}\nID: {p.id or p.doi or f'paper_{i}'}\nYear: {p.year}\nAbstract: {p.abstract[:300] if p.abstract else 'N/A'}\n\n"

        system_prompt = f"""
        You are an expert AI research scientist designing a structured learning roadmap for a student.
        Based on the provided papers, generate a highly structured step-by-step roadmap for learning about "{topic}".
        Return ONLY a JSON object with a single key 'steps', containing an array of step objects.
        Each step object must have:
        - "day": Integer (e.g. 1, 2, 3...) indicating the order.
        - "title": Title of the learning step (e.g. "Core Concepts", "Advanced Architectures").
        - "description": A concise paragraph describing what to learn and why.
        - "duration_hours": Estimated hours to complete this step (integer).
        - "papers": A list of strings containing the exact titles of the specific papers to read for this step.
        - "resources": An empty array [].
        
        Output MUST be valid parseable JSON. Do not include markdown code block formatting like ```json. Just output the raw JSON object starting with {{.
        """

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"},
                    json={
                        "model": settings.OPENROUTER_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Papers:\n{papers_context}"},
                        ],
                    },
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"].strip()
                
                if content.startswith("```json"):
                    content = content[7:-3]
                elif content.startswith("```"):
                    content = content[3:-3]
                    
                result = json.loads(content)
                steps = result.get("steps", [])
                
        except Exception as e:
            logger.error(f"Failed to generate roadmap: {e}")
            steps = [
                {
                    "day": 1,
                    "title": "Generation Failed",
                    "description": f"An error occurred while calling the AI model: {str(e)}. Please try again later.",
                    "duration_hours": 0,
                    "paper_ids": [],
                    "resources": []
                }
            ]
            
        roadmap_data = {
            "workspace_id": workspace_id,
            "steps": steps,
        }
        logger.info(f"Generated roadmap for workspace {workspace_id} on topic '{topic}'")
        return roadmap_data

    async def store_roadmap(self, workspace_id: str, roadmap: dict):
        existing = await Roadmap.find_one(Roadmap.workspace_id == workspace_id)
        if existing:
            existing.steps = roadmap.get("steps", [])
            await existing.save()
        else:
            doc = Roadmap(
                workspace_id=workspace_id,
                steps=roadmap.get("steps", []),
            )
            await doc.insert()
        logger.info(f"Stored roadmap for workspace {workspace_id}")

    async def get_roadmap(self, workspace_id: str) -> dict:
        existing = await Roadmap.find_one(Roadmap.workspace_id == workspace_id)
        if existing:
            return {
                "workspace_id": workspace_id,
                "steps": existing.steps
            }
        return {
            "workspace_id": workspace_id,
            "steps": []
        }
