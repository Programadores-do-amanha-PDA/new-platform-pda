"use client";

import { Laptop } from "lucide-react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--muted))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--muted))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--muted))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

export function TeamsIconWithModulesChart() {
  return (
    <Card className="flex flex-col w-max !p-6 gap-4 cursor-pointer">
      <CardContent className="flex-1 w-full !p-0 relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[160px] h-[160px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              startAngle={90}
              endAngle={450}
              outerRadius={70}
              cornerRadius={65}
              paddingAngle={5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </PieChart>
        </ChartContainer>
        <Laptop className="absolute inset-x-0 inset-y-0 mx-auto my-auto size-14" />
      </CardContent>
      <CardFooter className="flex-col gap-2 !p-0">
        <CardTitle className="text-lg !font-bold">Turma 7</CardTitle>
      </CardFooter>
    </Card>
  );
}
