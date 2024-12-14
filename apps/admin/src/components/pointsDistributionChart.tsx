import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sports/ui"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@sports/ui"
import { BarChart, Bar } from "recharts"

type ChartData = {
    name: string
    Total: number
    Individual: number
    Group: number
  }
  
  type PointsDistributionChartProps = {
    data: ChartData[]
  }
  
  export function PointsDistributionChart({ data }: PointsDistributionChartProps) {
    if (!data || data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution by Section</CardTitle>
            <CardDescription>No data available</CardDescription>
          </CardHeader>
        </Card>
      )
    }
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Distribution by Section</CardTitle>
          <CardDescription>Total, Individual, and Group points for each section</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              Total: {
                label: "Total Points",
                color: "hsl(var(--chart-1))",
              },
              Individual: {
                label: "Individual Points",
                color: "hsl(var(--chart-2))",
              },
              Group: {
                label: "Group Points",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <BarChart
              data={data}
              accessibilityLayer
            >
              <Bar dataKey="Total" />
              <Bar dataKey="Individual" />
              <Bar dataKey="Group" />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }