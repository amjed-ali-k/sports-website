import { OverallScoreChart } from "@/components/charts/overall-score-chart";
import { LinkMenu } from "@/components/menu";
import { SectionName } from "@/components/section-name";
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
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

const api = apiClient.public.envts[":eventId"].results;
const url = api.$url();
const $get = api.$get;
const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
  const res = await $get(arg);
  return await res.json();
};

const useResult = () => {
  const event = useEvent();
  const { data } = useSWR(
    event ? [url, event?.id] : null,
    fetcher({
      param: {
        eventId: event?.id.toString() ?? "1",
      },
    })
  );
  return data;
};

export const EventPage = () => {
  return (
    <div>
      <LinkMenu />
      <ChartSection />
      <SectionScoreList />
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
  const sections = useAllSections();
  return (
    <div className="flex overflow-hidden items-center border-b max-h-96">
      {results && results?.results.length > 0 ? (
        <>
          <div className="w-1/2 max-w-[400px] h-fit grow border-r">
            <OverallScoreChart
              chartData={
                results?.results.map((k) => ({
                  section:
                    sections?.find((s) => s.id === k.sectionId)?.slug ||
                    sections?.find((s) => s.id === k.sectionId)?.name ||
                    "Unknown",
                  group: k.group.points,
                  individual: k.individual.points,
                })) || []
              }
            />
          </div>
          {top && (
            <div className="h-full shrink grow flex items-center flex-col justify-center p-4">
              <div className="text-center">
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
            </div>
          )}
        </>
      ) : (
        <div className="h-40 w-full flex items-center justify-center">
          <div className="text-center font-bold mt-4">
            No Results Published yet!
          </div>
        </div>
      )}
    </div>
  );
};

const SectionScoreList = () => {
  const sections = useAllSections();
  const results = useResult();
  const props = sections?.map((section) => {
    const result = results?.results.find(
      (result) => result.sectionId === section.id
    );
    return {
      id: section.id,
      result,
    };
  });
  return props
    ?.sort(
      (a, b) => (b.result?.totalPoints || 0) - (a.result?.totalPoints || 0)
    )
    .map((prop) => <SectionScore key={prop.id} {...prop} />);
};

const SectionScore = ({
  id,
  result,
}: {
  id: number;
  result?: {
    sectionId: number | null;
    totalPoints: number;
    individual: {
      points: number;
      first: number;
      second: number;
      third: number;
    };
    group: {
      points: number;
      first: number;
      second: number;
      third: number;
    };
  };
}) => {
  const section = useSection(id);
  return (
    <div
      style={{
        borderLeftColor: section?.color || "",
      }}
      className="grid grid-cols-6 items-center py-2 border-b border-l-4 "
    >
      <div className="col-span-3 px-4 font-bold">
        <SectionName id={id} />
      </div>
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

const top5api = apiClient.public.participants.top[":eventId"][":count"];
const top5url = top5api.$url();
const top5$get = top5api.$get;
const top5fetcher = (arg: InferRequestType<typeof top5$get>) => async () => {
  const res = await top5$get(arg);
  return await res.json();
};

const Top5 = () => {
  const event = useEvent();
  const { data } = useSWR(
    event ? [top5url, event?.id] : null,
    top5fetcher({
      param: {
        eventId: event?.id.toString() ?? "1",
        count: "5",
      },
    })
  );
  const navigate = useNavigate();
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
          {data?.map((e) => (
            <TableRow
              onClick={() => navigate(`/${event?.id}/participants/${e.id}`)}
            >
              <TableCell className="font-medium">
                <span className="mr-2">{e.name}</span>
              </TableCell>
              <TableCell>{e.batch}</TableCell>
              <TableCell>
                <SectionName id={e.sectionId} />
              </TableCell>
              <TableCell>{e.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
