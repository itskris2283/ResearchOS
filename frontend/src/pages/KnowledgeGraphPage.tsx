import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Crosshair,
  Sparkles,
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import cytoscape from "cytoscape";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useGraph } from "@/hooks/useGraph";

const graphTypes = [
  { id: "knowledge", label: "Knowledge", color: "bg-emerald-500" },
  { id: "citation", label: "Citation", color: "bg-blue-500" },
  { id: "concept", label: "Concept", color: "bg-purple-500" },
  { id: "author", label: "Author", color: "bg-amber-500" },
  { id: "dataset", label: "Dataset", color: "bg-rose-500" },
  { id: "topic", label: "Topic", color: "bg-cyan-500" },
];

const NODE_CONFIG: Record<string, { label: string; color: string; border: string; bgClass: string; shape: string }> = {
  paper: { label: "Paper", color: "#3b82f6", border: "#60a5fa", bgClass: "bg-blue-500", shape: "ellipse" },
  method: { label: "Method", color: "#10b981", border: "#34d399", bgClass: "bg-emerald-500", shape: "diamond" },
  dataset: { label: "Dataset", color: "#f43f5e", border: "#fb7185", bgClass: "bg-rose-500", shape: "hexagon" },
  concept: { label: "Concept", color: "#8b5cf6", border: "#a78bfa", bgClass: "bg-purple-500", shape: "round-rectangle" },
  author: { label: "Author", color: "#f59e0b", border: "#fbbf24", bgClass: "bg-amber-500", shape: "ellipse" },
  institution: { label: "Institution", color: "#06b6d4", border: "#22d3ee", bgClass: "bg-cyan-500", shape: "tag" },
  topic: { label: "Topic", color: "#0ea5e9", border: "#38bdf8", bgClass: "bg-sky-500", shape: "ellipse" },
};

export default function KnowledgeGraphPage() {
  const [activeGraph, setActiveGraph] = useState("knowledge");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutName, setLayoutName] = useState<string>("concentric");
  const [cleanMode, setCleanMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["paper", "method", "dataset", "concept", "institution", "topic", "author"])
  );
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [exploringCategory, setExploringCategory] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);

  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useGraph(workspaceId, activeGraph);
  const graphData = data?.data;

  // Compute node degree across the entire raw graph
  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!graphData?.edges) return map;
    for (const e of graphData.edges) {
      const s = String(e.source);
      const t = String(e.target);
      map.set(s, (map.get(s) || 0) + 1);
      map.set(t, (map.get(t) || 0) + 1);
    }
    return map;
  }, [graphData]);

  // Available node types with their counts in the database
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!graphData?.nodes) return counts;
    for (const n of graphData.nodes) {
      const t = n.type || "paper";
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [graphData]);

  // Clean, high-signal elements calculation
  const { elements, visibleNodeCount, visibleEdgeCount, visibleTypeCounts } = useMemo(() => {
    if (!graphData?.nodes?.length) {
      return { elements: [], visibleNodeCount: 0, visibleEdgeCount: 0, visibleTypeCounts: {} };
    }

    const rawNodes = graphData.nodes;
    const rawEdges = graphData.edges || [];

    // Filter nodes based on active type toggles and Clean Mode
    const validNodes = rawNodes.filter((n: any) => {
      const id = String(n.id || "").trim();
      if (!id) return false;
      const type = n.type || "paper";
      if (!selectedTypes.has(type)) return false;

      // In Clean Mode for knowledge graph, declutter single-mention leaf authors
      if (cleanMode && activeGraph === "knowledge" && type === "author") {
        const deg = degreeMap.get(id) || 0;
        // Only show authors who collaborated on 2+ papers (genuine hubs)
        if (deg < 2) return false;
      }
      return true;
    });

    const validNodeIds = new Set(validNodes.map((n: any) => String(n.id)));

    const validEdges = rawEdges.filter(
      (e: any) => validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target))
    );

    const vCounts: Record<string, number> = {};
    const nodeElements = validNodes.map((n: any) => {
      const id = String(n.id);
      const type = n.type || "paper";
      vCounts[type] = (vCounts[type] || 0) + 1;
      const deg = degreeMap.get(id) || 0;
      const label = n.label || n.title || n.name || id;

      return {
        data: {
          id,
          label,
          type,
          degree: deg,
          year: n.year,
          description: n.description || n.abstract || "",
          affiliation: n.affiliation || "",
        },
      };
    });

    const edgeElements = validEdges.map((e: any, idx: number) => ({
      data: {
        id: `edge-${e.source}-${e.target}-${idx}`,
        source: String(e.source),
        target: String(e.target),
        label: e.relation || e.type || "",
      },
    }));

    return {
      elements: [...nodeElements, ...edgeElements],
      visibleNodeCount: nodeElements.length,
      visibleEdgeCount: edgeElements.length,
      visibleTypeCounts: vCounts,
    };
  }, [graphData, selectedTypes, cleanMode, activeGraph, degreeMap]);

  const totalRawNodes = graphData?.nodes?.length ?? 0;
  const totalRawEdges = graphData?.edges?.length ?? 0;

  // Toggle node type visibility
  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleSelectAllTypes = () => {
    setSelectedTypes(new Set(Object.keys(NODE_CONFIG)));
  };

  const handleDeselectAllTypes = () => {
    setSelectedTypes(new Set());
  };

  // Nodes for the currently explored category in the side panel
  const categoryNodes = useMemo(() => {
    if (!exploringCategory || !graphData?.nodes) return [];
    return graphData.nodes.filter(
      (n: any) => (n.type || "paper") === exploringCategory && String(n.id).trim() !== ""
    );
  }, [exploringCategory, graphData]);

  const filteredCategoryNodes = useMemo(() => {
    if (!categorySearch.trim()) return categoryNodes;
    const q = categorySearch.toLowerCase();
    return categoryNodes.filter((n: any) => {
      const label = (n.title || n.name || n.label || String(n.id)).toLowerCase();
      return label.includes(q);
    });
  }, [categoryNodes, categorySearch]);

  // Spotlight an entire category on canvas
  const handleHighlightCategory = useCallback((type: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const nodesOfType = cy.nodes(`[type = "${type}"]`);
    if (nodesOfType.length > 0) {
      cy.elements().addClass("faded");
      nodesOfType.removeClass("faded").addClass("highlighted");
      cy.animate({
        fit: { eles: nodesOfType, padding: 60 },
        duration: 350,
      });
      toast.info(`Spotlighting ${nodesOfType.length} ${type} nodes on canvas`);
    } else {
      toast.warning(`No visible ${type} nodes on canvas. Turn on filter to view them.`);
    }
  }, []);

  const hoverTimerRef = useRef<any>(null);
  const activeHoverNodeIdRef = useRef<string | null>(null);

  // Initialize Cytoscape core
  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      boxSelectionEnabled: false,
      wheelSensitivity: 0.2,
      minZoom: 0.08,
      maxZoom: 3.5,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      motionBlur: false, // Prevents canvas motion blur buffering and stutter
      textureOnViewport: false,
      hideEdgesOnViewport: false,
      style: [
        // Base Node Style
        {
          selector: "node",
          style: {
            "background-color": "#3b82f6",
            "border-width": 2,
            "border-color": "#1e293b",
            "border-opacity": 0.9,
            width: 30,
            height: 30,
            color: "#f8fafc",
            "font-size": "10px",
            "font-family": "Inter, system-ui, sans-serif",
            "font-weight": 500,
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 5,
            "text-max-width": "95px",
            "text-wrap": "ellipsis",
            "text-background-color": "#090d16",
            "text-background-opacity": 0.85,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            "min-zoomed-font-size": 8,
          },
        },
        // Papers
        {
          selector: 'node[type = "paper"]',
          style: {
            "background-color": "#3b82f6",
            "border-color": "#60a5fa",
            "border-width": 2,
            width: 32,
            height: 32,
            shape: "ellipse",
            label: "data(label)",
          },
        },
        // Methods
        {
          selector: 'node[type = "method"]',
          style: {
            "background-color": "#10b981",
            "border-color": "#34d399",
            "border-width": 2.5,
            width: 36,
            height: 36,
            shape: "diamond",
            label: "data(label)",
          },
        },
        // Datasets
        {
          selector: 'node[type = "dataset"]',
          style: {
            "background-color": "#f43f5e",
            "border-color": "#fb7185",
            "border-width": 2.5,
            width: 34,
            height: 34,
            shape: "hexagon",
            label: "data(label)",
          },
        },
        // Concepts
        {
          selector: 'node[type = "concept"]',
          style: {
            "background-color": "#8b5cf6",
            "border-color": "#a78bfa",
            "border-width": 2,
            width: 30,
            height: 30,
            shape: "round-rectangle",
            label: "data(label)",
          },
        },
        // Authors: clean compact dots, no text clutter unless hovered/selected
        {
          selector: 'node[type = "author"]',
          style: {
            "background-color": "#f59e0b",
            "border-color": "#fbbf24",
            "border-width": 1.5,
            width: 18,
            height: 18,
            shape: "ellipse",
            label: "",
          },
        },
        // Institutions
        {
          selector: 'node[type = "institution"]',
          style: {
            "background-color": "#06b6d4",
            "border-color": "#22d3ee",
            "border-width": 2,
            width: 30,
            height: 30,
            shape: "tag",
            label: "data(label)",
          },
        },
        // Selected Node
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "#ffffff",
            "overlay-color": "#38bdf8",
            "overlay-padding": 5,
            "overlay-opacity": 0.3,
            label: "data(label)",
            "z-index": 1000,
          },
        },
        // Hovered Node - lightweight border to avoid heavy canvas overlay recalculations
        {
          selector: "node.hovered",
          style: {
            "border-width": 3,
            "border-color": "#ffffff",
            "z-index": 999,
          },
        },
        // Search Matched Node
        {
          selector: "node.searched",
          style: {
            "border-width": 4,
            "border-color": "#f43f5e",
            "overlay-color": "#f43f5e",
            "overlay-padding": 5,
            "overlay-opacity": 0.4,
            label: "data(label)",
            "z-index": 999,
          },
        },
        // Highlighted Neighborhood
        {
          selector: "node.highlighted",
          style: {
            opacity: 1,
            "z-index": 200,
          },
        },
        // Faded Nodes (outside spotlight)
        {
          selector: "node.faded",
          style: {
            opacity: 0.12,
          },
        },
        // Base Edge: Clean, subtle curves without permanent rotated text
        {
          selector: "edge",
          style: {
            width: 1.2,
            "line-color": "#334155",
            "curve-style": "bezier",
            opacity: 0.4,
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#334155",
            "arrow-scale": 0.7,
          },
        },
        // Faded Edges
        {
          selector: "edge.faded",
          style: {
            opacity: 0.05,
          },
        },
        // Highlighted Edges - sleek lines without changing arrow geometry
        {
          selector: "edge.highlighted",
          style: {
            opacity: 0.95,
            width: 1.8,
            "line-color": "#38bdf8",
            "target-arrow-color": "#38bdf8",
            "z-index": 100,
          },
        },
        // Selected Edge
        {
          selector: "edge:selected",
          style: {
            opacity: 1,
            width: 2.2,
            "line-color": "#60a5fa",
            "target-arrow-color": "#60a5fa",
            label: "data(label)",
            "font-size": "9px",
            color: "#e2e8f0",
            "text-background-color": "#0b0f19",
            "text-background-opacity": 0.9,
            "text-background-padding": "2px",
          },
        },
      ],
    });

    cyRef.current = cy;

    // Smooth debounced hover spotlight interactions
    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      const nodeId = String(node.data("id"));

      if (activeHoverNodeIdRef.current === nodeId) return;

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }

      // Check zoom level: heavily zoomed-out nodes have microscopic hitboxes
      const currentZoom = cy.zoom();
      const debounceDelay = currentZoom < 0.35 ? 45 : 20;

      hoverTimerRef.current = setTimeout(() => {
        if (!cy || cy.destroyed() || !node || node.removed()) return;
        activeHoverNodeIdRef.current = nodeId;

        const neighborhood = node.closedNeighborhood();
        const otherEles = cy.elements().not(neighborhood);

        cy.batch(() => {
          otherEles.removeClass("highlighted hovered").addClass("faded");
          neighborhood.removeClass("faded").addClass("highlighted");
          node.addClass("hovered");
        });

        setHoveredNode({
          id: nodeId,
          label: node.data("label") || nodeId,
          type: node.data("type") || "paper",
          degree: node.degree(),
        });
      }, debounceDelay);
    });

    cy.on("mouseout", "node", () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }

      hoverTimerRef.current = setTimeout(() => {
        if (!cy || cy.destroyed()) return;
        activeHoverNodeIdRef.current = null;
        cy.batch(() => {
          cy.elements().removeClass("faded highlighted hovered");
        });
        setHoveredNode(null);
      }, 35);
    });

    // Clean up hover state when pointer leaves canvas container
    const containerEl = containerRef.current;
    const handleMouseLeave = () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      activeHoverNodeIdRef.current = null;
      if (!cy.destroyed()) {
        cy.batch(() => {
          cy.elements().removeClass("faded highlighted hovered");
        });
      }
      setHoveredNode(null);
    };
    containerEl.addEventListener("mouseleave", handleMouseLeave);

    // Selection interaction
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      const nodeId = String(node.data("id"));
      const fullNode = graphData?.nodes?.find((n: any) => String(n.id) === nodeId);
      const neighbors = node.neighborhood("node").map((n: any) => ({
        id: String(n.data("id")),
        label: n.data("label"),
        type: n.data("type"),
      }));

      setSelectedNode({
        ...(fullNode || node.data()),
        id: nodeId,
        degree: node.degree(),
        neighbors,
      });
      setExploringCategory(null);
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass("faded highlighted hovered searched");
        setSearchQuery("");
        setMatchCount(null);
      }
    });

    return () => {
      containerEl.removeEventListener("mouseleave", handleMouseLeave);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (layoutRef.current) layoutRef.current.stop();
      cy.destroy();
      cyRef.current = null;
    };
  }, [graphData]);

  // Run Layout on elements or layoutName change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !elements.length) return;

    if (layoutRef.current) {
      layoutRef.current.stop();
    }

    cy.batch(() => {
      cy.remove(cy.elements());
      cy.add(elements);
    });

    // Run layout without freezing the browser
    const runCurrentLayout = () => {
      let layoutOptions: any;

      if (layoutName === "concentric") {
        layoutOptions = {
          name: "concentric",
          fit: true,
          padding: 40,
          animate: false,
          concentric: (node: any) => {
            const type = node.data("type");
            if (type === "method" || type === "dataset") return 10;
            if (type === "paper") return 7;
            if (type === "concept") return 5;
            return 2;
          },
          levelWidth: () => 2,
        };
      } else if (layoutName === "breadthfirst") {
        layoutOptions = {
          name: "breadthfirst",
          directed: true,
          fit: true,
          padding: 40,
          animate: false,
          spacingFactor: 1.2,
        };
      } else if (layoutName === "circle") {
        layoutOptions = {
          name: "circle",
          fit: true,
          padding: 40,
          animate: false,
        };
      } else {
        // Fast, capped COSE layout that finishes in <50ms without freezing
        layoutOptions = {
          name: "cose",
          animate: false,
          fit: true,
          padding: 40,
          randomize: false,
          nodeRepulsion: (node: any) => (node.data("type") === "author" ? 2500 : 7000),
          idealEdgeLength: 70,
          numIter: 100,
          coolingFactor: 0.9,
          gravity: 1.2,
        };
      }

      const layout = cy.layout(layoutOptions);
      layoutRef.current = layout;
      layout.run();
    };

    requestAnimationFrame(runCurrentLayout);
  }, [elements, layoutName]);

  // Real-time Search Handler
  const handleSearch = (term: string) => {
    setSearchQuery(term);
    const cy = cyRef.current;
    if (!cy) return;

    if (!term.trim()) {
      cy.elements().removeClass("searched faded highlighted");
      setMatchCount(null);
      return;
    }

    const lower = term.toLowerCase();
    const matched = cy.nodes().filter((n) => {
      const label = (n.data("label") || "").toLowerCase();
      const type = (n.data("type") || "").toLowerCase();
      return label.includes(lower) || type.includes(lower);
    });

    setMatchCount(matched.length);

    if (matched.length > 0) {
      cy.elements().addClass("faded");
      matched.removeClass("faded").addClass("searched");
      matched.neighborhood().removeClass("faded");

      cy.animate({
        fit: { eles: matched, padding: 80 },
        duration: 350,
      });
    } else {
      cy.elements().removeClass("searched faded");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setMatchCount(null);
    if (cyRef.current) {
      cyRef.current.elements().removeClass("searched faded highlighted");
      cyRef.current.fit(undefined, 40);
    }
  };

  // Center on a specific node
  const handleFocusNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const target = cy.getElementById(nodeId);
    if (target.length) {
      cy.elements().removeClass("faded highlighted hovered searched");
      const neighborhood = target.closedNeighborhood();
      cy.elements().addClass("faded");
      neighborhood.removeClass("faded").addClass("highlighted");
      target.select();
      cy.animate({
        center: { eles: target },
        zoom: 1.6,
        duration: 400,
      });
      const fullNode = graphData?.nodes?.find((n: any) => String(n.id) === nodeId);
      const neighbors = target.neighborhood("node").map((n: any) => ({
        id: String(n.data("id")),
        label: n.data("label"),
        type: n.data("type"),
      }));
      setSelectedNode({
        ...(fullNode || target.data()),
        id: nodeId,
        degree: target.degree(),
        neighbors,
      });
      setExploringCategory(null);
    } else {
      // If node is currently filtered out, temporarily enable its type or notify
      const fullNode = graphData?.nodes?.find((n: any) => String(n.id) === nodeId);
      if (fullNode) {
        setSelectedNode(fullNode);
        setExploringCategory(null);
        toast.info(`Node is currently hidden by filters. Enable "${fullNode.type}" to display on canvas.`);
      }
    }
  }, [graphData]);

  // Camera controls
  const handleZoomIn = useCallback(() => cyRef.current?.zoom(cyRef.current.zoom() + 0.25), []);
  const handleZoomOut = useCallback(() => cyRef.current?.zoom(cyRef.current.zoom() - 0.25), []);
  const handleFit = useCallback(() => cyRef.current?.fit(undefined, 40), []);
  const handleReset = useCallback(() => {
    if (layoutRef.current) layoutRef.current.stop();
    cyRef.current?.elements().removeClass("faded highlighted hovered searched");
    cyRef.current?.fit(undefined, 40);
  }, []);

  // PNG Export
  const handleExportPng = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    try {
      const pngUri = cy.png({
        full: true,
        scale: 2,
        bg: "#0a0e17",
      });
      const a = document.createElement("a");
      a.href = pngUri;
      a.download = `researchos-graph-${activeGraph}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Graph exported as PNG image");
    } catch {
      toast.error("Failed to export image");
    }
  }, [activeGraph]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Knowledge Graph</h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              v2.0 Turbo
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore scientific connections, methodology links, and author networks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/50">
            <Compass className="h-3.5 w-3.5 text-muted-foreground ml-1.5" />
            <Select value={layoutName} onValueChange={setLayoutName}>
              <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none focus:ring-0 w-32">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concentric">🪐 Concentric</SelectItem>
                <SelectItem value="cose">⚡ Organic Force</SelectItem>
                <SelectItem value="breadthfirst">🌲 Tree Hierarchy</SelectItem>
                <SelectItem value="circle">⭕ Circular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportPng}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-1.5" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-1.5" />
            )}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* Graph Type Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b pb-3">
        <div className="flex gap-1.5 flex-wrap">
          {graphTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setActiveGraph(type.id);
                setSelectedNode(null);
                setExploringCategory(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeGraph === type.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${type.color}`} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Clean Mode Toggle */}
        {activeGraph === "knowledge" && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/40 border border-border/40 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-medium">Clean View (Hub Authors Only)</span>
            <Switch
              checked={cleanMode}
              onCheckedChange={setCleanMode}
              aria-label="Toggle clean view"
            />
          </div>
        )}
      </div>

      {/* Node Type Filter Chips Bar */}
      {Object.keys(typeCounts).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold mr-1">
            <Filter className="h-3 w-3" /> Filter Types:
          </span>
          {Object.entries(typeCounts).map(([type, count]) => {
            const conf = NODE_CONFIG[type] || {
              label: type,
              color: "#6b7280",
              bgClass: "bg-slate-500",
            };
            const active = selectedTypes.has(type);
            const visibleCount = visibleTypeCounts[type] || 0;
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? "bg-accent/80 text-foreground border-border shadow-xs"
                    : "bg-transparent text-muted-foreground/60 border-dashed border-border/40 hover:text-muted-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-opacity ${
                    active ? conf.bgClass : "bg-muted-foreground/40"
                  }`}
                />
                <span className="capitalize">{conf.label}</span>
                <span className="text-[10px] opacity-70">
                  ({visibleCount}/{count.toLocaleString()})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Canvas + Right Sidebar */}
      <div className="relative flex gap-4">
        <Card
          className="flex-1 glass-card overflow-hidden relative border border-border/60 bg-[#090d16]"
          style={{ height: isFullscreen ? "calc(100vh - 180px)" : "620px" }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-xs">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground font-medium">Constructing knowledge graph...</p>
              </div>
            </div>
          )}

          {!workspaceId && !isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Layers className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Select a workspace to view its knowledge graph</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Powered by Cytoscape.js & NetworkX
                </p>
              </div>
            </div>
          ) : workspaceId && !isLoading && totalRawNodes === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Layers className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">No graph data generated yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add or sync papers in this workspace to build the graph
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Top Left: Search Bar */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search nodes & methods..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="h-8 w-56 pl-8 pr-7 text-xs bg-background/90 backdrop-blur-md border-border/80 shadow-md"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {matchCount !== null && (
                  <Badge variant="secondary" className="h-8 text-xs font-normal bg-background/90 backdrop-blur-md border border-border shadow-md">
                    {matchCount} {matchCount === 1 ? "match" : "matches"}
                  </Badge>
                )}
              </div>

              {/* Top Right: Zoom & Fit Controls */}
              <div className="absolute top-3 right-3 z-10 flex gap-1 bg-background/80 backdrop-blur-md p-1 rounded-lg border border-border/70 shadow-md">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom In">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom Out">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFit} title="Fit to Screen">
                  <Crosshair className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset View">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Bottom Left: Hover Status Card & Visible Stats */}
              <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                {hoveredNode && (
                  <div className="bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-lg shadow-lg pointer-events-auto flex items-center gap-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        NODE_CONFIG[hoveredNode.type]?.bgClass || "bg-blue-500"
                      }`}
                    />
                    <span className="font-semibold text-foreground max-w-[200px] truncate">
                      {hoveredNode.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] capitalize px-1 py-0">
                      {hoveredNode.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {hoveredNode.degree} links
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground/80 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-border/40 w-fit">
                  {visibleNodeCount.toLocaleString()} nodes • {visibleEdgeCount.toLocaleString()} connections
                  {visibleNodeCount < totalRawNodes && (
                    <span className="ml-1 text-emerald-400 font-medium">
                      ({totalRawNodes - visibleNodeCount} filtered)
                    </span>
                  )}
                </div>
              </div>

              {/* Cytoscape Container */}
              <div ref={containerRef} className="h-full w-full" />
            </>
          )}
        </Card>

        {/* Right Details & Inspection Panel */}
        <Card className="w-80 glass-card shrink-0 border border-border/60 flex flex-col max-h-[620px] overflow-hidden">
          <CardContent className="p-4 flex flex-col h-full overflow-y-auto space-y-4">
            {/* View 1: Specific Node Details (Active when a node is clicked) */}
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Badge
                      className="capitalize text-[11px] mb-1.5"
                      style={{
                        backgroundColor: NODE_CONFIG[selectedNode.type]?.color || "#3b82f6",
                        color: "#fff",
                      }}
                    >
                      {selectedNode.type}
                    </Badge>
                    <h2 className="text-sm font-semibold leading-snug text-foreground break-words">
                      {selectedNode.title || selectedNode.name || selectedNode.label || selectedNode.id}
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedNode(null)}
                    title="Close details"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => handleFocusNode(String(selectedNode.id))}
                  >
                    <Crosshair className="h-3 w-3 mr-1.5" /> Focus on Canvas
                  </Button>
                </div>

                <Separator />

                {/* Node Metadata */}
                <div className="space-y-2.5 text-xs">
                  {selectedNode.year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publication Year</span>
                      <span className="font-medium">{selectedNode.year}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Connections</span>
                    <Badge variant="secondary" className="text-[10px] h-4">
                      {selectedNode.degree ?? selectedNode.neighbors?.length ?? 0}
                    </Badge>
                  </div>

                  {selectedNode.affiliation && (
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Affiliation</span>
                      <p className="text-foreground font-medium">{selectedNode.affiliation}</p>
                    </div>
                  )}

                  {selectedNode.description && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Description / Abstract</span>
                      <p className="text-muted-foreground bg-muted/30 p-2 rounded-md max-h-36 overflow-y-auto leading-relaxed border border-border/30">
                        {selectedNode.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Connected Neighbors list */}
                {selectedNode.neighbors && selectedNode.neighbors.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Direct Neighbors ({selectedNode.neighbors.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {selectedNode.neighbors.map((nb: any, idx: number) => {
                        const conf = NODE_CONFIG[nb.type] || { bgClass: "bg-slate-500" };
                        return (
                          <button
                            key={`${nb.id}-${idx}`}
                            onClick={() => handleFocusNode(nb.id)}
                            className="w-full text-left p-1.5 rounded-md hover:bg-muted/60 transition-colors flex items-center justify-between gap-2 text-xs group border border-transparent hover:border-border/40"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${conf.bgClass}`} />
                              <span className="truncate group-hover:text-primary transition-colors">
                                {nb.label}
                              </span>
                            </div>
                            <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : exploringCategory ? (
              /* View 2: Category Browser (Active when user clicks to explore a category) */
              <div className="space-y-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 -ml-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setExploringCategory(null)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back to Legend
                  </Button>
                  <Badge
                    variant="outline"
                    className="text-[11px] capitalize"
                    style={{
                      borderColor: NODE_CONFIG[exploringCategory]?.color || "#3b82f6",
                      color: NODE_CONFIG[exploringCategory]?.color || "#3b82f6",
                    }}
                  >
                    {NODE_CONFIG[exploringCategory]?.label || exploringCategory} ({categoryNodes.length})
                  </Badge>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${NODE_CONFIG[exploringCategory]?.label || exploringCategory}...`}
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="h-7 pl-8 text-xs bg-muted/40"
                  />
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[420px] pr-1 flex-1">
                  {filteredCategoryNodes.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No nodes found</p>
                  ) : (
                    filteredCategoryNodes.map((node: any, idx: number) => {
                      const id = String(node.id);
                      const label = node.title || node.name || node.label || id;
                      const deg = degreeMap.get(id) || 0;
                      return (
                        <button
                          key={`${id}-${idx}`}
                          onClick={() => handleFocusNode(id)}
                          className="w-full text-left p-2 rounded-md hover:bg-muted/70 transition-colors flex items-center justify-between gap-2 text-xs border border-transparent hover:border-border/50 group"
                        >
                          <div className="truncate flex-1 min-w-0">
                            <p className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
                              {label}
                            </p>
                            {node.year && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">Year: {node.year}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] h-4 shrink-0 font-mono">
                            {deg} links
                          </Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* View 3: Default Overview (Interactive Legend, Toggles & Statistics) */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Graph Legend & Filters</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Click to explore or toggle visibility
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                      onClick={handleSelectAllTypes}
                      title="Enable all categories"
                    >
                      All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                      onClick={handleDeselectAllTypes}
                      title="Disable all categories"
                    >
                      None
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(NODE_CONFIG).map(([key, item]) => {
                    const totalCount = typeCounts[key] || 0;
                    const visibleCount = visibleTypeCounts[key] || 0;
                    const isSelected = selectedTypes.has(key);

                    return (
                      <div
                        key={key}
                        className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-muted/40 border-border/60 hover:bg-muted/70"
                            : "bg-background/40 border-border/30 opacity-60 hover:opacity-80"
                        }`}
                      >
                        <div
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setCategorySearch("");
                            setExploringCategory(key);
                          }}
                          title={`Click to explore ${item.label} list`}
                        >
                          <span
                            className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="truncate">
                            <p className="text-xs font-medium text-foreground leading-none truncate">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {isSelected ? (
                                <span className="text-emerald-400 font-medium">
                                  {visibleCount.toLocaleString()} visible
                                  {totalCount > visibleCount && ` of ${totalCount}`}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60 italic">Hidden</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Spotlight button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHighlightCategory(key);
                            }}
                            title={`Spotlight all ${item.label} nodes on canvas`}
                          >
                            <Crosshair className="h-3 w-3" />
                          </Button>

                          {/* Browse category button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategorySearch("");
                              setExploringCategory(key);
                            }}
                            title="Browse nodes in this category"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>

                          {/* Visibility Toggle Switch */}
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleType(key)}
                            className="scale-75 origin-right ml-0.5"
                            aria-label={`Toggle ${item.label}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2">Workspace Graph Stats</h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Dataset Nodes</span>
                      <span className="font-mono text-foreground">{totalRawNodes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Connections</span>
                      <span className="font-mono text-foreground">{totalRawEdges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visible on Canvas</span>
                      <span className="font-mono text-emerald-400 font-medium">
                        {visibleNodeCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-xs space-y-1.5 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Side Panel Controls</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    • <strong>Toggle switches</strong> to show or hide any node category.
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    • <strong>Click category name or arrow</strong> to browse and jump to specific nodes.
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    • <strong>Crosshair icon</strong> spotlights all nodes of that type on canvas.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}