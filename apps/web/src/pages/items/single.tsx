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
import { Zap } from "lucide-react";
import { Icon } from "@iconify-icon/react";
import { apiClient } from "@/lib/api";
import { InferRequestType } from "hono/client";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { useIndividualItem } from "@/hooks/use-item";
import { IconFromName } from "@/components/icon";
import { SectionName } from "@/components/section-name";
import { useEvent } from "@/hooks/use-event";

const Api = apiClient.public.items.participants.individual[":itemId"];
const url = Api.$url();
const $get = Api.$get;
const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
  const res = await $get(arg);
  return await res.json();
};

export const SingleItemPage = () => {
  const itemId = useParams().itemId || "";

  const { data } = useSWR(
    url,
    fetcher({
      param: {
        itemId,
      },
    })
  );

  const item = useIndividualItem(itemId);

  return (
    <div>
      <div className="flex flex-col items-center py-4">
        <IconFromName name={item?.item.iconName} className="size-12" />
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
            <TableHead>Batch</TableHead>
            <TableHead>Section</TableHead>
            {/* <TableHead className="text-right">Points</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((d) => <Rows key={d.participants.id} {...d} />)}
        </TableBody>
      </Table>
    </div>
  );
};

const Rows = ({
  participants,
  registrations,
  results,
}: {
  participants: {
    id: number;
    avatar: string | null;
    chestNo: string;
    fullName: string;
    batch: string;
    gender: "male" | "female";
    sectionId: number;
  };
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
  const navigate = useNavigate();
  const event = useEvent();
  return (
    <TableRow
      className={cn({
        "opacity-40": registrations.status === "not_participated",
        "bg-yellow-600/30": results?.position === "first",
        "bg-slate-600/30": results?.position === "second",
        "bg-teal-600/30": results?.position === "third",
      })}
      onClick={() => navigate(`/${event?.id}/participants/${participants.id}`)}
    >
      <TableCell className="font-medium">
        <span className="mr-2">{participants.fullName}</span>
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
      <TableCell>{participants.batch}</TableCell>
      <TableCell>
        <SectionName id={participants.sectionId} />
      </TableCell>
    </TableRow>
  );
};
