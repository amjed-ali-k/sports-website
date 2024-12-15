"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@sports/ui";


const chartData = [
  { section: "Electronics", individual: 186, group: 80 },
  { section: "Mechanical", individual: 305, group: 200 },
  { section: "Civil", individual: 237, group: 120 },
  { section: "Electrical", individual: 73, group: 190 },
];

const chartConfig = {
  individual: {
    label: "Individual",
    color: "hsl(var(--chart-1))",
  },
  group: {
    label: "Group",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function OverallScoreChart({chartData}: {chartData: {
  section: string;
  individual: number;
  group: number;
}[]}) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="section"
          tickLine={false}
          
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="individual" fill="var(--color-individual)" radius={4} />
        <Bar dataKey="group" fill="var(--color-group)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
