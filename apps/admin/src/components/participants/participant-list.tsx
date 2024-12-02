import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@sports/ui";
import { formatDate } from "@/lib/utils";

import type { Participant } from "@sports/api";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { EmptyState } from "../empty-state";
import { Users } from "lucide-react";

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Chest No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={participant.avatar || ""} />
                  <AvatarFallback>
                    {participant.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{participant.chestNo}</TableCell>
              <TableCell>{participant.fullName}</TableCell>
              <TableCell>
                {participant.sectionId && getSectionName(participant.sectionId)}
              </TableCell>
              <TableCell>{participant.batch}</TableCell>
              <TableCell className="capitalize">{participant.gender}</TableCell>
              <TableCell>
                {participant.createdAt && formatDate(participant.createdAt)}
              </TableCell>
            </TableRow>
          ))}

          {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-96">
                  <EmptyState
                    icon={Users}
                    title="No participants found"
                    description="Get started by creating your first participant."
                  />
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>
    </div>
  );
}
