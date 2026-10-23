import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Search, Sparkles, Database, Network, BookOpen, Zap, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceProgress } from "@/hooks/useWorkspace";
import { toast } from "sonner";

const suggestedTopics = [
  "Vision Transformers for Medical Image Segmentation",
  "Large Language Models for Code Generation",
  "Graph Neural Networks for Drug Discovery",
  "Diffusion Models for Image Generation",
  "Reinforcement Learning in Robotics",
  "Multimodal Learning for Healthcare",
];

const stageLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  query_expansion: { label: "Expanding query", icon: <Search className="h-4 w-4" /> },
  search: { label: "Searching papers", icon: <Database className="h-4 w-4" /> },
  dedup: { label: "Deduplicating results", icon: <Sparkles className="h-4 w-4" /> },
  ranking: { label: "Ranking papers", icon: <Zap className="h-4 w-4" /> },
  embedding: { label: "Generating embeddings", icon: <Network className="h-4 w-4" /> },
  graph: { label: "Building knowledge graphs", icon: <BookOpen className="h-4 w-4" /> },
  complete: { label: "Finalizing workspace", icon: <CheckCircle className="h-4 w-4" /> },
  ready: { label: "Ready", icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
};

function LoadingScreen({ workspaceId, onComplete }: { workspaceId: string; onComplete: () => void }) {
  const { data, isLoading, isError } = useWorkspaceProgress(workspaceId, true);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const progress = data?.data?.progress ?? 0;
  const stage = data?.data?.stage ?? "query_expansion";
  const stageInfo = stageLabels[stage] ?? { label: "Processing…", icon: <Loader2 className="h-4 w-4 animate-spin" /> };

  const isReady = stage === "ready" || (stage === "complete" && progress >= 100);

  useEffect(() => {
    if (isReady) {
      onComplete();
    }
  }, [isReady, onComplete]);

  if (isReady) {
    return null;
  }

  const stages = Object.keys(stageLabels);
  const currentIndex = stages.indexOf(stage);
  const overallProgress = currentIndex >= 0 
    ? Math.min((currentIndex / (stages.length - 1)) * 100 + (progress / (stages.length - 1)), 100)
    : progress;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
      role="alert"
      aria-live="polite"
    >
      <Card className="glass-card w-full max-w-md overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold">Building your workspace</h2>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              Discovery is searching across Semantic Scholar, OpenAlex, arXiv, CrossRef, and Papers With Code,
              then deduplicating, ranking, and building graphs.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stageInfo.label}</span>
              <span className="font-mono font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            {stages.map((s, i) => {
              const info = stageLabels[s];
              const isCurrent = s === stage;
              const isCompleted = i < currentIndex || (isCurrent && progress >= 100);
              return (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    isCurrent ? "text-foreground" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      info.icon
                    )}
                  </span>
                  <span className="font-mono text-xs opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  <span>{info.label}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-4 border-t flex flex-col items-center justify-center gap-2">
            {showSkip || isError ? (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer"
              >
                <span>Enter Workspace Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Building research graphs...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NewWorkspacePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);
  const createWorkspace = useCreateWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      const result = await createWorkspace.mutateAsync({
        user_id: "guest",
        topic: topic.trim(),
        title: title.trim() || topic.trim(),
      });
      const wsId = result.data?._id || (result.data as any)?.id;
      if (wsId) {
        setCreatedWorkspaceId(wsId);
      } else {
        throw new Error("Invalid workspace response");
      }
    } catch (err: any) {
      console.error("Workspace creation failed:", err);
      toast.error(err?.message || "Could not create the workspace. Try again.");
    }
  };

  const handleLoadingComplete = () => {
    if (createdWorkspaceId) {
      toast.success("Workspace ready");
      navigate(`/app/workspace/${createdWorkspaceId}`);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-10">
      <AnimatePresence mode="wait">
        {createdWorkspaceId ? (
          <LoadingScreen key={createdWorkspaceId} workspaceId={createdWorkspaceId} onComplete={handleLoadingComplete} />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="eyebrow mb-2">New workspace</p>
              <h1 className="text-3xl">Start a workspace.</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                One question is enough — discovery handles the rest.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              onSubmit={handleSubmit}
              className="mt-10 space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="topic" className="text-[13px] font-medium">
                  Research topic
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="topic"
                    placeholder="e.g. Vision Transformers for Fine-Grained Pest Classification"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    autoFocus
                    className="h-11 rounded-md pl-9 text-[15px]"
                    disabled={createWorkspace.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="text-[13px] font-medium">
                  Workspace title <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="title"
                  placeholder="Defaults to the topic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10"
                  disabled={createWorkspace.isPending}
                />
              </div>

              <button
                type="submit"
                disabled={!topic.trim() || createWorkspace.isPending}
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
              >
                {createWorkspace.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating workspace…
                  </>
                ) : (
                  <>
                    Create workspace <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-10"
            >
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Or start from one of these
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setTopic(suggestion);
                      if (!title) setTitle(suggestion);
                    }}
                    className="rounded-[4px] border bg-card px-3 py-1.5 font-mono text-[11px] leading-snug text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
              className="mt-12 rounded-md border bg-card p-6"
            >
              <h2 className="text-lg">What discovery does</h2>
              <ol className="mt-4 space-y-3">
                {[
                  "Searches Semantic Scholar, OpenAlex, arXiv, CrossRef and Papers With Code",
                  "Deduplicates, ranks, and generates embeddings for every paper found",
                  "Builds the citation graph, knowledge graph and concept graph",
                  "Generates a timeline, literature review, roadmap and research gaps",
                  "Hands you a permanent workspace to keep working in",
                ].map((line, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="shrink-0 font-mono text-xs text-stamp">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}