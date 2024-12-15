import { LinkMenu } from "@/components/menu";
import { apiClient } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@sports/ui";
import { InferRequestType } from "hono/client";
import { useState } from "react";
import useSWR from "swr";
import { Icon } from "@iconify-icon/react";
import { cn } from "@/lib/utils";

const api = apiClient.public.participants;
const url = api.$url();
const $get = api.$get;
const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
  const res = await $get(arg);
  return await res.json();
};

export const ParticipantsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isLoading } = useSWR(
    [url, pageNumber],
    fetcher({
      query: {
        limit: "10",
        page: pageNumber.toString(),
      },
    })
  );

  const canNextPage = data && data?.total / 20 > pageNumber - 1;
  const participants = data?.participants;
  return (
    <div>
      <LinkMenu />
      <h4 className="text-lg text-center font-bold mt-2">Participants List</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Section</TableHead>
            {/* <TableHead className="text-right">Points</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants?.map((e) => (
            <TableRow>
              <TableCell className="font-medium">
                <Icon
                  icon={
                    e.gender === "male"
                      ? "material-symbols:male"
                      : "material-symbols:female"
                  }
                  className={cn("mr-1", {
                    "text-blue-500": e.gender === "male",
                    "text-pink-500": e.gender === "female",
                  })}
                />
                <span className="mr-2">{e.name}</span>
              </TableCell>
              <TableCell>{e.batch}</TableCell>
              <TableCell>{e.section.name}</TableCell>
            </TableRow>
          ))}
          {participants?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination className="w-fit mr-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                !isLoading && pageNumber > 1 && setPageNumber(pageNumber - 1)
              }
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink>{data?.page}</PaginationLink>
          </PaginationItem>
          {/* <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem> */}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                !isLoading && canNextPage && setPageNumber(pageNumber + 1)
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
