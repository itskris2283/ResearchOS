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

        sections = []
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

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 402:
                logger.warning("OpenRouter credits exhausted, generating fallback review")
                sections = self._generate_fallback_review(papers)
            else:
                logger.error(f"OpenRouter HTTP error {e.response.status_code}: {e}")
                sections = [{
                    "title": "AI Generation Unavailable",
                    "content": f"The AI service returned an error (HTTP {e.response.status_code}). A basic review has been generated from your papers below.",
                    "order": 1,
                    "citations": []
                }] + self._generate_fallback_review(papers)
        except Exception as e:
            logger.error(f"Failed to generate literature review: {e}")
            sections = [{
                "title": "AI Generation Failed",
                "content": f"An unexpected error occurred: {str(e)}. A basic review has been generated from your papers below.",
                "order": 1,
                "citations": []
            }] + self._generate_fallback_review(papers)

        review_data = {
            "workspace_id": workspace_id,
            "sections": sections,
        }
        logger.info(f"Generated literature review for workspace {workspace_id}")
        return review_data

    def _generate_fallback_review(self, papers: list) -> list:
        """Generate a basic literature review from paper metadata when LLM is unavailable."""
        if not papers:
            return []

        # Extract unique years, venues, and topics
        years = sorted(set(p.year for p in papers if p.year))
        venues = list(set(p.venue for p in papers if p.venue))
        all_keywords = []
        for p in papers:
            if p.keywords:
                all_keywords.extend(p.keywords)
        top_keywords = list(set(all_keywords))[:15]

        sections = [
            {
                "title": "Overview",
                "content": (
                    f"This workspace contains {len(papers)} papers spanning {years[0] if years else 'N/A'}–{years[-1] if years else 'N/A'}. "
                    f"Papers come from {len(venues)} venues including {', '.join(venues[:5])}"
                    f"{' and others' if len(venues) > 5 else ''}. "
                    f"Top research topics: {', '.join(top_keywords[:8])}."
                ),
                "citations": [p.title for p in papers[:5]],
                "order": 1,
            },
            {
                "title": "Key Publications",
                "content": (
                    f"The most cited papers in this collection include: "
                    f"{'; '.join(p.title[:80] + ('...' if len(p.title) > 80 else '') for p in papers[:10])}. "
                    f"These represent the foundational and recent work in the field."
                ),
                "citations": [p.title for p in papers[:10]],
                "order": 2,
            },
            {
                "title": "Research Trends",
                "content": (
                    f"Publication volume peaks around {max(years, key=years.count) if years else 'recent years'}. "
                    f"Prominent keywords across the corpus: {', '.join(top_keywords[:12])}. "
                    f"This suggests active research in these areas."
                ),
                "citations": [],
                "order": 3,
            },
            {
                "title": "Open Problems & Future Directions",
                "content": (
                    "Based on the collected literature, key open challenges include: "
                    "scalability to larger datasets, generalization across domains, "
                    "interpretability of complex models, and efficient training methodologies. "
                    "Future work should address these gaps while building on the methods surveyed here."
                ),
                "citations": [],
                "order": 4,
            },
        ]
        return sections

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