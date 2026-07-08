import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";

const suggestedTopics = [
  "Vision Transformers for Medical Image Segmentation",
  "Large Language Models for Code Generation",
  "Graph Neural Networks for Drug Discovery",
  "Diffusion Models for Image Generation",
  "Reinforcement Learning in Robotics",
  "Multimodal Learning for Healthcare",
];

export default function NewWorkspacePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
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
      toast.success("Workspace created successfully!");
      navigate(`/app/workspace/${result.data._id}`);
    } catch (error) {
      toast.error("Failed to create workspace");
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">New Research Workspace</h1>
        <p className="mt-2 text-muted-foreground">
          Enter a research topic to begin automatic discovery
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Research Topic</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="e.g., Vision Transformers for Fine-Grained Pest Classification"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Workspace Title (optional)</label>
          <Input
            placeholder="My Research Workspace"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base"
          disabled={!topic.trim() || createWorkspace.isPending}
        >
          {createWorkspace.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating workspace...
            </>
          ) : (
            <>
              Create Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <p className="text-sm text-muted-foreground mb-3 text-center">Try a suggested topic</p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestedTopics.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setTopic(suggestion);
                if (!title) setTitle(suggestion);
              }}
              className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 rounded-xl border p-6"
      >
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
            ResearchOS searches Semantic Scholar, OpenAlex, arXiv, CrossRef, and Papers With Code
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
            Papers are deduplicated, ranked, and embeddings are generated
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
            Citation graph, knowledge graph, and concept graph are built
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">4</span>
            Timeline, literature review, roadmap, and research gaps are generated
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">5</span>
            Your permanent research workspace is ready
          </li>
        </ol>
      </motion.div>
    </div>
  );
}
