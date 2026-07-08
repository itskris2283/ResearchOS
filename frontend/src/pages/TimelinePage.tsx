import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Clock,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTimeline } from "@/hooks/useTimeline";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function TimelinePage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useTimeline(workspaceId);
  const responseData = data?.data as any;
  const events: any[] = Array.isArray(responseData?.events) ? responseData.events : Array.isArray(responseData) ? responseData : [];

  const groupedByYear: Record<number, any[]> = {};
  events.forEach((e: any) => {
    const year = e.year;
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(e);
  });
  const years = Object.keys(groupedByYear).map(Number).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track the evolution of research over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
        </div>
      </div>

      {!workspaceId ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Select a workspace to view the timeline</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No timeline data yet</p>
          <p className="text-xs mt-1">Timeline will populate after discovery completes</p>
        </div>
      ) : (
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-4">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedYear === year ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                  }`}
                >{year}</button>
              ))}
            </div>
            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="space-y-4">
            {(selectedYear ? [[selectedYear, groupedByYear[selectedYear]] as const] : Object.entries(groupedByYear).map(([y, evts]) => [Number(y), evts] as const)).map(([year, yearEvents]) => (
              <div key={year}>
                {!selectedYear && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{year}</h3>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className="space-y-2 ml-11">
                  {yearEvents.map((event: any, i: number) => (
                    <motion.div
                      key={`${year}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative flex items-start gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-all cursor-pointer"
                    >
                      <Badge variant={event.type === "breakthrough" ? "default" : "secondary"} className="shrink-0 mt-0.5">
                        {event.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{event.title}</p>
                        {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
