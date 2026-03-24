import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { tagsQueries } from "@/features/inbox/api/tags.queries"

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: tagsQueries.list,
  })
}
