import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { CoodeshAssessmentQuestion, CoodeshAttemptParticipantData } from "../../types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { calculateAccuracyByChallenge, calculateAverageDurationByChallenge } from "../../utils/calculate-metric";

const defaultColumns: ColumnDef<CoodeshAssessmentQuestion>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Questão</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                <p className="font-medium">{row.getValue("name")}</p>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Descrição</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-start items-center p-2 border-r border-b w-full h-auto overflow-hidden text-wrap">
                <span>{row.getValue("description")}</span>
            </div>
        ),
    },
    {
        accessorKey: "type_formatted",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Tipo</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="flex justify-between items-center px-2 border-r border-b w-full h-full">
                    {row.getValue("type_formatted")}
                </div>
            );
        },
    },
    {
        accessorKey: "level_formatted",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Nível</p>
                    <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-between items-center gap-4 px-2 border-r border-b w-full h-full">
                {row.getValue("level_formatted")}
            </div>
        ),
    },
    {
        accessorKey: "duration",
        header: ({ column }) => {
            return (
                <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                    <p>Duração</p>
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="justify-start px-0 w-full"
                    >
                        <ArrowUpDown />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-between items-center px-2 border-r border-b w-full h-full">
                <p>
                    {row.getValue("duration")} {row.original.duration_unit === "hour" ? "horas" : "minutos"}
                </p>
            </div>
        ),
    },
];

export const useQuestionsColumns = ({ participantsData }: { participantsData: CoodeshAttemptParticipantData[] | undefined }) => {
    const successRateByChallenge = participantsData ? calculateAccuracyByChallenge(participantsData) : {};
    const avgDurationByChallenge = participantsData ? calculateAverageDurationByChallenge(participantsData) : {};

    const columns: ColumnDef<CoodeshAssessmentQuestion>[] = [
        ...defaultColumns,
        ...(participantsData?.length
            ? [
                  {
                      accessorKey: "success_rate",
                      header: ({ column }: { column: Column<CoodeshAssessmentQuestion> }) => {
                          return (
                              <div className="flex justify-between items-center gap-4 bg-primary/15 px-2 border-r w-full h-full">
                                  <p className="font-semibold">Média de acertos</p>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                  >
                                      <ArrowUpDown />
                                  </Button>
                              </div>
                          );
                      },
                      cell: ({ row }: { row: Row<CoodeshAssessmentQuestion> }) => {
                          const rate = successRateByChallenge[row.original.name] || 0;
                          return (
                              <div className="flex justify-start items-center bg-primary/15 px-2 border-r border-b w-full h-full">
                                  <p className="font-semibold">{rate.toFixed()}%</p>
                              </div>
                          );
                      },
                  },
                  {
                      accessorKey: "avg_duration",
                      header: ({ column }: { column: Column<CoodeshAssessmentQuestion> }) => {
                          return (
                              <div className="flex justify-between items-center gap-4 bg-primary/15 px-2 border-r w-full h-full">
                                  <p className="font-semibold">Média de duração</p>

                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                  >
                                      <ArrowUpDown />
                                  </Button>
                              </div>
                          );
                      },
                      cell: ({ row }: { row: Row<CoodeshAssessmentQuestion> }) => {
                          const duration = avgDurationByChallenge[row.original.name] || 0;
                          const formatMinutesToTime = (minutes: number): string => {
                              const totalSeconds = Math.floor(minutes * 60);
                              const hours = Math.floor(totalSeconds / 3600);
                              const mins = Math.floor((totalSeconds % 3600) / 60);
                              const secs = totalSeconds % 60;
                              return `${hours.toString().padStart(2, "0")}:${mins
                                  .toString()
                                  .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                          };
                          return (
                              <div className="flex justify-start items-center gap-4 bg-primary/15 px-2 border-r border-b w-full h-full">
                                  <p className="font-semibold">{formatMinutesToTime(duration)}</p>
                              </div>
                          );
                      },
                  },
              ]
            : []),
    ];

    return {
        columns,
    };
};
