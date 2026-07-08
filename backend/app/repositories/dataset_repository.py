from typing import Optional
from bson import ObjectId
from loguru import logger
from app.models.dataset import Dataset


class DatasetRepository:
    async def create_dataset(self, data: dict) -> Dataset:
        dataset = Dataset(**data)
        await dataset.insert()
        logger.info(f"Created dataset {dataset.id}")
        return dataset

    async def get_dataset(self, dataset_id: str) -> Optional[Dataset]:
        dataset = await Dataset.get(ObjectId(dataset_id))
        if not dataset:
            logger.warning(f"Dataset {dataset_id} not found")
        return dataset

    async def find_datasets(self, query: dict) -> list[Dataset]:
        datasets = await Dataset.find(query).to_list()
        logger.debug(f"Found {len(datasets)} datasets matching query")
        return datasets
