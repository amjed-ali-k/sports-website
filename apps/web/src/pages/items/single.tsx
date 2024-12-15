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
import { Sprout, Zap } from "lucide-react";
import { Icon } from "@iconify-icon/react";

export const SingleItemPage = () => {
  return (
    <div>
    
      <div className="flex flex-col items-center py-4">
        <Sprout className="size-12" />
        <h4 className="text-2xl text-center font-bold">100M Run</h4>
        <div className="text-sm items-center flex">
          <Icon icon="material-symbols:male" className="text-base" />
          Male
        </div>
        <div className="text-sm">5/3/2 Points</div>
        <Badge variant="outline" className="gap-1.5 mt-2">
          <span
            className="size-1.5 rounded-full bg-amber-500"
            aria-hidden="true"
          ></span>
          Ongoing
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
          <TableRow>
            <TableCell className="font-medium">
                <span className="mr-2">

              Amjed Ali
                </span>
              <Badge className="gap-1">
                <Zap
                  className="-ms-0.5 opacity-60"
                  size={12}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                First
              </Badge>
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
