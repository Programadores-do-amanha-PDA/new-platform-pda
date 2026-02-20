"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface ParticipantData {
  name: string;
  results: {
    challenge: string;
    challengeScore: number;
  }[];
}

interface DeliveryAccuracyChartProps {
  participants: ParticipantData[];
}

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

interface TooltipData {
  participant: string;
  [key: string]: string | number;
}

type TooltipPayloadItem = NonNullable<
  TooltipProps<string, string>["payload"]
>[number];

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<string, string> & {
  payload?: { payload: TooltipData }[];
}) => {
  if (active && payload && payload.length) {
    const participantName = payload[0].payload.participant;

    return (
      <div className="bg-background p-4 rounded-lg shadow-lg border">
        <p className="font-semibold mb-2">{participantName}</p>
        <div className="flex flex-col gap-1">
          {payload.map((item: TooltipPayloadItem) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">
                {item.name}: <strong>{item.value}%</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export function AttemptsChallengeScoreChart({
  participants,
}: DeliveryAccuracyChartProps) {
  const allDeliveries = Array.from(
    new Set(participants.flatMap((p) => p.results.map((r) => r.challenge)))
  );

  const chartConfig = allDeliveries.reduce(
    (acc, delivery, index) => ({
      ...acc,
      [delivery]: {
        label: delivery,
        color: colors[index % colors.length],
      },
    }),
    {} as ChartConfig
  );

  const chartData = participants.map((participant) => {
    const deliveryScores: Record<string, number> = {};
    allDeliveries.forEach((delivery) => {
      const result = participant.results.find((r) => r.challenge === delivery);
      deliveryScores[delivery] = result?.challengeScore || 0;
    });
    return {
      participant: participant.name,
      ...deliveryScores,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por Entrega</CardTitle>
        <CardDescription>Progressão de acertos em cada entrega</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="participant"
              tickLine={false}
              axisLine={false}
              tick={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={true}
            />
            <Tooltip content={<CustomTooltip />} cursor={true} />

            {allDeliveries.map((delivery, index) => (
              <Area
                key={delivery}
                type="monotone"
                dataKey={delivery}
                stackId="1"
                stroke={`hsl(var(--chart-${(index % 3) + 1}))`}
                fill={`hsl(var(--chart-${(index % 3) + 1}))`}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
