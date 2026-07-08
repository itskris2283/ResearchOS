import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Network,
  Brain,
  BookOpen,
  Sparkles,
  Compass,
  Lightbulb,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Network, title: "Knowledge Graphs", description: "Visualize research relationships interactively" },
    { icon: Brain, title: "Mind Maps", description: "Understand concept hierarchies at a glance" },
    { icon: BookOpen, title: "Literature Reviews", description: "Generate citation-grounded reviews automatically" },
    { icon: Compass, title: "Research Discovery", description: "Find papers across 5+ scientific sources" },
    { icon: Lightbulb, title: "Research Gaps", description: "Identify underexplored opportunities" },
    { icon: BarChart3, title: "Research Analytics", description: "Understand field trends and velocities" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="glass fixed top-0 z-50 w-full border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-sm font-semibold">ResearchOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/app/new-workspace")}>
              Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-5xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI-Powered Research Operating System
              </div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance">
                The AI Operating System for{" "}
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  Scientific Discovery
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
                Go from "I have a research idea" to "I completely understand the research landscape."
                ResearchOS automatically discovers papers, builds knowledge graphs, generates literature reviews,
                and creates a permanent research workspace.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/app/new-workspace")}>
                  Start Your First Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Everything you need for research</h2>
              <p className="mt-2 text-muted-foreground">
                One platform to discover, understand, and connect research
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card group rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <div className="grid gap-8 sm:grid-cols-3 mt-12">
              {[
                { step: "1", title: "Enter a Topic", desc: "Type any research area you're interested in" },
                { step: "2", title: "AI Discovery", desc: "ResearchOS searches 5+ sources automatically" },
                { step: "3", title: "Interactive Workspace", desc: "Explore graphs, reviews, and insights" },
              ].map((item) => (
                <div key={item.step}>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t py-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
                <span className="text-xs font-bold text-primary">R</span>
              </div>
              <span className="text-sm text-muted-foreground">ResearchOS v2.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Built for researchers</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
