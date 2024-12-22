import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useResults = () => {
  const { data: results, isLoading } = useQuery({
    queryKey: ["results"],
    queryFn: () => apiClient.getResults(),
  });
  return { results, isLoading };
};

export const useResultsForItem = (itemId: number) => {
  const { results } = useResults();
  return results?.filter((result) => result.result.itemId === itemId);
};
