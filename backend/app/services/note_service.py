from bson import ObjectId
from datetime import datetime
from app.models.note import Note

class NoteService:
    async def get_workspace_notes(self, workspace_id: str):
        notes = await Note.find(Note.workspace_id == workspace_id).sort("-updated_at").to_list()
        return [self._format_note(n) for n in notes]

    async def create_note(
        self,
        workspace_id: str,
        title: str,
        content: str = "",
        tags: list = None,
        paper_id: str = None,
    ):
        note = Note(
            workspace_id=workspace_id,
            title=title,
            markdown=content,
            tags=tags or [],
            paper_id=paper_id,
        )
        await note.insert()
        return self._format_note(note)

    async def get_note(self, note_id: str, workspace_id: str = None):
        note = await Note.get(ObjectId(note_id))
        if not note:
            return None
        if workspace_id and note.workspace_id != workspace_id:
            return None
        return self._format_note(note)

    async def update_note(self, note_id: str, data: dict, workspace_id: str = None):
        note = await Note.get(ObjectId(note_id))
        if not note:
            return None
        if workspace_id and note.workspace_id != workspace_id:
            return None
            
        # If frontend sends "content", map it to "markdown"
        if "content" in data:
            data["markdown"] = data.pop("content")
            
        for key, value in data.items():
            if hasattr(note, key) and key not in ("_id", "id", "workspace_id", "created_at"):
                setattr(note, key, value)
        
        note.updated_at = datetime.utcnow()
        await note.save()
        return self._format_note(note)

    async def delete_note(self, note_id: str, workspace_id: str = None):
        note = await Note.get(ObjectId(note_id))
        if not note:
            return None
        if workspace_id and note.workspace_id != workspace_id:
            return None
            
        await note.delete()
        return {"message": "Note deleted successfully"}

    def _format_note(self, note: Note):
        data = note.model_dump(by_alias=True)
        if "_id" in data and not isinstance(data["_id"], str):
            data["_id"] = str(data["_id"])
        # ensure frontend gets string dates
        if isinstance(data.get("created_at"), datetime):
            data["created_at"] = data["created_at"].isoformat()
        if isinstance(data.get("updated_at"), datetime):
            data["updated_at"] = data["updated_at"].isoformat()
        return data
