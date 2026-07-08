import { useState } from "react";
import { motion } from "framer-motion";
import {
  StickyNote,
  Plus,
  Search,
  Edit3,
  Trash2,
  Clock,
  Tag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWorkspaceNotes, useCreateNote, useDeleteNote, useUpdateNote } from "@/hooks/useNotes";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "@/types";

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useWorkspaceNotes(workspaceId);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const updateNote = useUpdateNote();
  const notes = data?.data ?? [];

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!workspaceId) return;
    try {
      const result = await createNote.mutateAsync({
        workspace_id: workspaceId,
        title: "New Note",
        content: "",
      });
      openEdit(result.data as Note);
    } catch {
      toast.error("Failed to create note");
    }
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    try {
      await deleteNote.mutateAsync({ workspace_id: workspaceId, note_id: noteId });
      toast.success("Note deleted");
      if (activeNote?._id === noteId) {
        setActiveNote(null);
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const openView = (note: Note) => {
    setActiveNote(note);
    setIsEditingMode(false);
    setEditTitle(note.title || "");
    setEditContent(note.markdown || "");
  };

  const openEdit = (note: Note) => {
    setActiveNote(note);
    setIsEditingMode(true);
    setEditTitle(note.title || "");
    setEditContent(note.markdown || "");
  };

  const saveEdit = async () => {
    if (!activeNote || !workspaceId) return;
    setIsSaving(true);
    try {
      await updateNote.mutateAsync({
        workspace_id: workspaceId,
        note_id: activeNote._id!,
        title: editTitle,
        content: editContent,
      });
      toast.success("Note saved");
      setActiveNote({ ...activeNote, title: editTitle, markdown: editContent });
      setIsEditingMode(false);
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredNotes = notes.filter((n: Note) => 
    !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.markdown?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Research notes with markdown support
          </p>
        </div>
        <Button onClick={handleCreate} disabled={!workspaceId || createNote.isPending}>
          {createNote.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} 
          New Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !workspaceId ? (
        <div className="text-center py-16 text-muted-foreground">
          <StickyNote className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Select a workspace to view notes</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <StickyNote className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{searchQuery ? "No notes found matching your search" : "No notes yet"}</p>
          {!searchQuery && <p className="text-xs mt-1">Create your first note to get started</p>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredNotes.map((note: Note, i: number) => (
            <motion.div key={note._id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card group hover:shadow-md transition-all cursor-pointer" onClick={() => openView(note)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{note.title || "Untitled Note"}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(note); }}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleDelete(e, note._id!)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{note.markdown ? note.markdown : <span className="italic opacity-50">Empty note...</span>}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags?.map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs"><Tag className="h-3 w-3 mr-1" />{tag}</Badge>)}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(note.updated_at ?? note.created_at ?? new Date()).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!activeNote} onOpenChange={(open) => {
        if (!open) {
          setActiveNote(null);
          setIsEditingMode(false);
        }
      }}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-8">
              <span>{isEditingMode ? "Edit Note" : activeNote?.title || "Untitled Note"}</span>
              {!isEditingMode && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingMode(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 flex-1 py-4 overflow-hidden">
            {isEditingMode ? (
              <>
                <Input 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  placeholder="Note Title" 
                  className="font-semibold text-lg"
                />
                <Textarea 
                  value={editContent} 
                  onChange={(e) => setEditContent(e.target.value)} 
                  placeholder="Write your research notes here... (Markdown supported)" 
                  className="flex-1 resize-none p-4 font-mono text-sm"
                />
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-1 prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeNote?.markdown || "*Empty note...*"}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <DialogFooter>
            {isEditingMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditingMode(false)}>Cancel</Button>
                <Button onClick={saveEdit} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setActiveNote(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
