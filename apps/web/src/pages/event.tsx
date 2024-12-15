import { OverallScoreChart } from "@/components/charts/overall-score-chart";
import { LinkMenu } from "@/components/menu";
import { Badge } from "@sports/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
export const EventPage = () => {
  return (
    <div>
      <LinkMenu />
      <div className="flex overflow-hidden items-center border-b max-h-96">
        <div className="w-1/2 h-fit grow border-r">
          <OverallScoreChart />
        </div>
        <div className="h-full  flex items-center flex-col justify-center p-4">
          <div className="text-4xl font-bold">230</div>
          <div className="text-sm text-muted-foreground">Points</div>
          <div className="text-sm text-center">Electronics Engineering</div>

          <Badge variant="outline" className="gap-1.5 animate-pulse">
            <span
              className="size-1.5 rounded-full bg-amber-500"
              aria-hidden="true"
            ></span>
            Leading
          </Badge>
        </div>
      </div>
      <SectionScore />
      <SectionScore />
      <SectionScore />
      <SectionScore />
      <div>
        <Top5 />
      </div>
    </div>
  );
};

const SectionScore = () => (
  <div className="grid grid-cols-6 items-center py-2 border-b border-l-4 border-l-amber-600">
    <div className="col-span-3 px-4 font-bold">Electronics Engineering</div>
    <div className="text-xs col-span-2">
      3 First Prizes
      <br />
      4 Second Prizes <br />4 Third Prizes
    </div>
    <div className=" text-center">
      <div className="font-extrabold text-3xl">230</div>
      <span className="text-xs block leading-3">Points</span>
    </div>
  </div>
);

const Top5 = () => {
  return (
    <div>
      <div className="text-center font-bold mt-4">TOP 5 Participants</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Section</TableHead>
            <TableHead className="">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              <span className="mr-2">Amjed Ali</span>
            </TableCell>
            <TableCell>EL2025</TableCell>
            <TableCell>Electronics Engineering</TableCell>
            <TableCell>32</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Arshad</TableCell>
            <TableCell>EL2025</TableCell>
            <TableCell>Electronics Engineering</TableCell>
            <TableCell>21</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Fayyas</TableCell>
            <TableCell>EL2025</TableCell>
            <TableCell>Electronics Engineering</TableCell>
            <TableCell>5</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
