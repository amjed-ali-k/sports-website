import { LinkMenu } from "@/components/menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";

export const ParticipantsPage = () => {
  return (
    <div>
      <LinkMenu />
      <h4 className="text-lg text-center font-bold mt-2">Participants List</h4>
      <Table>
        <TableCaption>All Registered pratricipants.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Section</TableHead>
            {/* <TableHead className="text-right">Points</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              <span className="mr-2">Amjed Ali</span>
            </TableCell>
            <TableCell>EL2025</TableCell>
            <TableCell>Electronics Engineering</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Arshad</TableCell>
            <TableCell>EL2025</TableCell>
            <TableCell>Electronics Engineering</TableCell>
          </TableRow>
          <TableRow className="opacity-50">
            <TableCell className="font-medium">Fayyas</TableCell>
            <TableCell>EL2025</TableCell>
            <TableCell>Electronics Engineering</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
