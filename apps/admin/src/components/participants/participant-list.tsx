import { Avatar, AvatarFallback, AvatarImage, Button } from "@sports/ui";
import { formatDate } from "@/lib/utils";
import { DataTable, DataTableColumnHeader } from "@sports/ui";

import type { Participant } from "@sports/api";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { apiClient } from "@/lib/api";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";

interface ParticipantListProps {
  participants: Participant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  const getSectionName = (sectionId: number) => {
    return sections.find((s) => s.id === sectionId)?.name || "Unknown";
  };

  const columns = useMemo<ColumnDef<(typeof participants)[0]>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-x-2 ">
            <Avatar>
              <AvatarImage src={row.original.avatar || ""} />
              <AvatarFallback>
                {row.original.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{row.original.fullName}</p>
          </div>
        ),
      },
      {
        accessorKey: "no",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID No" />
        ),
      },
      {
        accessorKey: "chestNo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Chest No" />
        ),
      },
      {
        accessorKey: "batch",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Batch" />
        ),
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Gender" />
        ),
      },
      {
        accessorKey: "sectionId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Section" />
        ),
        cell: ({ row }) => getSectionName(row.original.sectionId),
      },
      {
        accessorKey: "createdAt",
        cell: ({ row }) =>
          row.original.createdAt ? formatDate(row.original.createdAt) : "-",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created at" />
        ),
      },
      {
        accessorKey: "id",
        cell: ({ row }) => (
          <Button size="icon" variant="ghost" asChild>
            <Link to={`edit/${row.original.id}`}>
              <Edit className="size-4" />
            </Link>
          </Button>
        ),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
        ),
      },
    ],
    [sections]
  );

  return (
    <div className="">
      <DataTable filterPlaceholder="Search Participants" columns={columns} data={participants} />
    </div>
  );
}
