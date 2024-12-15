import { apiClient } from "@/lib/api";
import useSWRImmutable from "swr/immutable";

const api = apiClient.public.sections;
const url = api.$url();
const fetcher = () => api.$get().then((e) => e.json());

export const useSection = (id?: number | string | null) => {
    
  const { data } = useSWRImmutable(url, fetcher);
  if(!id) return;
  const section = data?.find((section) => section.id === Number(id));
  return section;
};


export const useAllSections = () => {
  const { data } = useSWRImmutable(url, fetcher);
  return data;
};