import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Filter,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import cytoscape from "cytoscape";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGraph } from "@/hooks/useGraph";

const graphTypes = [
  { id: "citation", label: "Citation", color: "bg-blue-500" },
  { id: "knowledge", label: "Knowledge", color: "bg-emerald-500" },
  { id: "concept", label: "Concept", color: "bg-purple-500" },
  { id: "author", label: "Author", color: "bg-amber-500" },
  { id: "dataset", label: "Dataset", color: "bg-rose-500" },
  { id: "topic", label: "Topic", color: "bg-cyan-500" },
];

export default function KnowledgeGraphPage() {
  const [activeGraph, setActiveGraph] = useState("knowledge");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useGraph(workspaceId, activeGraph);
  const graphData = data?.data;
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current || !graphData?.nodes?.length) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const validNodes = graphData.nodes.filter((n: any) => n.id && String(n.id).trim() !== "");
    const validNodeIds = new Set(validNodes.map((n: any) => String(n.id)));
    const validEdges = graphData.edges.filter((e: any) => validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target)));

    const elements = [
      ...validNodes.map((n: any) => ({
        data: { id: String(n.id), label: n.label || n.title || n.name || String(n.id), type: n.type },
        style: {
          backgroundColor:
            n.type === "paper" ? "#3b82f6" :
            n.type === "author" ? "#f59e0b" :
            n.type === "dataset" ? "#e11d48" :
            n.type === "method" ? "#10b981" :
            n.type === "concept" ? "#8b5cf6" :
            n.type === "institution" ? "#06b6d4" :
            "#6b7280",
        },
      })),
      ...validEdges.map((e: any) => ({
        data: {
          id: `edge-${e.source}-${e.target}-${Math.random().toString(36).substr(2, 9)}`,
          source: String(e.source),
          target: String(e.target),
          label: e.label || e.type,
        },
      })),
    ];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            color: "#fff",
            "font-size": "10px",
            "text-wrap": "wrap",
            "text-max-width": "80px",
            width: 40,
            height: 40,
            "border-width": 0,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#4b5563",
            "target-arrow-color": "#4b5563",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "8px",
            color: "#6b7280",
            "text-rotation": "autorotate",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#fff",
            "border-width": 2,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 500,
        padding: 30,
      },
      wheelSensitivity: 0.3,
    });

    cyRef.current.on("tap", "node", (evt) => {
      const nodeData = evt.target.data();
      const fullNode = validNodes.find((n: any) => String(n.id) === String(nodeData.id));
      setSelectedNode(fullNode || nodeData);
    });

    cyRef.current.on("tap", (evt) => {
      if (evt.target === cyRef.current) {
        setSelectedNode(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData, activeGraph]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() + 0.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() - 0.2);
  const handleReset = () => cyRef.current?.layout({ name: "preset" }).run();

  const nodeCount = graphData?.nodes?.length ?? 0;
  const edgeCount = graphData?.edges?.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize research relationships interactively
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-2" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-2" />
            )}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {graphTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveGraph(type.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeGraph === type.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${type.color}`} />
            {type.label}
          </button>
        ))}
      </div>

      <div className="relative flex gap-4">
        <Card className="flex-1 glass-card overflow-hidden" style={{ height: isFullscreen ? "calc(100vh - 200px)" : "600px" }}>
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!workspaceId && !isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Layers className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Knowledge graph visualization</p>
                <p className="text-xs mt-1">Powered by Cytoscape.js</p>
                <p className="text-xs text-muted-foreground/50 mt-4">
                  Select a workspace to view its knowledge graph
                </p>
              </div>
            </div>
          ) : workspaceId && !isLoading && (!graphData || !graphData.nodes || graphData.nodes.length === 0) ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Layers className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">No graph data available</p>
                <p className="text-xs mt-1">Click Sync in your workspace to generate the graph</p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute top-3 left-3 z-10 flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search nodes..."
                    className="h-8 w-48 pl-8 text-xs"
                  />
                </div>
              </div>
              <div className="absolute top-3 right-3 z-10 flex gap-1">
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div ref={containerRef} className="h-full w-full" />
            </>
          )}
        </Card>

        <Card className="w-72 glass-card shrink-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Graph Legend</h3>
            <div className="space-y-2">
              {[
                { label: "Paper", color: "bg-blue-500" },
                { label: "Author", color: "bg-amber-500" },
                { label: "Dataset", color: "bg-rose-500" },
                { label: "Method", color: "bg-emerald-500" },
                { label: "Concept", color: "bg-purple-500" },
                { label: "Institution", color: "bg-cyan-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={`h-3 w-3 rounded-full ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <h3 className="text-sm font-medium mb-2">Statistics</h3>
            <div className="space-y-1 text-xs text-muted-foreground mb-4">
              <p>Nodes: {nodeCount.toLocaleString()}</p>
              <p>Edges: {edgeCount.toLocaleString()}</p>
            </div>
            
            <Separator className="my-3" />
            <h3 className="text-sm font-medium mb-2">Node Details</h3>
            {selectedNode ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Name:</span>
                  <span className="ml-2">{selectedNode.title || selectedNode.name || selectedNode.label || selectedNode.id}</span>
                </div>
                {selectedNode.year && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Year:</span>
                    <span className="ml-2">{selectedNode.year}</span>
                  </div>
                )}
                {selectedNode.description && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Description:</span>
                    <p className="mt-1 text-muted-foreground">{selectedNode.description}</p>
                  </div>
                )}
                {selectedNode.affiliation && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Affiliation:</span>
                    <p className="mt-1 text-muted-foreground">{selectedNode.affiliation}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Click a node to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
