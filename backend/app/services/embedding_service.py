from loguru import logger
from typing import Optional
from sentence_transformers import SentenceTransformer
import numpy as np
from app.config import settings
from app.database.chromadb import get_chroma_client, get_collection
from app.utils.logger import setup_logger

logger = setup_logger()

_model: Optional[SentenceTransformer] = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info(f"Loaded embedding model: {settings.EMBEDDING_MODEL}")
    return _model


class EmbeddingService:
    async def generate_embedding(self, text: str) -> list[float]:
        model = _get_model()
        embedding = model.encode(text, show_progress_bar=False)
        return embedding.tolist()

    async def batch_generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        model = _get_model()
        embeddings = model.encode(texts, show_progress_bar=False)
        return [emb.tolist() for emb in embeddings]

    async def generate_paper_embeddings(self, paper: dict) -> dict:
        embeddings = {}
        if paper.get("title"):
            embeddings["title"] = await self.generate_embedding(paper["title"])
        if paper.get("abstract"):
            embeddings["abstract"] = await self.generate_embedding(paper["abstract"])
        if paper.get("summary"):
            embeddings["summary"] = await self.generate_embedding(paper["summary"])
        return embeddings

    async def store_embedding(
        self,
        collection: str,
        embedding_id: str,
        embedding: list[float],
        metadata: dict,
    ):
        try:
            col = get_collection(collection)
            col.add(
                ids=[embedding_id],
                embeddings=[embedding],
                metadatas=[metadata],
            )
            logger.debug(f"Stored embedding {embedding_id} in {collection}")
        except Exception as e:
            logger.error(f"Failed to store embedding {embedding_id}: {e}")

    async def search_similar(
        self,
        collection: str,
        query_embedding: list[float],
        n_results: int = 10,
    ) -> list:
        try:
            col = get_collection(collection)
            results = col.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
            )
            return results
        except Exception as e:
            logger.error(f"Failed to search {collection}: {e}")
            return []
