import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useDebounce } from "./useDebounce";

interface SearchParams {
  q: string;
  type?: string;
  limit?: number;
}

export function useGlobalSearch(params: SearchParams) {
  const debouncedQuery = useDebounce(params.q, 300);

  return useQuery({
    queryKey: ["global-search", debouncedQuery, params.type],
    queryFn: () => apiGet<any>("/search", { q: debouncedQuery, type: params.type, limit: params.limit }),
    enabled: debouncedQuery.length > 1,
  });
}

export function useSearchSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => apiGet<string[]>("/search/suggestions", { q: debouncedQuery }),
    enabled: debouncedQuery.length > 1,
  });
}
