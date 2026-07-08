import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  GraduationCap,
  MapPin,
  Bookmark,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthors } from "@/hooks/useAuthors";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function AuthorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useAuthors(workspaceId);
  const authors = data?.data ?? [];

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`bookmarks_authors_${workspaceId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (workspaceId) {
      localStorage.setItem(`bookmarks_authors_${workspaceId}`, JSON.stringify(bookmarkedIds));
    }
  }, [bookmarkedIds, workspaceId]);

  const toggleBookmark = (authorId: string) => {
    setBookmarkedIds(prev => 
      prev.includes(authorId) 
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId]
    );
  };

  const filteredAuthors = authors.filter(a => 
    !searchQuery || a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const bookmarkedAuthors = filteredAuthors.filter(a => (a._id || a.id) && bookmarkedIds.includes((a._id || a.id)!));

  const renderAuthorList = (authorList: any[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (authorList.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {authorList.map((author, i) => {
          const authorId = author._id || author.id;
          const isBookmarked = authorId ? bookmarkedIds.includes(authorId) : false;
          return (
            <motion.div key={authorId ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card group hover:shadow-md transition-all cursor-pointer relative">
                <CardContent className="p-5">
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 ${isBookmarked ? 'text-primary' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (authorId) toggleBookmark(authorId);
                      }}
                    >
                      <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <div className="flex items-start gap-4 pr-8">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {author.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "AU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{author.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {author.institution && <><GraduationCap className="h-3 w-3" /><span>{author.institution}</span></>}
                        {author.country && <><MapPin className="h-3 w-3 ml-1" /><span>{author.country}</span></>}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="text-center"><p className="font-semibold">{author.h_index ?? "-"}</p><p className="text-xs text-muted-foreground">Workspace h-index</p></div>
                        <div className="text-center"><p className="font-semibold">{((author.citation_count ?? 0) / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Workspace Citations</p></div>
                        <div className="text-center"><p className="font-semibold">{author.paper_count ?? 0}</p><p className="text-xs text-muted-foreground">Workspace Papers</p></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {author.topics?.slice(0, 3).map((topic: string) => <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>)}
                      </div>
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
        <h1 className="text-2xl font-bold">Authors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover influential researchers in your field
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Authors ({filteredAuthors.length})</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked ({bookmarkedAuthors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderAuthorList(filteredAuthors, "No authors found")}
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-4">
          {renderAuthorList(bookmarkedAuthors, "No bookmarked authors yet")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
