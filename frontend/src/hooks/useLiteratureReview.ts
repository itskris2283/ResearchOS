import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { LiteratureReview } from "@/types";

export function useLiteratureReview(workspaceId: string) {
  return useQuery({
    queryKey: ["literature-review", workspaceId],
    queryFn: () => apiGet<LiteratureReview>(`/review/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useGenerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) =>
      apiPost<LiteratureReview>(`/review/${workspaceId}/generate`),
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ["literature-review", workspaceId] });
    },
  });
}
