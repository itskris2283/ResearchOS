import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { Bookmark } from "@/types";

export function useBookmarks(userId: string) {
  return useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: () => apiGet<Bookmark[]>("/bookmarks", { user_id: userId }),
    enabled: !!userId,
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id: string; entity_type: string; entity_id: string }) =>
      apiPost<Bookmark>("/bookmarks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
