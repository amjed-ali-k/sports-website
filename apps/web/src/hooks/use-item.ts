import { apiClient } from "@/lib/api";
import { InferRequestType } from "hono/client";
import useSWRImmutable from "swr/immutable";
import { useEvent } from "./use-event";

const individualApi = apiClient.public.items.all.individual[":eventId"];
const individualurl = individualApi.$url();
const individual$get = individualApi.$get;
const individualfetcher =
  (arg: InferRequestType<typeof individual$get>) => async () => {
    const res = await individual$get(arg);
    return await res.json();
  };

const groupApi = apiClient.public.items.all.group[":eventId"];
const groupurl = groupApi.$url();
const group$get = groupApi.$get;
const groupfetcher = (arg: InferRequestType<typeof group$get>) => async () => {
  const res = await group$get(arg);
  return await res.json();
};
export const useIndividualItem = (id?: number | string | null) => {
  const event = useEvent();
  const { data } = useSWRImmutable(
    [individualurl, event?.id],
    individualfetcher({
      param: {
        eventId: (event?.id || 1).toString(),
      },
    })
  );
  if (!id) return;
  const item = data?.find((i) => i.item.id === Number(id));
  return item;
};

export const useGroupItem = (id?: number | string | null) => {
  const event = useEvent();

  const { data } = useSWRImmutable(
    [groupurl, event?.id],
    groupfetcher({
      param: {
        eventId: (event?.id || 1).toString(),
      },
    })
  );
  if (!id) return;
  const item = data?.find((i) => i.item.id === Number(id));
  return item;
};
