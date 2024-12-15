import { apiClient } from "@/lib/api";
import { useParams } from "react-router-dom";
import useSWRImmutable from "swr/immutable";

const api = apiClient.public.events;
const url = api.$url();
const fetcher = () => api.$get().then((e) => e.json());

export const useEvent = () => {
  const { data } = useSWRImmutable(url, fetcher);
  const eventId = useParams().eventId;
  const event = data?.find((event) => event.id === Number(eventId));
  return event;
};
