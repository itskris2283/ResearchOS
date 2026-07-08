from loguru import logger
from typing import Optional
from app.models.dataset import Dataset
from app.repositories.dataset_repository import DatasetRepository
from app.utils.logger import setup_logger

logger = setup_logger()


class DatasetService:
    def __init__(self):
        self.dataset_repo = DatasetRepository()

    async def extract_datasets_from_papers(self, papers: list) -> list:
        datasets = []
        seen = set()
        for paper in papers:
            for ds_name in paper.get("datasets", []):
                if ds_name and ds_name not in seen:
                    seen.add(ds_name)
                    datasets.append(
                        {
                            "name": ds_name,
                            "source_paper_id": paper.get("id") or paper.get("doi"),
                        }
                    )
        logger.info(f"Extracted {len(datasets)} datasets from {len(papers)} papers")
        return datasets

    async def list_datasets(self, workspace_id: Optional[str] = None) -> list:
        if not workspace_id:
            return []
            
        from app.models.paper import Paper
        papers = await Paper.find(Paper.workspace_id == workspace_id).to_list()
        
        dataset_stats = {}
        for paper in papers:
            ds_list = getattr(paper, "datasets", []) or []
            for ds in ds_list:
                ds_name = ds if isinstance(ds, str) else ds.get("name")
                if not ds_name:
                    continue
                    
                if ds_name not in dataset_stats:
                    dataset_stats[ds_name] = {
                        "_id": ds_name.lower().replace(" ", "-"),
                        "name": ds_name,
                        "description": "Dataset extracted from papers",
                        "task": "various",
                        "papers": []
                    }
                dataset_stats[ds_name]["papers"].append(str(paper.id))
                
        result = list(dataset_stats.values())
        result.sort(key=lambda x: len(x["papers"]), reverse=True)
        return result

    async def get_dataset_details(self, dataset_id: str) -> dict:
        return {
            "id": dataset_id,
            "name": "Sample Dataset",
            "description": "A sample dataset",
        }

    async def search_datasets(self, query: str) -> list:
        try:
            import httpx

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    "https://paperswithcode.com/api/v1/datasets/",
                    params={"q": query},
                )
                resp.raise_for_status()
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    results.append(
                        {
                            "name": item.get("name"),
                            "description": item.get("description"),
                            "task": item.get("task"),
                            "homepage": item.get("url"),
                        }
                    )
                logger.info(f"Found {len(results)} datasets for '{query}'")
                return results
        except Exception as e:
            logger.error(f"Dataset search failed: {e}")
            return []

    async def get_dataset_leaderboard(self, dataset_id: str) -> list:
        try:
            import httpx

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"https://paperswithcode.com/api/v1/datasets/{dataset_id}/leaderboards/",
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("results", [])
        except Exception as e:
            logger.error(f"Leaderboard fetch failed for {dataset_id}: {e}")
            return []
