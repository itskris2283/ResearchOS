import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  LayoutDashboard,
  Compass,
  Network,
  Brain,
  History,
  FileText,
  BookOpen,
  Lightbulb,
  Database,
  Users,
  Map,
  BarChart3,
  Bookmark,
  StickyNote,
  Settings,
} from "lucide-react";

const globalItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
];

const workspaceItems = [
  { icon: Compass, label: "Discovery", path: "/app/discovery" },
  { icon: Network, label: "Knowledge Graph", path: "/app/knowledge-graph" },
  { icon: Brain, label: "Mind Maps", path: "/app/mind-maps" },
  { icon: History, label: "Timeline", path: "/app/timeline" },
  { icon: FileText, label: "Papers", path: "/app/papers" },
  { icon: BookOpen, label: "Literature Review", path: "/app/literature-review" },
  { icon: Lightbulb, label: "Research Gaps", path: "/app/research-gaps" },
  { icon: Database, label: "Datasets", path: "/app/datasets" },
  { icon: Users, label: "Authors", path: "/app/authors" },
  { icon: Map, label: "Roadmap", path: "/app/roadmap" },
  { icon: BarChart3, label: "Analytics", path: "/app/analytics" },
  { icon: Bookmark, label: "Bookmarks", path: "/app/bookmarks" },
  { icon: StickyNote, label: "Notes", path: "/app/notes" },
];

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Compass;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-2.5 rounded-[4px] px-3 py-[7px] text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      {active && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-stamp" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-stamp" : "")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70 first:pt-3">
      {children}
    </p>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const { currentWorkspace } = useWorkspace();

  return (
    <AnimatePresence>
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 236 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex shrink-0 flex-col overflow-hidden border-r bg-card"
      >
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <nav>
            <GroupLabel>Library</GroupLabel>
            <div className="space-y-px">
              {globalItems.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>

            {currentWorkspace && (
              <>
                <GroupLabel>{currentWorkspace.title}</GroupLabel>
                <div className="space-y-px">
                  {workspaceItems.map((item) => (
                    <NavItem
                      key={item.path}
                      {...item}
                      active={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                    />
                  ))}
                </div>
              </>
            )}
          </nav>
        </div>

        <div className="border-t p-2">
          <NavItem
            icon={Settings}
            label="Settings"
            active={location.pathname === "/app/settings"}
            onClick={() => navigate("/app/settings")}
          />
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
