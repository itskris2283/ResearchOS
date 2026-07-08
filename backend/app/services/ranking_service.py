from loguru import logger
from app.utils.logger import setup_logger

logger = setup_logger()


class RankingService:
    async def calculate_relevance_score(
        self, paper: dict, topic_embedding: list[float]
    ) -> float:
        semantic_similarity = paper.get("semantic_similarity", 0.5)
        citation_count = min(paper.get("citation_count", 0) / 1000, 1.0)
        current_year = 2026
        year = paper.get("year", current_year)
        recency = (
            1.0 - (current_year - year) / max(current_year - 2000, 1) if year else 0.5
        )
        venue_quality = paper.get("venue_quality", 0.5)
        author_influence = paper.get("author_influence", 0.5)
        implementation_availability = 1.0 if paper.get("implementation_links") else 0.0

        score = (
            semantic_similarity * 0.3
            + citation_count * 0.2
            + recency * 0.15
            + venue_quality * 0.1
            + author_influence * 0.1
            + implementation_availability * 0.15
        )
        return round(score, 4)

    async def rank_papers(self, papers: list, topic: str) -> list:
        scored = []
        for paper in papers:
            score = await self.calculate_relevance_score(paper, [])
            scored.append((score, paper))

        scored.sort(key=lambda x: x[0], reverse=True)
        ranked = [paper for score, paper in scored]

        for i, paper in enumerate(ranked):
            paper["relevance_score"] = scored[i][0]

        logger.info(f"Ranked {len(ranked)} papers for topic '{topic}'")
        return ranked
