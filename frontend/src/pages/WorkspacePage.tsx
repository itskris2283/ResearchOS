import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Users,
  Database,
  GitBranch,
  Network,
  BookOpen,
  Lightbulb,
  Map,
  BarChart3,
  Clock,
  RefreshCw,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceDetail } from "@/hooks/useWorkspace";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEffect } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentWorkspace } = useWorkspace();
  const { data, isLoading, refetch } = useWorkspaceDetail(id!);
  const [isSyncing, setIsSyncing] = useState(false);

  const workspace = data?.data;

  useEffect(() => {
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  }, [workspace, setCurrentWorkspace]);

  const handleSync = async () => {
    if (!id) return;
    setIsSyncing(true);
    try {
      await apiPost(`/workspaces/${id}/sync`);
      toast.success("Sync started");
      refetch();
    } catch (error) {
      toast.error("Failed to start sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = workspace?.statistics ?? { papers: 0, authors: 0, datasets: 0, methods: 0, citations: 0 };

  const quickLinks = [
    { icon: Network, label: "Knowledge Graph", path: "/app/knowledge-graph", color: "text-emerald-500" },
    { icon: BookOpen, label: "Literature Review", path: "/app/literature-review", color: "text-blue-500" },
    { icon: Lightbulb, label: "Research Gaps", path: "/app/research-gaps", color: "text-purple-500" },
    { icon: Map, label: "Roadmap", path: "/app/roadmap", color: "text-amber-500" },
    { icon: BarChart3, label: "Analytics", path: "/app/analytics", color: "text-rose-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{workspace?.title ?? "Workspace"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {workspace?.topic} {id ? `• ${id.slice(0, 8)}...` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={workspace?.status === "ready" ? "default" : "secondary"}>
            {workspace?.status ?? "unknown"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: FileText, label: "Papers", value: stats.papers.toString(), path: "/app/papers" },
          { icon: Users, label: "Authors", value: stats.authors.toString(), path: "/app/authors" },
          { icon: Database, label: "Datasets", value: stats.datasets.toString(), path: "/app/datasets" },
          { icon: GitBranch, label: "Methods", value: stats.methods.toString(), path: "/app/knowledge-graph" },
          { icon: BarChart3, label: "Citations", value: stats.citations.toString(), path: "/app/analytics" },
        ].map((stat) => (
          <Card 
            key={stat.label} 
            className="glass-card cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value || "0"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Research Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { label: "Field Maturity", value: Math.min(stats.papers * 5, 95) },
              { label: "Dataset Diversity", value: Math.min(stats.datasets * 10, 90) },
              { label: "Method Coverage", value: Math.min(stats.methods * 8, 85) },
              { label: "Citation Impact", value: Math.min(stats.citations / 10, 100) },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-5">
            {quickLinks.map((link) => (
              <Button
                key={link.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-6"
                onClick={() => navigate(link.path)}
              >
                <link.icon className={`h-6 w-6 ${link.color}`} />
                <span className="text-xs">{link.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
