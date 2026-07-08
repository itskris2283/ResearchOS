from loguru import logger
from datetime import datetime
from typing import Optional
from app.models.literature_review import LiteratureReview
from app.utils.logger import setup_logger

logger = setup_logger()


class LiteratureService:
    async def generate_literature_review(self, workspace_id: str) -> dict:
        from app.config import settings
        from app.models.paper import Paper
        import httpx
        import json
        
        papers = await Paper.find(Paper.workspace_id == workspace_id).sort("-citation_count").limit(40).to_list()
        
        if not papers:
            return {"workspace_id": workspace_id, "sections": []}
            
        papers_context = ""
        for i, p in enumerate(papers):
            papers_context += f"[{i+1}] Title: {p.title}\nYear: {p.year}\nAbstract: {p.abstract[:500] if p.abstract else 'N/A'}\n\n"

        system_prompt = """
        You are an expert AI research scientist writing a comprehensive literature review.
        Based on the provided papers, generate a structured literature review.
        Return ONLY a JSON object with a single key 'sections', containing an array of section objects.
        Each section object must have:
        - "title": Section title (e.g. "Background", "Classical Methods", "Deep Learning", "Current Limitations", "Research Gaps").
        - "content": A detailed, highly technical paragraph summarizing the literature for this section, making references to the provided papers where relevant.
        - "citations": A list of strings containing the exact titles of the papers you referenced in this section.
        - "order": Integer order.
        
        Output MUST be valid parseable JSON. Do not include markdown code block formatting like ```json. Just output the raw JSON object starting with {.
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
                sections = result.get("sections", [])
                
        except Exception as e:
            logger.error(f"Failed to generate literature review: {e}")
            sections = [
                {
                    "title": "Generation Failed",
                    "content": f"An error occurred while calling the AI model: {str(e)}. Please try again later.",
                    "order": 1,
                    "citations": []
                }
            ]
        review_data = {
            "workspace_id": workspace_id,
            "sections": sections,
        }
        logger.info(f"Generated literature review for workspace {workspace_id}")
        return review_data

    async def store_review(self, workspace_id: str, review: dict):
        existing = await LiteratureReview.find_one(
            LiteratureReview.workspace_id == workspace_id
        )
        if existing:
            existing.sections = review.get("sections", [])
            existing.updated_at = datetime.utcnow()
            await existing.save()
        else:
            doc = LiteratureReview(
                workspace_id=workspace_id,
                sections=review.get("sections", []),
            )
            await doc.insert()
        logger.info(f"Stored literature review for workspace {workspace_id}")

    async def get_review(self, workspace_id: str) -> dict:
        existing = await LiteratureReview.find_one(
            LiteratureReview.workspace_id == workspace_id
        )
        if existing:
            return {
                "workspace_id": workspace_id,
                "sections": existing.sections
            }
        return {
            "workspace_id": workspace_id,
            "sections": []
        }
