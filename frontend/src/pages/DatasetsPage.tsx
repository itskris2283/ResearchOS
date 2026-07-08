import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Database,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDatasets } from "@/hooks/useDatasets";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useDatasets(workspaceId);
  const datasets = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Datasets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover and explore research datasets
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : datasets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Database className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No datasets found</p>
          <p className="text-xs mt-1">Datasets will appear as papers are discovered</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {datasets.map((ds, i) => (
            <motion.div key={ds._id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card group hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{ds.name}</h3>
                        <p className="text-xs text-muted-foreground">{ds.task ?? ds.description}</p>
                      </div>
                    </div>
                    {ds.license && <Badge variant="outline" className="text-xs">{ds.license}</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    {ds.classes && <div><p className="font-medium text-sm">{ds.classes}</p><p className="text-muted-foreground">Classes</p></div>}
                    {ds.size && <div><p className="font-medium text-sm">{ds.size}</p><p className="text-muted-foreground">Size</p></div>}
                    <div><p className="font-medium text-sm">{ds.papers?.length ?? 0}</p><p className="text-muted-foreground">Papers</p></div>
                  </div>
                  {ds.evaluation_metrics?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ds.evaluation_metrics.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
