"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartData } from "@/types/charts";
import { JobT } from "@/types/jobs";

const chartConfig = {
  value: {
    label: "% Match: ",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function JobMatchChart({
  jobsMatch,
}: {
  jobsMatch: {
    job: JobT;
    matchStatistics: {
      area: number;
      language: number;
      studies: number;
      local: number;
      total: number;
    };
  }[];
}) {
  const id = "job-match-radar-chart";
  function calculateAverage(
    jobs: typeof jobsMatch,
    key: keyof (typeof jobsMatch)[0]["matchStatistics"]
  ): number {
    if (jobs.length === 0) return 0;

    const total = jobs.reduce((acc, job) => acc + job.matchStatistics[key], 0);
    return Number((((total / jobs.length) * 100) / 4).toFixed());
  }

  const chartData: ChartData = [
    {
      label: "Tecnologias",
      value: calculateAverage(jobsMatch, "language"),
    },
    {
      label: "Areas",
      value: calculateAverage(jobsMatch, "area"),
    },
    {
      label: "Estudos",
      value: calculateAverage(jobsMatch, "studies"),
    },
    {
      label: "Localização",
      value: calculateAverage(jobsMatch, "local"),
    },
  ];

  return (
    <Card data-chart={id} className="flex flex-col h-max gap-4 bg-primary/15 border-primary">
      <CardHeader className="flex flex-row items-center justify-center space-y-0 gap-4">
        <CardTitle className="text-primary-foreground text-xl">Visão geral</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] max-w-[350px] w-full h-full"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="label" />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
