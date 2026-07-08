import { motion } from "framer-motion";
import {
  Map,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Code,
  Target,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRoadmap, useGenerateRoadmap } from "@/hooks/useRoadmap";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

export default function RoadmapPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useRoadmap(workspaceId);
  const generateRoadmap = useGenerateRoadmap();
  const roadmap = data?.data;
  const steps = roadmap?.steps ?? [];

  const handleGenerate = async () => {
    if (!workspaceId) return;
    try {
      await generateRoadmap.mutateAsync(workspaceId);
      toast.success("Roadmap generated!");
    } catch {
      toast.error("Failed to generate roadmap");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized learning path for your research topic
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generateRoadmap.isPending || !workspaceId}>
          {generateRoadmap.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate
        </Button>
      </div>

      {!workspaceId ? (
        <div className="text-center py-16 text-muted-foreground">
          <Map className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Select a workspace to view the roadmap</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : steps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Map className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No roadmap yet</p>
          <p className="text-xs mt-1">Click "Generate" to create a personalized research roadmap</p>
        </div>
      ) : (
        <>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Map className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{steps.length}-Step Research Journey</h2>
                  <p className="text-sm text-muted-foreground">{currentWorkspace?.title}</p>
                </div>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {steps.map((step, i) => (
              <motion.div key={step.day ?? i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card group hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-muted-foreground">
                          <span className="text-xs font-medium">{step.day}</span>
                        </div>
                        {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {step.type === "survey" ? <BookOpen className="h-3 w-3 mr-1" /> :
                             step.type === "foundational" ? <GraduationCap className="h-3 w-3 mr-1" /> :
                             step.type === "implementation" ? <Code className="h-3 w-3 mr-1" /> :
                             step.type === "sota" ? <Target className="h-3 w-3 mr-1" /> :
                             <FileText className="h-3 w-3 mr-1" />}
                            Day {step.day}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {step.papers?.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1.5">
                            {step.papers.map((paper: string) => (
                              <div key={paper} className="flex items-start gap-2">
                                <BookOpen className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                <span className="text-xs text-muted-foreground">{paper}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
