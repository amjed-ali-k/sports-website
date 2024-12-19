import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sports/ui";
import { apiClient } from "@/lib/api";
import { TrendingUp } from "lucide-react";
import { sift, unique } from "radash";
import { PrizeChart } from "@/components/charts/prizechart";

export const DashboardEventsSections = ({
  eventId,
  name,
}: {
  eventId: string;
  name: string;
}) => {
  const { data: results } = useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: () => apiClient.getEventResultStats(Number(eventId)),
  });

  const allSections = sift(
    unique(results?.results?.map((s) => s.sectionId) || [])
  );
  const getResultBySection = (sectionId: number) => {
    return (
      results?.results?.find((section) => section.sectionId === sectionId) || {
        totalPoints: 0,
        individual: {
          points: 0,
          first: 0,
          second: 0,
          third: 0,
        },
        group: {
          points: 0,
          first: 0,
          second: 0,
          third: 0,
        },
      }
    );
  };

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{name}</h1>
      <div className="flex flex-wrap gap-4">
        {allSections.map((sectionId: any) => {
          const section = sections.find((s) => s.id === sectionId);
          const r = getResultBySection(sectionId);
          const data = {
            points: r.totalPoints,
            first: r.individual.first + r.group.first,
            second: r.individual.second + r.group.second,
            third: r.individual.third + r.group.third,
          };
          return (
            <div className="flex gap-4 max-w-96" key={sectionId}>
              <Card
                className="flex flex-col border-t-4"
                style={{
                  borderTopColor: section?.color || "white",
                }}
              >
                <CardHeader className="items-center pb-0">
                  <CardTitle>{section?.name}</CardTitle>
                  <CardDescription>{section?.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <PrizeChart data={data} />
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 font-medium leading-none">
                    {r.individual.points} points on Individual Items
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 font-medium leading-none">
                    {r.group.points} points on Group Items
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {!allSections.length && (
        <div className="flex flex-col">
          <div className="items-center pb-0">
            <CardTitle>No results found</CardTitle>
          </div>
        </div>
      )}
    </div>
  );
};
