"use client";

import { useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const chartConfig = {
  views: {
    label: "Page Views",
  },
  participants: {
    label: "Participantes",
    color: "hsl(var(--chart-1))",
  },
  poll_results: {
    label: "Respostas",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function MeetingsParticipantsChart({
  chartData,
}: {
  chartData: {
    account_id: string;
    account_label: string;
    date: string;
    participants: number;
    poll_results: number;
  }[];
}) {
  const [timeRange, setTimeRange] = useState<"all" | "90d" | "30d" | "7d">(
    "30d"
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [accountOptions, setAccountOptions] = useState<
    { id: string; label: string }[]
  >([]);

  // Gerar opções de conta únicas
  useEffect(() => {
    const accounts = Array.from(
      new Map(
        chartData.map((item) => [
          item.account_id,
          { id: item.account_id, label: item.account_label },
        ])
      ).values()
    );
    setAccountOptions(accounts);
  }, [chartData]);

  const filteredData = chartData
    .filter(
      (item) =>
        selectedAccountId === "all" || item.account_id === selectedAccountId
    )
    .filter((item) => {
      if (timeRange === "all") return true;

      const date = new Date(item.date);
      const referenceDate = Date.now();
      let daysToSubtract = 90;
      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }

      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      startDate.setHours(0, 0, 0, 0);

      return date >= startDate;
    });

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "all" | "90d" | "30d" | "7d");
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Participantes e Respostas por Reunião</CardTitle>
          <CardDescription>
            Dados quantitativos de participação e respostas por reunião.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[160px] rounded-lg">
              <SelectValue placeholder="Selecionar conta" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todas as contas
              </SelectItem>
              {accountOptions.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  className="rounded-lg"
                >
                  {account.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[160px] rounded-lg">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todo o período
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient
                id="fill-participants"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-participants)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-participants)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fill-poll_results"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-poll_results)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-poll_results)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", {
                  dateStyle: "short",
                });
              }}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      dateStyle: "short",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="poll_results"
              type="natural"
              fill="url(#fill-poll_results)"
              stroke="var(--color-poll_results)"
              stackId="a"
            />
            <Area
              dataKey="participants"
              type="natural"
              fill="url(#fill-participants)"
              stroke="var(--color-participants)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
