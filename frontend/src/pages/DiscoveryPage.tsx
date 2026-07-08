import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bookmark,
  ExternalLink,
  Github,
  FileText,
  Calendar,
  ArrowUpDown,
  Grid3X3,
  List,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useDiscoverySearch } from "@/hooks/useDiscovery";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function DiscoveryPage() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { currentWorkspace } = useWorkspace();
  const discoveryMutation = useDiscoverySearch();

  const papers = discoveryMutation.data?.data ?? [];

  const handleSearch = () => {
    if (!query.trim()) return;
    discoveryMutation.mutate({ topic: query.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Research Discovery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover papers across multiple scientific sources
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search natural language queries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-11 text-base"
          />
        </div>
        <Button className="h-11 px-6" onClick={handleSearch} disabled={discoveryMutation.isPending}>
          {discoveryMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {!currentWorkspace && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Select a workspace first</p>
          <p className="text-xs mt-1">Workspace context is needed for discovery</p>
        </div>
      )}

      {discoveryMutation.isPending && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!discoveryMutation.isPending && papers.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{papers.length} results</p>
            <div className="flex items-center gap-1">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2" : "space-y-3"}>
            {papers.map((paper, i) => (
              <motion.div key={paper._id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">{paper.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {paper.authors?.map((a) => a.name).join(", ") ?? "Unknown authors"}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          {paper.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {paper.year}</span>}
                          {paper.venue && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {paper.venue}</span>}
                          <span>{paper.citation_count ?? 0} citations</span>
                        </div>
                        {paper.abstract && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{paper.abstract}</p>}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {paper.methods?.slice(0, 3).map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                          {paper.datasets?.slice(0, 2).map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Bookmark className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!discoveryMutation.isPending && discoveryMutation.isIdle && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Search for papers to discover</p>
          <p className="text-xs mt-1">Sources: Semantic Scholar, CrossRef, arXiv, DBLP</p>
        </div>
      )}

      {discoveryMutation.isError && (
        <div className="text-center py-12 text-destructive">
          <p className="text-sm">Search failed. Please try again.</p>
        </div>
      )}
    </div>
  );
}
