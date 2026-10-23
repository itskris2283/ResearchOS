import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Workspace } from "@/types";

export function useWorkspaces(userId: string) {
  return useQuery({
    queryKey: ["workspaces", userId],
    queryFn: () => apiGet<Workspace[]>("/workspaces", { user_id: userId }),
    enabled: !!userId,
  });
}

export function useWorkspaceDetail(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => apiGet<Workspace>(`/workspaces/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id: string; topic: string; title: string }) =>
      apiPost<Workspace>("/workspaces", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => apiDelete(`/workspaces/${workspaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useWorkspaceProgress(workspaceId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["workspace-progress", workspaceId],
    queryFn: () => apiGet<{ stage: string; progress: number }>(`/workspaces/${workspaceId}/progress`),
    enabled: enabled && !!workspaceId,
    refetchInterval: 3000,
    refetchOnWindowFocus: false,
  });
}
