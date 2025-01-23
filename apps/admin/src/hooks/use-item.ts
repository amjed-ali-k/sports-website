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



export const useGroupItem = (id?: number | string | null) => {
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const currentItem = items?.find((item) => item.id === Number(id));

  return {item: currentItem, currentItem, isLoading: itemsLoading };
};
