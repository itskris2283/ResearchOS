import { motion } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function ResearchGapsPage() {
  const { currentWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Research Gaps</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-identified opportunities for future research
        </p>
      </div>

      {!currentWorkspace ? (
        <div className="text-center py-16 text-muted-foreground">
          <Lightbulb className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Select a workspace to identify research gaps</p>
        </div>
      ) : (
        <>
          <Card className="glass-card bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Research Opportunity Score</h2>
                  <p className="text-sm text-muted-foreground">
                    Based on analysis of papers, datasets, and citation trends. Gaps are identified by sparse publication coverage combined with high potential impact.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center py-12 text-muted-foreground">
            <Target className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm">Research gap analysis will appear here</p>
            <p className="text-xs mt-1">Available after discovery pipeline completes</p>
          </div>
        </>
      )}
    </div>
  );
}
