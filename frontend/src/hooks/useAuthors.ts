import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Author } from "@/types";

export function useAuthors(workspaceId: string) {
  return useQuery({
    queryKey: ["authors", workspaceId],
    queryFn: () => apiGet<Author[]>(`/authors`, { workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });
}

export function useAuthorSearch(query: string) {
  return useQuery({
    queryKey: ["authors", "search", query],
    queryFn: () => apiGet<Author[]>("/authors", { q: query }),
    enabled: query.length > 1,
  });
}
