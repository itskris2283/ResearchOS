import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Search,
  FileText,
  Users,
  Database,
  GitBranch,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePaperSearch } from "@/hooks/usePaperSearch";
import { useAuthors } from "@/hooks/useAuthors";

export default function BookmarksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  
  const { data: papersData, isLoading: isLoadingPapers } = usePaperSearch({ workspace_id: workspaceId });
  const papers = papersData?.data ?? [];
  
  const { data: authorsData, isLoading: isLoadingAuthors } = useAuthors(workspaceId);
  const authors = authorsData?.data ?? [];

  const [paperIds, setPaperIds] = useState<string[]>([]);
  const [authorIds, setAuthorIds] = useState<string[]>([]);

  useEffect(() => {
    if (workspaceId) {
      try {
        setPaperIds(JSON.parse(localStorage.getItem(`bookmarks_${workspaceId}`) || "[]"));
      } catch { setPaperIds([]); }
      try {
        setAuthorIds(JSON.parse(localStorage.getItem(`bookmarks_authors_${workspaceId}`) || "[]"));
      } catch { setAuthorIds([]); }
    }
  }, [workspaceId]);

  const removeBookmark = (type: string, id: string) => {
    if (type === "paper") {
      const newIds = paperIds.filter(pid => pid !== id);
      setPaperIds(newIds);
      localStorage.setItem(`bookmarks_${workspaceId}`, JSON.stringify(newIds));
    } else if (type === "author") {
      const newIds = authorIds.filter(aid => aid !== id);
      setAuthorIds(newIds);
      localStorage.setItem(`bookmarks_authors_${workspaceId}`, JSON.stringify(newIds));
    }
  };

  const bookmarks = [
    ...paperIds.map(id => {
      const paper = papers.find((p: any) => p._id === id || p.id === id);
      return { _id: id, entity_type: "paper", entity_id: paper ? paper.title : id };
    }),
    ...authorIds.map(id => {
      const author = authors.find((a: any) => a._id === id || a.id === id);
      return { _id: id, entity_type: "author", entity_id: author ? author.name : id };
    })
  ].filter(b => !searchQuery || b.entity_id.toLowerCase().includes(searchQuery.toLowerCase()));

  const isLoading = isLoadingPapers || isLoadingAuthors;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your saved papers, authors, datasets, and methods
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search bookmarks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({bookmarks.length})</TabsTrigger>
          <TabsTrigger value="paper">Papers ({bookmarks.filter((b) => b.entity_type === "paper").length})</TabsTrigger>
          <TabsTrigger value="dataset">Datasets ({bookmarks.filter((b) => b.entity_type === "dataset").length})</TabsTrigger>
          <TabsTrigger value="author">Authors ({bookmarks.filter((b) => b.entity_type === "author").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {!workspaceId ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bookmark className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Select a workspace to view bookmarks</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bookmark className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No bookmarks yet</p>
              <p className="text-xs mt-1">Bookmark papers, authors, and datasets to find them quickly</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bm, i) => (
                <motion.div key={bm._id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card group hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            {bm.entity_type === "paper" ? <FileText className="h-4 w-4 text-primary" /> :
                             bm.entity_type === "dataset" ? <Database className="h-4 w-4 text-primary" /> :
                             bm.entity_type === "author" ? <Users className="h-4 w-4 text-primary" /> :
                             <GitBranch className="h-4 w-4 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">{bm.entity_id}</h3>
                            <Badge variant="secondary" className="text-xs mt-1 capitalize">{bm.entity_type}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); removeBookmark(bm.entity_type, bm._id); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
