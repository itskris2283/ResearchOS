import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { Roadmap } from "@/types";

export function useRoadmap(workspaceId: string) {
  return useQuery({
    queryKey: ["roadmap", workspaceId],
    queryFn: () => apiGet<Roadmap>(`/roadmap/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useGenerateRoadmap() {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      apiPost<Roadmap>(`/roadmap/${workspaceId}/generate`),
  });
}
