from app.models.bookmark import Bookmark
from typing import List, Optional
from datetime import datetime


class BookmarkService:
    async def get_user_bookmarks(self, user_id: str):
        try:
            bookmarks = await Bookmark.find(Bookmark.user_id == user_id).to_list()
            return [
                {
                    "_id": str(b.id),
                    "id": str(b.id),
                    "user_id": b.user_id,
                    "entity_type": b.entity_type,
                    "entity_id": b.entity_id,
                    "created_at": b.created_at.isoformat() if b.created_at else None,
                }
                for b in bookmarks
            ]
        except Exception:
            return []

    async def list_bookmarks(self, user_id: str):
        return await self.get_user_bookmarks(user_id)

    async def add_bookmark(self, user_id: str, entity_type: str, entity_id: str):
        existing = await Bookmark.find_one(
            Bookmark.user_id == user_id,
            Bookmark.entity_type == entity_type,
            Bookmark.entity_id == entity_id,
        )
        if existing:
            return {
                "_id": str(existing.id),
                "id": str(existing.id),
                "user_id": existing.user_id,
                "entity_type": existing.entity_type,
                "entity_id": existing.entity_id,
            }

        bookmark = Bookmark(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            created_at=datetime.utcnow(),
        )
        await bookmark.insert()
        return {
            "_id": str(bookmark.id),
            "id": str(bookmark.id),
            "user_id": bookmark.user_id,
            "entity_type": bookmark.entity_type,
            "entity_id": bookmark.entity_id,
        }

    async def remove_bookmark(self, bookmark_id: str):
        bookmark = await Bookmark.get(bookmark_id)
        if bookmark:
            await bookmark.delete()
        return {"message": "Bookmark removed successfully"}
