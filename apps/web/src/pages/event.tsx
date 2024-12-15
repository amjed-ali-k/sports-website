import { OverallScoreChart } from "@/components/charts/overall-score-chart";
import { LinkMenu } from "@/components/menu";
import { useEvent } from "@/hooks/use-event";
import { useAllSections, useSection } from "@/hooks/use-section";
import { apiClient } from "@/lib/api";
import { Badge } from "@sports/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sports/ui";
import { InferRequestType } from "hono/client";
import useSWR from "swr";

const api = apiClient.public.events[":eventId"].results;
const url = api.$url();
const $get = api.$get;
const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
  const res = await $get(arg);
  return await res.json();
};

const useResult = () => {
  const event = useEvent();
  const { data } = useSWR(
    [url, event?.id],
    fetcher({
      param: {
        eventId: event?.id.toString() ?? "1",
      },
    })
  );
  return data;
};

export const EventPage = () => {
  const sections = useAllSections();
  return (
    <div>
      <LinkMenu />
      <ChartSection />
      {sections?.map((section) => (
        <SectionScore key={section.id} id={section.id} />
      ))}
      <div>
        <Top5 />
      </div>
    </div>
  );
};

const ChartSection = () => {
  const results = useResult();
  const top = results?.results?.sort(
    (a, b) => b.totalPoints - a.totalPoints
  )?.[0];
  const section = useSection(top?.sectionId);
  return (
    <div className="flex overflow-hidden items-center border-b max-h-96">
      {results && results?.results.length > 0 ? (
        <>
          <div className="w-1/2 h-fit grow border-r">
            <OverallScoreChart
              chartData={
                results?.results.map((k) => ({
                  section: k.sectionId?.toString() || "",
                  group: k.group.points,
                  individual: k.individual.points,
                })) || []
              }
            />
          </div>
          {top && (
            <div className="h-full  flex items-center flex-col justify-center p-4">
              <div className="text-4xl font-bold">{top?.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points</div>
              <div className="text-sm text-center">{section?.name}</div>

              <Badge variant="outline" className="gap-1.5 animate-pulse">
                <span
                  className="size-1.5 rounded-full bg-amber-500"
                  aria-hidden="true"
                ></span>
                {top && top?.totalPoints > 0
                  ? "Leading"
                  : "Waiting for updates"}
              </Badge>
            </div>
          )}
        </>
      ) : <div className="h-40 w-full flex items-center justify-center">
        <div className="text-center font-bold mt-4">No Results Published yet!</div></div>}
    </div>
  );
};
const SectionScore = ({ id }: { id: number }) => {
  const results = useResult();
  const section = useSection(id);
  const result = results?.results.find((result) => result.sectionId === id);
  return (
    <div
      style={{
        borderLeftColor: section?.color || "",
      }}
      className="grid grid-cols-6 items-center py-2 border-b border-l-4 "
    >
      <div className="col-span-3 px-4 font-bold">{section?.name}</div>
      <div className="text-xs col-span-2">
        {result ? result?.individual.first + result?.group.first : "0"} First
        Prizes
        <br />
        {result
          ? result?.individual.second + result?.group.second
          : "0"} Second Prizes <br />
        {result ? result?.individual.third + result?.group.third : "0"} Third
        Prizes
      </div>
      <div className=" text-center">
        <div className="font-extrabold text-3xl">
          {result?.totalPoints || "0"}
        </div>
        <span className="text-xs block leading-3">Points</span>
      </div>
    </div>
  );
};

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
