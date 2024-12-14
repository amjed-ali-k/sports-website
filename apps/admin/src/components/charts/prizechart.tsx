"use client";

import { Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@sports/ui";

const chartConfig = {
  points: {
    label: "Points",
  },
  first: {
    label: "First",
    color: "hsl(var(--chart-1))",
  },
  second: {
    label: "Second",
    color: "hsl(var(--chart-2))",
  },
  third: {
    label: "Third",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function PrizeChart({
  data,
}: {
  data: {
    points: number;
    first: number;
    second: number;
    third: number;
  };
}) {
  const cData = [
    {
      name: "First",
      value: data.first,
      fill: "hsl(var(--chart-4))",
    },
    {
      name: "Second",
      value: data.second,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Third",
      value: data.third,
      fill: "hsl(var(--chart-3))",
    },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={cData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {data.points.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Points
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
