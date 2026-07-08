import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  Maximize2,
  Download,
  RotateCcw,
  Search,
  Workflow,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useConceptGraph } from "@/hooks/useGraph";
import * as d3 from "d3-force";
import { toPng } from "html-to-image";

const getLayoutedElements = (nodes: any[], edges: any[]) => {
  if (nodes.length === 0) return { nodes, edges };

  // Setup simulation nodes and edges
  const simNodes = nodes.map(n => ({ ...n, id: String(n.id), x: Math.random() * 800, y: Math.random() * 800 }));
  const simEdges = edges.map(e => ({ ...e, source: String(e.source), target: String(e.target) }));

  const simulation = d3.forceSimulation(simNodes)
    .force("charge", d3.forceManyBody().strength(-2500))
    .force("center", d3.forceCenter(400, 400))
    .force("x", d3.forceX(400).strength(0.15))
    .force("y", d3.forceY(400).strength(0.15))
    .force("link", d3.forceLink(simEdges).id((d: any) => d.id).distance(300))
    .force("collide", d3.forceCollide().radius(120))
    .stop();

  // Run simulation statically for 300 ticks to settle
  for (let i = 0; i < 300; ++i) {
    simulation.tick();
  }

  const layoutedNodes = nodes.map((node, i) => {
    const simNode = simNodes[i];
    return {
      ...node,
      targetPosition: "top",
      sourcePosition: "bottom",
      position: {
        x: simNode.x,
        y: simNode.y,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function MindMapPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useConceptGraph(workspaceId);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleExport = () => {
    if (containerRef.current === null) return;
    
    // We capture the ReactFlow viewport specifically
    const flowElement = containerRef.current.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) return;

    // Calculate bounds of all nodes to export the entire map
    const nodesBounds = getRectOfNodes(nodes);
    const imageWidth = Math.max(nodesBounds.width + 400, 1024);
    const imageHeight = Math.max(nodesBounds.height + 400, 768);
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.1, 2);

    toPng(flowElement, { 
      cacheBust: true, 
      backgroundColor: '#030712', // Dark theme background
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      }
    })
    .then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `mindmap-${workspaceId || 'export'}.png`;
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.error("Failed to export image", err);
    });
  };

  const graphData = data?.data;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!graphData?.nodes || !graphData?.edges) {
      return { nodes: [], edges: [] };
    }
    const validNodes = graphData.nodes.filter((n: any) => n.id && String(n.id).trim() !== "");
    const validNodeIds = new Set(validNodes.map((n: any) => String(n.id)));
    const validEdgesList = graphData.edges.filter((e: any) => validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target)));

    // Only keep nodes that have at least one connection
    const connectedNodeIds = new Set();
    validEdgesList.forEach((e: any) => {
      connectedNodeIds.add(String(e.source));
      connectedNodeIds.add(String(e.target));
    });

    const connectedNodes = validNodes.filter((n: any) => connectedNodeIds.has(String(n.id)));

    const nodes = connectedNodes.map((n: any, i: number) => ({
      id: String(n.id),
      type: "default",
      position: { x: 0, y: 0 },
      data: {
        label: n.label || n.title || n.name || String(n.id),
        fullData: n,
      },
      style: {
        background: n.type === "concept" ? "#8b5cf6" : n.type === "paper" ? "#3b82f6" : "#6b7280",
        color: "#fff",
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "12px",
        border: "none",
      },
    }));
    const edges = validEdgesList.map((e: any) => ({
      id: `edge-${e.source}-${e.target}-${Math.random().toString(36).substr(2, 9)}`,
      source: String(e.source),
      target: String(e.target),
      label: e.label || e.type,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#6b7280", strokeWidth: 1 },
      labelStyle: { fontSize: 10, fill: "#9ca3af" },
    }));
    return getLayoutedElements(nodes, edges);
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeMouseEnter = (event: React.MouseEvent, node: any) => {
    setHoverNode(node);
  };

  const onNodeMouseMove = (event: React.MouseEvent) => {
    if (hoverNode) {
      setMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const onNodeMouseLeave = () => {
    setHoverNode(null);
  };

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mind Maps</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Concept-focused research visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </div>

      <Card 
        ref={containerRef}
        className="glass-card overflow-hidden relative" 
        style={{ height: isFullscreen ? "100vh" : "600px", borderRadius: isFullscreen ? 0 : undefined, border: isFullscreen ? 'none' : undefined }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!workspaceId && !isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Workflow className="mx-auto h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">Mind map visualization</p>
              <p className="text-xs mt-1">Powered by React Flow</p>
              <p className="text-xs text-muted-foreground/50 mt-4">
                Select a workspace to view its concept mind map
              </p>
            </div>
          </div>
        ) : workspaceId && !isLoading && (!graphData || !graphData.nodes || graphData.nodes.length === 0) ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Workflow className="mx-auto h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">No mind map data available</p>
              <p className="text-xs mt-1">Click Sync in your workspace to generate the mind map</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            onMouseMove={onNodeMouseMove}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={16} />
            <MiniMap
              nodeStrokeColor="#6b7280"
              nodeColor={(n) => n.style?.background as string || "#6b7280"}
              maskColor="rgba(0,0,0,0.1)"
            />
          </ReactFlow>
        )}
        
        {hoverNode && (
          <div
            className="fixed z-50 bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border pointer-events-none max-w-xs"
            style={{
              top: mousePos.y + 15,
              left: mousePos.x + 15,
            }}
          >
            <div className="font-semibold mb-1 border-b pb-1 border-border/50">
              {hoverNode.data.fullData?.type === "paper" ? "📄 Paper" : "💡 Concept"}
            </div>
            <div className="text-muted-foreground break-words mt-1 font-medium">
              {hoverNode.data.fullData?.title || hoverNode.data.fullData?.name || hoverNode.data.label}
            </div>
            {hoverNode.data.fullData?.type === "paper" && (
              <div className="mt-1 text-xs opacity-90">
                {hoverNode.data.fullData?.authors && (
                  <div className="mb-1">
                    <span className="opacity-70">Authors:</span> {hoverNode.data.fullData.authors}
                  </div>
                )}
                {hoverNode.data.fullData?.year && hoverNode.data.fullData.year !== "N/A" && (
                  <div className="mb-1">
                    <span className="opacity-70">Year:</span> {hoverNode.data.fullData.year}
                  </div>
                )}
              </div>
            )}
            {hoverNode.data.fullData?.abstract && hoverNode.data.fullData?.type === "paper" && (
              <div className="mt-2 text-xs opacity-70 italic line-clamp-4">
                {hoverNode.data.fullData.abstract}
              </div>
            )}
            {hoverNode.data.fullData?.description && hoverNode.data.fullData?.type === "concept" && (
              <div className="mt-2 text-xs opacity-80 italic">
                {hoverNode.data.fullData.description}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
