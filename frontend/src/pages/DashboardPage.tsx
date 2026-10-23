import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

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

  const openWorkspace = (id: string) => {
    const ws = workspaces.find((w) => w._id === id);
    if (ws) setCurrentWorkspace(ws);
    navigate(`/app/workspace/${id}`);
  };

  const recent = [...workspaces]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Your library</p>
          <h1 className="text-3xl">Workspaces</h1>
        </div>
        <button
          onClick={() => navigate("/app/new-workspace")}
          className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New workspace
        </button>
      </div>

      {workspacesQuery.isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!workspacesQuery.isLoading && !currentWorkspace && workspaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md py-16 text-center"
        >
          <h2 className="text-2xl">Your desk is clear.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Start with a question — a topic, a method, a hunch. ResearchOS reads the field and
            builds the workspace around it.
          </p>
          <button
            onClick={() => navigate("/app/new-workspace")}
            className="mt-8 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Create your first workspace <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <p className="mt-8 font-mono text-[11px] leading-relaxed text-muted-foreground">
            e.g. “vision transformers for medical imaging”
            <br />
            or “microplastics in agricultural soil”
          </p>
        </motion.div>
      )}

      {!workspacesQuery.isLoading && workspaces.length > 0 && (
        <>
          {/* catalog cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws, i) => (
              <motion.div
                key={ws._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.2) }}
              >
                <article
                  role="link"
                  tabIndex={0}
                  onClick={() => openWorkspace(ws._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openWorkspace(ws._id);
                  }}
                  className="group relative flex h-full cursor-pointer flex-col rounded-md border bg-card p-5 transition-all duration-150 hover:-translate-y-px hover:border-foreground/25 hover:shadow-[0_2px_8px_rgba(28,36,51,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Nº {String(i + 1).padStart(2, "0")} · Workspace
                    </span>
                    <button
                      aria-label={`Delete ${ws.title}`}
                      onClick={(e) => handleDelete(e, ws._id)}
                      className="-mr-1 -mt-1 rounded-[4px] p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="mt-3 truncate font-serif text-[17px] leading-snug">{ws.title}</h3>
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{ws.topic}</p>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
                    <span className={cn("flex items-center gap-1.5", ws.status !== "ready" && "text-stamp")}>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          ws.status === "ready" ? "bg-foreground" : "bg-stamp"
                        )}
                      />
                      {ws.status}
                    </span>
                    <span>{ws.statistics?.papers ?? 0} papers</span>
                    <span>{formatDate(ws.created_at)}</span>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>

          {/* totals strip */}
          {(() => {
            const totalPapers = workspaces.reduce((acc, ws) => acc + (ws.statistics?.papers ?? 0), 0);
            const totalAuthors = workspaces.reduce((acc, ws) => acc + (ws.statistics?.authors ?? 0), 0);
            const totalDatasets = workspaces.reduce((acc, ws) => acc + (ws.statistics?.datasets ?? 0), 0);
            const totals = [
              { label: "Workspaces", value: workspaces.length },
              { label: "Papers", value: totalPapers },
              { label: "Authors", value: totalAuthors },
              { label: "Datasets", value: totalDatasets },
            ];
            return (
              <section>
                <h2 className="eyebrow !text-muted-foreground mb-4">Across all workspaces</h2>
                <dl className="grid grid-cols-4 overflow-hidden rounded-md border border-border bg-card">
                  {totals.map((t) => (
                    <div key={t.label} className="border-l border-border px-4 py-5 first:border-l-0 sm:px-6">
                      <dd className="font-serif text-3xl tabular-nums">{t.value}</dd>
                      <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {t.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })()}

          {/* recent */}
          {recent.length > 0 && (
            <section>
              <h2 className="eyebrow !text-muted-foreground mb-2">Recently opened</h2>
              <ul>
                {recent.map((ws, i) => (
                  <li key={ws._id}>
                    <button
                      onClick={() => openWorkspace(ws._id)}
                      className="group flex w-full items-baseline gap-4 border-b border-border py-3.5 text-left transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:gap-6"
                    >
                      <span className="w-7 shrink-0 font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-serif text-[15px] group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
                        {ws.title}
                      </span>
                      <span className="hidden shrink-0 truncate text-[13px] text-muted-foreground md:block md:max-w-[220px]">
                        {ws.topic}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {ws.statistics?.papers ?? 0} papers · {formatDate(ws.created_at)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-stamp opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
