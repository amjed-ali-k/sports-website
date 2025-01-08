import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Zap } from "lucide-react";
import { Icon } from "@iconify-icon/react";
import { apiClient } from "@/lib/api";
import { InferRequestType } from "hono/client";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { useIndividualItem } from "@/hooks/use-item";
import { IconFromName } from "@/components/icon";
import useSWRImmutable from "swr/immutable";
import { useSection } from "@/hooks/use-section";
import { useEvent } from "@/hooks/use-event";

const Api = apiClient.public.participants.single[":id"];
const url = Api.$url();
const $get = Api.$get;
const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
  const res = await $get(arg);
  return await res.json();
};

const statsApi = apiClient.public.participants.stats[":id"];
const statusurl = statsApi.$url();
const status$get = statsApi.$get;
const statusfetcher =
  (arg: InferRequestType<typeof status$get>) => async () => {
    const res = await status$get(arg);
    return await res.json();
  };

export const SingleParticipantPage = () => {
  const participantId = useParams().participantId || "";

  const { data } = useSWRImmutable(
    [url, participantId],
    fetcher({
      param: {
        id: participantId,
      },
    })
  );

  const participant = data && "error" in data ? null : data || null;

  const { data: stats } = useSWR(
    statusurl,
    statusfetcher({
      param: {
        id: participantId,
      },
    })
  );

  const section = useSection(participant?.sectionId);

  const firstCount =
    stats?.filter((e) => e.results?.position === "first").length || 0;
  const secondCount =
    stats?.filter((e) => e.results?.position === "second").length || 0;
  const thirdCount =
    stats?.filter((e) => e.results?.position === "third").length || 0;

  const totalPoints =
    stats?.reduce((acc, e) => acc + (e.results?.points || 0), 0) || 0;
  return (
    <div>
      <div className="flex flex-col items-center py-4">
        <Avatar className="size-24">
          <AvatarImage src={participant?.avatar || ""} />
          <AvatarFallback>
            {participant?.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h4 className="text-2xl text-center font-bold">{participant?.name}</h4>
        <div className="text-sm items-center flex">
          <Icon
            icon={
              participant?.gender === "male"
                ? "material-symbols:male"
                : "material-symbols:female"
            }
            className={cn("text-base", {
              "text-blue-500": participant?.gender === "male",
              "text-pink-500": participant?.gender === "female",
            })}
          />
          {participant?.gender === "male" ? "Male" : "Female"}
        </div>
        {/* <div className="text-sm">
            {participant?.pointsFirst}/{participant?.pointsSecond}/
            {participant?.pointsThird} Points
          </div> */}
        <Badge variant="outline" className="gap-1.5 mt-2 capitalize">
          CHEST NO
          <span
            className={cn("size-1.5 rounded-full", "bg-amber-500")}
            aria-hidden="true"
          ></span>
          {participant?.chestNo}
        </Badge>
        <div className="text-center flex items-center gap-x-2 font-bold mt-4">
          {section?.name}{" "}
          <span
            className={cn("size-1.5 inline-block rounded-full bg-teal-500")}
            style={{
              backgroundColor: section?.color || "#14b8a6",
            }}
            // aria-hidden="true"
          />{" "}
          {participant?.batch}
        </div>
      </div>
      {totalPoints > 0 && (
        <div className="border-t text-center py-2">
          Scored total of {totalPoints} points in {stats?.length} items
        </div>
      )}
      <div className="flex border-t items-center justify-evenly">
        <div className="grow py-2 border-r px-4">
          <div className="text-4xl font-bold">{firstCount}</div>
          <div className="text-xs text-muted-foreground">First prizes</div>
        </div>
        <div className="grow py-2 border-r px-4">
          <div className="text-4xl font-bold">{secondCount}</div>
          <div className="text-xs text-muted-foreground">Second prizes</div>
        </div>
        <div className="grow py-2 border-r px-4">
          <div className="text-4xl font-bold">{thirdCount}</div>
          <div className="text-xs text-muted-foreground">Third prizes</div>
        </div>
      </div>
      <h4 className="py-2 text-xl border-y text-center font-bold">Items</h4>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            {/* <TableHead className="text-right">Points</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats?.map((d) => <Rows key={d.registrations.id} {...d} />)}
        </TableBody>
      </Table>
    </div>
  );
};

const Rows = ({
  registrations,
  results,
}: {
  registrations: {
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    status: "registered" | "participated" | "not_participated";
    itemId: number;
    participantId: number;
    metaInfo: string | null;
  };
  results: {
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    position: "first" | "second" | "third";
    points: number;
    itemId: number;
    registrationId: number;
  } | null;
}) => {
  const item = useIndividualItem(registrations.itemId)?.item;
  const navigate = useNavigate();
  const event = useEvent();
  return (
    <TableRow
      onClick={() => navigate(`/${event?.id}/items/${registrations.itemId}/individual`)}
      className={cn({
        "opacity-40": registrations.status === "not_participated",
        "bg-yellow-600/10": results?.position === "first",
        "bg-slate-700/10": results?.position === "second",
        "bg-teal-950/10": results?.position === "third",
      })}
    >
      <TableCell className="font-medium">
        <IconFromName
          name={item?.iconName}
          className="size-4 inline-block mr-1  "
        />
        <span className="mr-2">{item?.name}</span>
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
      <TableCell className="capitalize">{item?.status}</TableCell>
      <TableCell className="capitalize">{results?.position}</TableCell>
    </TableRow>
  );
};
