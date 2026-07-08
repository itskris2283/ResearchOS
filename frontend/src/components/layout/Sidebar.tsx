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

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const { currentWorkspace } = useWorkspace();

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

  const navItems = currentWorkspace ? [...globalItems, ...workspaceItems] : globalItems;

  return (
    <AnimatePresence>
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 240 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex flex-col border-r bg-card/50 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto py-2 px-2">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t p-2">
          <button
            onClick={() => navigate("/app/settings")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
