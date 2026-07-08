import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Users,
  Database,
  GitBranch,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Network,
  Clock,
  Bookmark,
  Compass,
  Lightbulb,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentWorkspace, workspaces, setCurrentWorkspace, setWorkspaces } = useWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const workspacesQuery = useWorkspaces("guest");

  useEffect(() => {
    if (workspacesQuery.data?.data) {
      setWorkspaces(workspacesQuery.data.data);
    }
  }, [workspacesQuery.data, setWorkspaces]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteWorkspace.mutateAsync(id);
      toast.success("Workspace deleted");
    } catch {
      toast.error("Failed to delete workspace");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back to ResearchOS
          </p>
        </div>
        <Button onClick={() => navigate("/app/new-workspace")}>
          <Plus className="mr-2 h-4 w-4" /> New Workspace
        </Button>
      </div>

      {workspacesQuery.isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!workspacesQuery.isLoading && workspaces.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <motion.div
              key={ws._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="glass-card cursor-pointer hover:shadow-md transition-all group relative"
                onClick={() => {
                  setCurrentWorkspace(ws);
                  navigate(`/app/workspace/${ws._id}`);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{ws.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{ws.topic}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant={ws.status === "ready" ? "default" : "secondary"} className="text-xs">
                          {ws.status}
                        </Badge>
                        <span>{ws.statistics?.papers ?? 0} papers</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(e, ws._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!workspacesQuery.isLoading && !currentWorkspace && workspaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Start your first research workspace</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Enter any research topic and ResearchOS will automatically discover papers,
            build knowledge graphs, and generate literature reviews.
          </p>
          <Button size="lg" onClick={() => navigate("/app/new-workspace")}>
            Create Workspace <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
            <div>
              <p className="text-lg font-semibold text-foreground">5+</p>
              <p>Paper Sources</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Auto</p>
              <p>Graph Generation</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">AI</p>
              <p>Literature Review</p>
            </div>
          </div>
        </motion.div>
      )}

      {workspaces.length > 0 && (() => {
        const totalWorkspaces = workspaces.length;
        const totalPapers = workspaces.reduce((acc, ws) => acc + (ws.statistics?.papers ?? 0), 0);
        const totalAuthors = workspaces.reduce((acc, ws) => acc + (ws.statistics?.authors ?? 0), 0);
        const totalDatasets = workspaces.reduce((acc, ws) => acc + (ws.statistics?.datasets ?? 0), 0);

        const globalStats = [
          { icon: BookOpen, label: "Total Workspaces", value: totalWorkspaces.toString() },
          { icon: FileText, label: "Total Papers", value: totalPapers.toString() },
          { icon: Users, label: "Total Authors", value: totalAuthors.toString() },
          { icon: Database, label: "Total Datasets", value: totalDatasets.toString() },
        ];

        return (
          <div className="mt-8">
            <Separator className="mb-8" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Global Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {globalStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Recent Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...workspaces].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((ws) => (
                    <div 
                      key={ws._id} 
                      className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        navigate(`/app/workspace/${ws._id}`);
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{ws.title}</p>
                        <p className="text-xs text-muted-foreground">{ws.topic}</p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <span>{ws.statistics?.papers ?? 0} papers</span>
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
