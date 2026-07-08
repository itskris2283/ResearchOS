from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.utils.logger import setup_logger

from app.models.user import User
from app.models.workspace import Workspace
from app.models.paper import Paper
from app.models.author import Author
from app.models.dataset import Dataset
from app.models.method import Method
from app.models.session import Session
from app.models.note import Note
from app.models.bookmark import Bookmark
from app.models.graph_cache import GraphCache
from app.models.timeline_cache import TimelineCache
from app.models.literature_review import LiteratureReview
from app.models.roadmap import Roadmap
from app.models.concept import Concept

logger = setup_logger()
client = None


async def init_mongodb():
    global client
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        await init_beanie(
            database=client[settings.MONGODB_DB_NAME],
            document_models=[
                User,
                Workspace,
                Paper,
                Author,
                Dataset,
                Method,
                Session,
                Note,
                Bookmark,
                GraphCache,
                TimelineCache,
                LiteratureReview,
                Roadmap,
                Concept,
            ],
        )
        logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongodb():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")
