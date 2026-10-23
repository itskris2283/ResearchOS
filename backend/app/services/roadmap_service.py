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

        steps = []
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

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 402:
                logger.warning("OpenRouter credits exhausted, generating fallback roadmap")
                steps = self._generate_fallback_roadmap(papers, topic)
            else:
                logger.error(f"OpenRouter HTTP error {e.response.status_code}: {e}")
                steps = [{
                    "day": 1,
                    "title": "AI Generation Unavailable",
                    "description": f"The AI service returned an error (HTTP {e.response.status_code}). A basic roadmap has been generated from your papers below.",
                    "duration_hours": 0,
                    "papers": [],
                    "resources": []
                }] + self._generate_fallback_roadmap(papers, topic)
        except Exception as e:
            logger.error(f"Failed to generate roadmap: {e}")
            steps = [{
                "day": 1,
                "title": "AI Generation Failed",
                "description": f"An unexpected error occurred: {str(e)}. A basic roadmap has been generated from your papers below.",
                "duration_hours": 0,
                "papers": [],
                "resources": []
            }] + self._generate_fallback_roadmap(papers, topic)

        roadmap_data = {
            "workspace_id": workspace_id,
            "steps": steps,
        }
        logger.info(f"Generated roadmap for workspace {workspace_id} on topic '{topic}'")
        return roadmap_data

    def _generate_fallback_roadmap(self, papers: list, topic: str) -> list:
        """Generate a basic learning roadmap from paper metadata when LLM is unavailable."""
        if not papers:
            return []

        # Group papers by year for a temporal progression
        papers_by_year = {}
        for p in papers:
            if p.year:
                papers_by_year.setdefault(p.year, []).append(p)

        sorted_years = sorted(papers_by_year.keys())
        if not sorted_years:
            sorted_years = [2020, 2022, 2024]

        steps = [
            {
                "day": 1,
                "title": "Foundations & Survey",
                "description": (
                    f"Start by understanding the landscape of {topic}. Read the most cited survey and "
                    f"foundational papers to build mental models. Focus on terminology, key problems, "
                    f"and evaluation metrics used in the field."
                ),
                "duration_hours": 4,
                "papers": [p.title for p in papers[:5]],
                "resources": []
            },
            {
                "day": 2,
                "title": "Classical Methods",
                "description": (
                    f"Study the classical approaches that established the field. Understand the theoretical "
                    f"foundations, mathematical formulations, and why they worked (or didn't) for their time."
                ),
                "duration_hours": 5,
                "papers": [p.title for p in papers_by_year.get(sorted_years[0], papers[:3])],
                "resources": []
            },
            {
                "day": 3,
                "title": "Modern Deep Learning Approaches",
                "description": (
                    f"Transition to contemporary deep learning methods. Focus on architecture innovations, "
                    f"training tricks, and how they improved upon classical baselines. Key papers from "
                    f"{sorted_years[-2] if len(sorted_years) > 1 else 'recent years'}–{sorted_years[-1]}."
                ),
                "duration_hours": 6,
                "papers": [p.title for p in papers_by_year.get(sorted_years[-1], papers[5:10])],
                "resources": []
            },
            {
                "day": 4,
                "title": "Advanced Topics & Specializations",
                "description": (
                    f"Explore specialized sub-areas: efficiency (pruning, distillation, quantization), "
                    f"robustness (adversarial, out-of-distribution), and emerging paradigms "
                    f"(foundation models, multimodal, retrieval-augmented)."
                ),
                "duration_hours": 5,
                "papers": [p.title for p in papers[10:15] if p.keywords],
                "resources": []
            },
            {
                "day": 5,
                "title": "Reproduction & Experimentation",
                "description": (
                    "Reproduce 1-2 key papers from the collection. Modify architectures, test on new "
                    "datasets, or ablate components. This builds practical intuition that reading alone "
                    "cannot provide. Document findings for your literature review."
                ),
                "duration_hours": 8,
                "papers": [p.title for p in papers if "implementation" in (p.abstract or "").lower()][:3] or [p.title for p in papers[:3]],
                "resources": []
            },
            {
                "day": 6,
                "title": "Research Gaps & Project Definition",
                "description": (
                    "Synthesize your understanding to identify open problems. Compare methods across "
                    "papers, note contradictory results, and formulate a concrete research question or "
                    "project proposal with clear hypotheses and evaluation plans."
                ),
                "duration_hours": 4,
                "papers": [],
                "resources": []
            },
        ]
        return steps

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