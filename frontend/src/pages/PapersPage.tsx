import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bookmark,
  ExternalLink,
  FileText,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaperSearch } from "@/hooks/usePaperSearch";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Paper } from "@/types";

export default function PapersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  
  const { data, isLoading } = usePaperSearch({
    workspace_id: workspaceId,
    q: submittedQuery || undefined,
  });
  const papers = data?.data ?? [];

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`bookmarks_${workspaceId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (workspaceId) {
      localStorage.setItem(`bookmarks_${workspaceId}`, JSON.stringify(bookmarkedIds));
    }
  }, [bookmarkedIds, workspaceId]);

  const toggleBookmark = (paperId: string) => {
    setBookmarkedIds(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  const handleSearch = () => {
    setSubmittedQuery(searchQuery.trim());
  };

  const bookmarkedPapers = papers.filter(p => p._id && bookmarkedIds.includes(p._id));

  const renderPaperList = (paperList: Paper[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (paperList.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {paperList.map((paper, i) => {
          const paperId = paper._id;
          const isBookmarked = paperId ? bookmarkedIds.includes(paperId) : false;
          return (
            <motion.div key={paperId ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium leading-snug hover:text-primary transition-colors">{paper.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {paper.authors?.map((a: any) => a.name || a).join(", ") ?? "Unknown"}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        {paper.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {paper.year}</span>}
                        {paper.venue && <span>{paper.venue}</span>}
                        <span>{paper.citation_count ?? 0} citations</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {paper.keywords?.slice(0, 3).map((kw: string) => <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${isBookmarked ? 'text-primary' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (paperId) toggleBookmark(paperId);
                        }}
                      >
                        <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Papers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and manage papers in your workspace
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Papers ({papers.length})</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked ({bookmarkedPapers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderPaperList(papers, "No papers yet")}
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-4">
          {renderPaperList(bookmarkedPapers, "No bookmarked papers yet")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
