import re
from typing import Optional
from bson import ObjectId
from loguru import logger
from app.models.paper import Paper


class PaperRepository:
    async def create_paper(self, data: dict) -> Paper:
        paper = Paper(**data)
        await paper.insert()
        logger.info(f"Created paper {paper.id}")
        return paper

    async def get_paper(self, paper_id: str) -> Optional[Paper]:
        paper = await Paper.get(ObjectId(paper_id))
        if not paper:
            logger.warning(f"Paper {paper_id} not found")
        return paper

    async def get_workspace_papers(self, workspace_id: str) -> list[Paper]:
        papers = await Paper.find(Paper.workspace_id == workspace_id).to_list()
        logger.debug(f"Found {len(papers)} papers in workspace {workspace_id}")
        return papers

    async def find_papers_by_query(self, workspace_id: str, query: str) -> list[Paper]:
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        papers = await Paper.find(
            Paper.workspace_id == workspace_id,
            Paper.title.regex(pattern) | Paper.abstract.regex(pattern),
        ).to_list()
        logger.debug(f"Found {len(papers)} papers matching query '{query}'")
        return papers

    async def delete_paper(self, paper_id: str) -> bool:
        paper = await self.get_paper(paper_id)
        if not paper:
            return False
        await paper.delete()
        logger.info(f"Deleted paper {paper_id}")
        return True

    async def bulk_create(self, papers_data: list[dict]) -> list[Paper]:
        papers = []
        for data in papers_data:
            try:
                papers.append(Paper(**data))
            except Exception as e:
                logger.warning(f"Failed to validate paper {data.get('title', 'Unknown')}: {e}")
                continue
                
        inserted = []
        for paper in papers:
            try:
                await paper.insert()
                inserted.append(paper)
            except Exception as e:
                logger.warning(f"Failed to insert paper {paper.title}: {e}")
                continue
        logger.info(f"Bulk created {len(inserted)} papers")
        return inserted
