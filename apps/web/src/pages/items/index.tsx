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
import { Link, useNavigate } from "react-router-dom";

export const ItemsPage = () => {
  const navigate = useNavigate();

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
      <h4 className="text-lg text-center font-bold mt-2">Programs List</h4>
      <Table>
        <TableCaption>All item/programs list.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow onClick={() => navigate("24")}>
            <TableCell className="font-medium">100 M Run</TableCell>
            <TableCell>Not started</TableCell>
            <TableCell>25</TableCell>
            <TableCell className="text-right">5/3/1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
