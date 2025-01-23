"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartStyle } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const chartData = [
  { criterion: "area", points: 30, fill: "var(--color-area)" },
  { criterion: "technologies", points: 30, fill: "var(--color-technologies)" },
  { criterion: "studies", points: 30, fill: "var(--color-studies)" },
  { criterion: "location", points: 10, fill: "var(--color-location)" },
];

const chartConfig = {
  points: {
    label: "Pontos",
  },
  area: {
    label: "Area",
    color: "hsl(var(--chart-1))",
  },
  technologies: {
    label: "Tecnologias",
    color: "hsl(var(--chart-2))",
  },
  studies: {
    label: "Estudos",
    color: "hsl(var(--chart-3))",
  },
  location: {
    label: "Localização",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function JobMatchChart() {
  const id = "pie-interactive";
  const [activeCriterion, setActiveCriterion] = React.useState(
    chartData[0].criterion
  );

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.criterion === activeCriterion),
    [activeCriterion]
  );
  const months = React.useMemo(
    () => chartData.map((item) => item.criterion),
    []
  );

  return (
    <Card data-chart={id} className="flex flex-col h-max gap-4">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-row items-start space-y-0 pb-0 gap-4">
        <div className="grid gap-1">
          <CardTitle>Match</CardTitle>
          <CardDescription>
            Acompanhe a pontuação de cada critério para seu match de vagas.
          </CardDescription>
        </div>
        <Select value={activeCriterion} onValueChange={setActiveCriterion}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="points"
              nameKey="criterion"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
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
                          {chartData[activeIndex].points.toLocaleString()}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Match
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
