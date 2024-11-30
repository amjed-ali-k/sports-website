import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { Participant, Section } from '@/types/participant';

interface ParticipantListProps {
  participants: Participant[];
  sections: Section[];
}

export function ParticipantList({ participants, sections }: ParticipantListProps) {
  const getSectionName = (sectionId: number) => {
    return sections.find(s => s.id === sectionId)?.name || 'Unknown';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Chest No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Section</TableHead>
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
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>
                    {participant.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{participant.chestNo}</TableCell>
              <TableCell>{participant.fullName}</TableCell>
              <TableCell>{getSectionName(participant.sectionId)}</TableCell>
              <TableCell>{participant.semester}</TableCell>
              <TableCell className="capitalize">{participant.gender}</TableCell>
              <TableCell>{formatDate(participant.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}