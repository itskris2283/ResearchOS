import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { Toaster } from "sonner";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import DiscoveryPage from "./pages/DiscoveryPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import MindMapPage from "./pages/MindMapPage";
import TimelinePage from "./pages/TimelinePage";
import PapersPage from "./pages/PapersPage";
import LiteratureReviewPage from "./pages/LiteratureReviewPage";
import ResearchGapsPage from "./pages/ResearchGapsPage";
import DatasetsPage from "./pages/DatasetsPage";
import AuthorsPage from "./pages/AuthorsPage";
import RoadmapPage from "./pages/RoadmapPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BookmarksPage from "./pages/BookmarksPage";
import NotesPage from "./pages/NotesPage";
import SettingsPage from "./pages/SettingsPage";
import WorkspacePage from "./pages/WorkspacePage";
import NewWorkspacePage from "./pages/NewWorkspacePage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <WorkspaceProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="discovery" element={<DiscoveryPage />} />
              <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
              <Route path="mind-maps" element={<MindMapPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="papers" element={<PapersPage />} />
              <Route path="literature-review" element={<LiteratureReviewPage />} />
              <Route path="research-gaps" element={<ResearchGapsPage />} />
              <Route path="datasets" element={<DatasetsPage />} />
              <Route path="authors" element={<AuthorsPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="workspace/:id" element={<WorkspacePage />} />
              <Route path="new-workspace" element={<NewWorkspacePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "hsl(222.2 84% 4.9%)",
                border: "1px solid hsl(217.2 32.6% 17.5%)",
                color: "hsl(210 40% 98%)",
              },
            }}
          />
        </WorkspaceProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
