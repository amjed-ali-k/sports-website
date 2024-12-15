import { LinkMenu } from "@/components/menu";
import {
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export const ParticipantsPage = () => {
  return (
    <div>
      <div className="border-b w-full py-2 px-4 flex items-center">
        <Button variant={"ghost"}>
          <Home />
        </Button>
        <div></div>
        <div className="ml-auto font-bold">Sports Fest 2024</div>
      </div>
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
