import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Sprout, Zap } from "lucide-react";
import { Icon } from "@iconify-icon/react";
import { apiClient } from "@/lib/api";
import { InferRequestType } from "hono/client";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { useSection } from "@/hooks/use-section";
import { useGroupItem } from "@/hooks/use-item";

const Api = apiClient.public.items.participants.group[":itemId"];
const url = Api.$url();
const $get = Api.$get;
const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
  const res = await $get(arg);
  return await res.json();
};

export const GroupItemPage = () => {
  const itemId = useParams().itemId || "";

  const { data } = useSWR(
    url,
    fetcher({
      param: {
        itemId,
      },
    })
  );

  const item = useGroupItem(itemId);
  return (
    <div>
      <div className="flex flex-col items-center py-4">
        <Sprout className="size-12" />
        <h4 className="text-2xl text-center font-bold">{item?.item.name}</h4>
        <div className="text-sm items-center flex">
        <Icon
            icon={
              item?.item.gender === "male"
                ? "material-symbols:male"
                : "material-symbols:female"
            }
            className={cn("text-base", {
              "text-blue-500": item?.item.gender === "male",
              "text-pink-500": item?.item.gender === "female",
            })}
          />
          {item?.item.gender === "male" ? "Male" : "Female"}
        </div>
        <div className="text-sm">
          {item?.item.pointsFirst}/{item?.item.pointsSecond}/
          {item?.item.pointsThird} Points
        </div>
        <Badge variant="outline" className="gap-1.5 mt-2 capitalize">
          <span
            className={cn("size-1.5 rounded-full", {
              "bg-amber-500": item?.item.status === "on-going",
              "bg-green-500": item?.item.status === "finished",
              "bg-slate-500": item?.item.status === "scheduled",
            })}
            aria-hidden="true"
          ></span>
          {item?.item.status}
        </Badge>
      </div>
      <Table>
        <TableCaption>Registered pratricipants of this item.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Name</TableHead>
            {/* <TableHead>Batch</TableHead> */}
            <TableHead>Section</TableHead>
            {/* <TableHead className="text-right">Points</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((d) => <Rows key={d.group_registrations.id} {...d} />)}
        </TableBody>
      </Table>
    </div>
  );
};

const Rows = ({
  group_registrations: registrations,
  group_results: results,
}: {
  group_registrations: {
    id: number;
    name: string | null;
    createdAt: string;
    sectionId: number | null;
    groupItemId: number;
    participantIds: string;
  };
  group_results: {
    id: number;
    createdAt: string;
    groupItemId: number;
    groupRegistrationId: number;
    position: "first" | "second" | "third";
    points: number;
  };
}) => {
  const section = useSection(registrations.sectionId);
  const participantIds = JSON.parse(registrations.participantIds) as number[];
  return (
    <>
      <TableRow
        className={cn({
          "bg-yellow-600": results?.position === "first",
          "bg-slate-700": results?.position === "second",
          "bg-teal-950": results?.position === "third",
        })}
      >
        <TableCell className="font-medium">
          <span className="mr-2">{registrations.name}</span>
          {results?.position && (
            <Badge className="gap-1 capitalize">
              <Zap
                className="-ms-0.5  opacity-60"
                size={12}
                strokeWidth={2}
                aria-hidden="true"
              />
              {results?.position}
            </Badge>
          )}
        </TableCell>
        <TableCell>{section?.name} ({participantIds.length})</TableCell>
      </TableRow>
    </>
  );
};
