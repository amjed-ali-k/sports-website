import { OverallScoreChart } from "@/components/charts/overall-score-chart";
import { LinkMenu } from "@/components/menu";
import { Badge, Button } from "@sports/ui";
import { Home } from "lucide-react";

export const EventPage = () => {
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

      <div className="flex overflow-hidden items-center border-b max-h-96">
        <div className="w-1/2 h-fit grow border-r">
          <OverallScoreChart />
        </div>
        <div className="h-full  flex items-center flex-col justify-center p-4">
          <div className="text-4xl font-bold">230</div>
          <div className="text-sm text-muted-foreground">Points</div>
          <div>Electronics Engineering</div>

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
