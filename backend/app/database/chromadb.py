import chromadb
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger()
chroma_client = None

COLLECTIONS = {
    "paper_embeddings": "Paper embedding vectors for semantic search",
    "abstract_embeddings": "Abstract embedding vectors",
    "summary_embeddings": "Summary embedding vectors",
    "author_embeddings": "Author embedding vectors",
    "topic_embeddings": "Topic embedding vectors",
    "dataset_embeddings": "Dataset embedding vectors",
    "concept_embeddings": "Concept embedding vectors",
}


async def init_chromadb():
    global chroma_client
    try:
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        for name, description in COLLECTIONS.items():
            try:
                chroma_client.get_or_create_collection(
                    name=name,
                    metadata={"description": description, "hnsw:space": "cosine"},
                )
                logger.debug(f"ChromaDB collection ready: {name}")
            except Exception as e:
                logger.warning(f"Failed to create collection {name}: {e}")
        logger.info("ChromaDB initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize ChromaDB: {e}")
        raise


async def close_chromadb():
    global chroma_client
    if chroma_client:
        chroma_client = None
        logger.info("ChromaDB connection closed")


def get_chroma_client():
    return chroma_client


def get_collection(name: str):
    if chroma_client is None:
        raise RuntimeError("ChromaDB not initialized")
    return chroma_client.get_collection(name)
