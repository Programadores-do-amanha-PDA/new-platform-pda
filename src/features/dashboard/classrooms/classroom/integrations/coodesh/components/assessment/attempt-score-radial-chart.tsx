"use client";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ChartDataT } from "@/types";

const chartConfig = {
  score: {
    label: "Pontuação",
  },
  primary: {
    label: "Pontuação",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AttemptScoreRadialChart({
  chartData,
}: {
  chartData: ChartDataT[];
}) {
  // Garante que o valor esteja entre 0 e 100
  const normalizedValue = Math.min(Math.max(chartData[0].value, 0), 100);

  // Ajusta o ângulo final proporcionalmente ao valor (0-100 -> 0-360°)
  const endAngle = (normalizedValue / 100) * 360;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square w-full max-h-[150px]"
    >
      <RadialBarChart
        data={[{ ...chartData[0], value: normalizedValue }]}
        startAngle={0}
        endAngle={endAngle}
        outerRadius={80}
        innerRadius={50}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[60, 40]}
        />
        <RadialBar dataKey="value" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) - 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 5}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {normalizedValue.toLocaleString()}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 15}
                      className="fill-muted-foreground"
                    >
                      {chartData[0].label}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
