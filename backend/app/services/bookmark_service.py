class BookmarkService:
    async def list_bookmarks(self, user_id: str):
        return [
            {
                "_id": "bm-1",
                "entity_type": "paper",
                "entity_id": "paper-1",
                "created_at": "2024-01-01T00:00:00Z",
            },
            {
                "_id": "bm-2",
                "entity_type": "dataset",
                "entity_id": "ds-1",
                "created_at": "2024-01-02T00:00:00Z",
            },
        ]

    async def add_bookmark(self, user_id: str, entity_type: str, entity_id: str):
        return {
            "_id": "bm-new",
            "user_id": user_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
        }

    async def remove_bookmark(self, bookmark_id: str):
        return {"message": "Bookmark removed successfully"}
