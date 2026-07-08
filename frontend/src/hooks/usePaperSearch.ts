import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Paper } from "@/types";

interface UsePaperSearchParams {
  q?: string;
  workspace_id?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  year_min?: number;
  year_max?: number;
  venue?: string;
}

export function usePaperSearch(params: UsePaperSearchParams) {
  return useQuery({
    queryKey: ["papers", params],
    queryFn: () => apiGet<Paper[]>("/papers", params),
    enabled: !!params.workspace_id || !!params.q,
  });
}

export function usePaper(paperId: string) {
  return useQuery({
    queryKey: ["paper", paperId],
    queryFn: () => apiGet<Paper>(`/papers/${paperId}`),
    enabled: !!paperId,
  });
}

export function useSimilarPapers(paperId: string) {
  return useQuery({
    queryKey: ["similar-papers", paperId],
    queryFn: () => apiGet<Paper[]>(`/papers/${paperId}/similar`),
    enabled: !!paperId,
  });
}
