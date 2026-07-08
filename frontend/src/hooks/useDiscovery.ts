import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import type { Paper } from "@/types";

export function useDiscoverySearch() {
  return useMutation({
    mutationFn: (data: { topic: string; limit?: number }) =>
      apiPost<Paper[]>("/discovery/search", data),
  });
}
