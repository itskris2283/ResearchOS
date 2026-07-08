import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { GraphData } from "@/types";

export function useCitationGraph(workspaceId: string) {
  return useQuery({
    queryKey: ["graph", "citation", workspaceId],
    queryFn: () => apiGet<GraphData>(`/graph/${workspaceId}/citation`),
    enabled: !!workspaceId,
  });
}

export function useKnowledgeGraph(workspaceId: string) {
  return useQuery({
    queryKey: ["graph", "knowledge", workspaceId],
    queryFn: () => apiGet<GraphData>(`/graph/${workspaceId}/knowledge`),
    enabled: !!workspaceId,
  });
}

export function useConceptGraph(workspaceId: string) {
  return useQuery({
    queryKey: ["graph", "concept", workspaceId],
    queryFn: () => apiGet<GraphData>(`/graph/${workspaceId}/concept`),
    enabled: !!workspaceId,
  });
}

export function useGraph(workspaceId: string, graphType: string) {
  return useQuery({
    queryKey: ["graph", graphType, workspaceId],
    queryFn: () => apiGet<GraphData>(`/graph/${workspaceId}/${graphType}`),
    enabled: !!workspaceId && !!graphType,
  });
}
