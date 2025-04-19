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
import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";
import { ArrowUpDown } from "lucide-react";
import {
  calculateAccuracyByChallenge,
  calculateAverageDurationByChallenge,
} from "@/utils/coodesh/calculate-metric";

type Question = ClassroomCoodeshAssessment["questions"][number];

export function AssessmentQuestionsTable({
  assessment,
}: {
  assessment: ClassroomCoodeshAssessment | undefined;
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Questão
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Descrição
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-[300px]">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "type_formatted",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Tipo
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("type_formatted")}</div>,
    },
    {
      accessorKey: "level_formatted",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Nível
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("level_formatted")}</div>,
    },
    {
      accessorKey: "duration",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Duração
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          {row.getValue("duration")}{" "}
          {row.original.duration_unit === "hour" ? "horas" : "minutos"}
        </div>
      ),
    },
    ...(assessment?.participants_data?.length
      ? [
          {
            accessorKey: "success_rate",
            header: ({ column }: { column: Column<Question> }) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="w-full justify-end px-0"
                >
                  Média de acertos
                  <ArrowUpDown />
                </Button>
              );
            },
            cell: ({ row }: { row: Row<Question> }) => {
              const rate = successRates[row.original.name] || 0;
              return <div className="text-right">{rate.toFixed()}%</div>;
            },
          },
          {
            accessorKey: "avg_duration",
            header: ({ column }: { column: Column<Question> }) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="w-full justify-end px-0"
                >
                  Média de duração
                  <ArrowUpDown />
                </Button>
              );
            },
            cell: ({ row }: { row: Row<Question> }) => {
              const duration = avgDurations[row.original.name] || 0;
              return (
                <div className="text-right">{duration.toFixed()} minutos</div>
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
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nome da questão..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="w-full h-full max-h-[50vh] rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
