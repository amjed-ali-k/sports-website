import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useIndividualItem } from "./use-item";

export const useRegistrations = () => {
  const { itemId } = useParams();
  const currentItem = useIndividualItem(itemId);
  const { data: registrations = [], isLoading: registrationsLoading } =
    useQuery({
      queryKey: ["registrations-item", itemId],
      queryFn: () =>
        itemId ? apiClient.getRegistrationsForItem(itemId) : null,
    });
  const isLoading = currentItem?.isLoading || registrationsLoading;

  return { registrations, isLoading };
};
