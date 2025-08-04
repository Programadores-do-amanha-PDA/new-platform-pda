"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const chartConfig = {
  participants: {
    label: "Participantes",
    color: "var(--chart-1))",
  },
  poll_results: {
    label: "Respostas",
    color: "var(--chart-2))",
  },
} satisfies ChartConfig;

export function MeetingsParticipantsChart({
  chartData,
  classroomId,
}: {
  chartData: {
    account_id: string;
    account_label: string;
    date: string;
    participants: number;
    poll_results: number;
  }[];
  classroomId: string;
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

  // Calcular valores máximos para definir as linhas de meta
  const maxParticipants = Math.max(
    ...filteredData.map((item) => item.participants),
    0
  );
  const maxPollResults = Math.max(
    ...filteredData.map((item) => item.poll_results),
    0
  );
  const participantsGoal = maxParticipants * 0.8; // Meta para participantes em 80% do valor máximo
  const pollsGoal = maxPollResults * 0.8; // Meta para polls em 80% do valor máximo

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "all" | "90d" | "30d" | "7d");
  };

  return (
    <Card>
      <CardHeader className="w-full flex items-center justify-between gap-2 space-y-0 border-b sm:flex-row">
        <div className="flex flex-col gap-1 text-center sm:text-left">
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
        <Link
          href={`/dashboard/classrooms/${classroomId}/zoom/meetings`}
          className="w-max flex items-center gap-2 px-4 text-sm font-bold text-primary-foreground hover:underline"
        >
          Ir para Reuniões
          <ArrowRight className="-rotate-6 size-4" />
        </Link>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toString()}
              domain={[0, "dataMax + 5"]}
            />
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
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
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
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      dateStyle: "short",
                    });
                  }}
                  indicator="dashed"
                />
              }
            />
            {participantsGoal > 0 && (
              <ReferenceLine
                y={participantsGoal}
                stroke="var(--chart-1)"
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{
                  value: `Meta(P): ${Math.round(participantsGoal)}`,
                  position: "left",
                  offset: 10,
                  style: {
                    fill: "var(--chart-1)",
                    fontWeight: "600",
                    fontSize: "11px",
                    textAnchor: "end",
                    zIndex: 10,
                  },
                }}
              />
            )}
            {pollsGoal > 0 && (
              <ReferenceLine
                y={pollsGoal}
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{
                  value: `Meta(R): ${Math.round(pollsGoal)}`,
                  position: "left",
                  offset: 10,
                  style: {
                    fill: "var(--chart-2)",
                    fontWeight: "600",
                    fontSize: "11px",
                    textAnchor: "end",
                    zIndex: 10,
                  },
                }}
              />
            )}

            <Area
              dataKey="participants"
              type="monotone"
              fill="url(#fill-participants)"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fillOpacity={0.6}
            />
            <Area
              dataKey="poll_results"
              type="monotone"
              fill="url(#fill-poll_results)"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-center items-center"></CardFooter>
    </Card>
  );
}
