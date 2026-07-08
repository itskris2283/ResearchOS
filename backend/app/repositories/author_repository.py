from typing import Optional
from bson import ObjectId
from loguru import logger
from app.models.author import Author


class AuthorRepository:
    async def create_author(self, data: dict) -> Author:
        author = Author(**data)
        await author.insert()
        logger.info(f"Created author {author.id}")
        return author

    async def get_author(self, author_id: str) -> Optional[Author]:
        author = await Author.get(ObjectId(author_id))
        if not author:
            logger.warning(f"Author {author_id} not found")
        return author

    async def find_authors(self, query: dict) -> list[Author]:
        authors = await Author.find(query).to_list()
        logger.debug(f"Found {len(authors)} authors matching query")
        return authors

    async def update_author(self, author_id: str, data: dict) -> Optional[Author]:
        author = await self.get_author(author_id)
        if not author:
            return None
        for key, value in data.items():
            setattr(author, key, value)
        await author.save()
        logger.info(f"Updated author {author_id}")
        return author
