import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";



export const useSection = (id?: number | string | null) => {
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  const section = sections.find((section) => section.id === Number(id));
  return section;
};
