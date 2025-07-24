"use client";
import * as React from "react";
import {
  Column,
  Row,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClassroomCoodeshAssessmentT } from "@/types/coodesh";
import { ArrowUpDown } from "lucide-react";
import {
  calculateAccuracyByChallenge,
  calculateAverageDurationByChallenge,
} from "@/utils/coodesh/calculate-metric";

type Question = ClassroomCoodeshAssessmentT["questions"][number];

export function AssessmentQuestionsTable({
  assessment,
}: {
  assessment: ClassroomCoodeshAssessmentT | undefined;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Calculate metrics
  const successRates = assessment?.participants_data
    ? calculateAccuracyByChallenge(assessment.participants_data)
    : {};
  const avgDurations = assessment?.participants_data
    ? calculateAverageDurationByChallenge(assessment.participants_data)
    : {};

  const columns: ColumnDef<Question>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Questão</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
          <p className="font-medium">{row.getValue("name")}</p>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4  border-r">
            <p>Descrição</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-auto text-wrap flex justify-start items-center overflow-hidden p-2 border-r border-b">
          <span>{row.getValue("description")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type_formatted",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4  border-r">
            <p>Tipo</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 border-r border-b">
            {row.getValue("type_formatted")}
          </div>
        );
      },
    },
    {
      accessorKey: "level_formatted",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Nível</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r border-b">
          {row.getValue("level_formatted")}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Duração</p>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="w-full justify-start px-0"
            >
              <ArrowUpDown />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-between items-center px-2 border-r border-b">
          <p>
            {row.getValue("duration")}{" "}
            {row.original.duration_unit === "hour" ? "horas" : "minutos"}
          </p>
        </div>
      ),
    },
    ...(assessment?.participants_data?.length
      ? [
          {
            accessorKey: "success_rate",
            header: ({ column }: { column: Column<Question> }) => {
              return (
                <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r bg-primary/15">
                  <p className="font-semibold">Média de acertos</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      column.toggleSorting(column.getIsSorted() === "asc")
                    }
                  >
                    <ArrowUpDown />
                  </Button>
                </div>
              );
            },
            cell: ({ row }: { row: Row<Question> }) => {
              const rate = successRates[row.original.name] || 0;
              return (
                <div className="w-full h-full flex justify-start items-center px-2 border-r border-b bg-primary/15">
                  <p className="font-semibold">{rate.toFixed()}%</p>
                </div>
              );
            },
          },
          {
            accessorKey: "avg_duration",
            header: ({ column }: { column: Column<Question> }) => {
              return (
                <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r bg-primary/15">
                  <p className="font-semibold">Média de duração</p>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      column.toggleSorting(column.getIsSorted() === "asc")
                    }
                  >
                    <ArrowUpDown />
                  </Button>
                </div>
              );
            },
            cell: ({ row }: { row: Row<Question> }) => {
              const duration = avgDurations[row.original.name] || 0;
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
                <div className="w-full h-full flex justify-start items-center px-2 gap-4 border-r border-b bg-primary/15">
                  <p className="font-semibold">
                    {formatMinutesToTime(duration)}
                  </p>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data: assessment?.questions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: assessment?.questions.length || 1000,
      },
    },
  });

  return (
    <div className="w-full h-full flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between py-4 sticky">
        <Input
          placeholder="Procurando por algo?"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="w-full h-full flex border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 p-0!">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="shadow rounded-t-lg! overflow-hidden p-0!"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-0!">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="p-0! h-full!"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-0! h-full!">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhuma questão encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
