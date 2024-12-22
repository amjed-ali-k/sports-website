import { apiClient } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

export const useIndividualItem = (id?: number | string | null) => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.getItems(),
  });
  if (!id) return null;
  const selectedItem = items?.find((item) => item.item.id === Number(id))?.item;
  return {...selectedItem, isLoading };
};
