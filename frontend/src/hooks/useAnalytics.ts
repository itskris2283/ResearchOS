import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { AnalyticsData } from "@/types";

export function useAnalytics(workspaceId: string) {
  return useQuery({
    queryKey: ["analytics", workspaceId],
    queryFn: () => apiGet<AnalyticsData>(`/analytics/${workspaceId}`),
    enabled: !!workspaceId,
  });
}
