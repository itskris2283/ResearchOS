import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { TimelineEvent } from "@/types";

export function useTimeline(workspaceId: string) {
  return useQuery({
    queryKey: ["timeline", workspaceId],
    queryFn: () => apiGet<TimelineEvent[]>(`/timeline/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useRegenerateTimeline() {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      apiPost<TimelineEvent[]>(`/timeline/${workspaceId}/regenerate`),
  });
}
