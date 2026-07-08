import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Note } from "@/types";

export function useWorkspaceNotes(workspaceId: string) {
  return useQuery({
    queryKey: ["notes", workspaceId],
    queryFn: () => apiGet<Note[]>(`/notes/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspace_id: string; title: string; content: string }) =>
      apiPost<Note>("/notes", data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["notes", vars.workspace_id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspace_id: string; note_id: string }) =>
      apiDelete(`/notes/${data.workspace_id}/${data.note_id}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["notes", vars.workspace_id] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspace_id: string; note_id: string; title?: string; content?: string }) =>
      apiPatch<Note>(`/notes/${data.workspace_id}/${data.note_id}`, {
        ...(data.title && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["notes", vars.workspace_id] });
    },
  });
}
