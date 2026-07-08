import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Dataset } from "@/types";

export function useDatasets(workspaceId: string) {
  return useQuery({
    queryKey: ["datasets", workspaceId],
    queryFn: () => apiGet<Dataset[]>(`/datasets`, { workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });
}

export function useDatasetSearch(query: string) {
  return useQuery({
    queryKey: ["datasets", "search", query],
    queryFn: () => apiGet<Dataset[]>("/datasets", { q: query }),
    enabled: query.length > 1,
  });
}
