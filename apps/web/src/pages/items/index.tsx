import { LinkMenu } from "@/components/menu";
import { useEvent } from "@/hooks/use-event";
import { apiClient } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { InferRequestType } from "hono/client";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { Icon } from "@iconify-icon/react";
import { cn } from "@/lib/utils";

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
export const ItemsPage = () => {
  const navigate = useNavigate();
  const event = useEvent();
  const { data: individualItems } = useSWR(
    [individualurl, event?.id],
    individualfetcher({
      param: {
        eventId: event?.id.toString() ?? "1",
      },
    })
  );

  const { data: groupItems } = useSWR(
    [groupurl, event?.id],
    groupfetcher({
      param: {
        eventId: event?.id.toString() ?? "1",
      },
    })
  );

  return (
    <div>
      <LinkMenu />
      <h4 className="text-lg text-center font-bold mt-2">
        Individual Programs List
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {individualItems?.map(({ item, registrationCount }) => (
            <TableRow onClick={() => navigate(`${item.id}/individual`)}>
              <TableCell className="font-medium min-w-[200px]">
                <Icon
                  icon={
                    item.gender === "male"
                      ? "material-symbols:male"
                      : "material-symbols:female"
                  }
                  className={cn("mr-1", {
                    "text-blue-500": item.gender === "male",
                    "text-pink-500": item.gender === "female",
                  })}
                />
                <span>{item.name}</span>
              </TableCell>
              <TableCell className="capitalize text-xs">{item.status}</TableCell>
              <TableCell>{registrationCount}</TableCell>
              <TableCell className="text-right">
                {item.pointsFirst}/{item.pointsSecond}/{item.pointsThird}
              </TableCell>
            </TableRow>
          ))}
          {individualItems?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center border-b py-12">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <h4 className="text-lg text-center font-bold mt-2">
        Group Programs List
      </h4>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupItems?.map(({ item, registrationCount }) => (
            <TableRow onClick={() => navigate(`${item.id}/group`)}>
             <TableCell className="font-medium">
                <Icon
                  icon={
                    item.gender === "male"
                      ? "material-symbols:male"
                      : "material-symbols:female"
                  }
                  className={cn("mr-1", {
                    "text-blue-500": item.gender === "male",
                    "text-pink-500": item.gender === "female",
                  })}
                />
                <span>{item.name}</span>
              </TableCell>
              <TableCell className="capitalize text-xs">{item.status}</TableCell>
              <TableCell>{registrationCount}</TableCell>
              <TableCell className="text-right">
                {item.pointsFirst}/{item.pointsSecond}/{item.pointsThird}
              </TableCell>
            </TableRow>
          ))}
          {groupItems?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center border-b py-12">
                No items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};