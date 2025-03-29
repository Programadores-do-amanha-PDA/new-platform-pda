"use client";

import {
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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ActionPlanRow,
  IntegrityRow,
  ParticipantData,
  ResultsRow,
} from "@/types/coodesh/attempts";
import InsertAssessmentAttempts from "./insert-assessment-attemts";
import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";
import { useState } from "react";
import AttemptDialog from "./attempt/attempt-dialog";

export function AttemptsDataTable({
  assessment,
  handleUpdateCoodeshAssessment,
}: {
  assessment: ClassroomCoodeshAssessment | undefined;
  handleUpdateCoodeshAssessment: (
    assessment: ClassroomCoodeshAssessment,
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => Promise<boolean>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<ParticipantData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        console.log("column");
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Nome
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className="capitalize !cursor-pointer hover:!underline"
          onClick={() => handleOpenChangeAttemptDialog(true, row.original)}
        >
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start  px-0"
          >
            Email
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "results",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start px-0"
          >
            Respostas
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">
          {row.getValue<ResultsRow[]>("results").length}
        </div>
      ),
    },
    {
      accessorKey: "integrityEvents",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start  px-0"
          >
            Integridade
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">
          {row.getValue<IntegrityRow[]>("integrityEvents").length}
        </div>
      ),
    },
    {
      accessorKey: "actionPlans",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start  px-0"
          >
            Planos de ações
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">
          {row.getValue<ActionPlanRow[]>("actionPlans").length}
        </div>
      ),
    },
    {
      accessorKey: "assessmentScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-end px-0"
          >
            Pontuação
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium text-center">
            {row.getValue<ResultsRow[]>("results")[0].assessmentScore}%
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const resultsA = rowA.getValue<ResultsRow[]>(columnId);
        const resultsB = rowB.getValue<ResultsRow[]>(columnId);

        const scoreA = resultsA[0].assessmentScore;
        const scoreB = resultsB[0].assessmentScore;

        return scoreA > scoreB ? 1 : scoreA < scoreB ? -1 : 0;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const participant = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${participant.name}	${participant.email}	${participant.results[0].assessmentScore}`
                  )
                }
              >
                Copiar dados
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {assessment &&
                assessment?.participants_data &&
                assessment.participants_data.length > 0 && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateCoodeshAssessment(assessment, {
                        participants_data:
                          assessment?.participants_data?.filter(
                            (p) => p.email !== participant.email
                          ) ?? [],
                      })
                    }
                  >
                    Deletar
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: assessment?.participants_data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const [isAttemptDialogOpen, setIsAttemptDialogOpen] =
    useState<boolean>(false);
  const [selectedAttempt, setSelectedAttempt] =
    useState<ParticipantData | null>(null);

  const handleOpenChangeAttemptDialog = (
    isOpen: boolean,
    attempt: ParticipantData | null
  ) => {
    if (isOpen === true && attempt) {
      setSelectedAttempt(attempt);
      setIsAttemptDialogOpen(true);
    } else if (isOpen === false) {
      setSelectedAttempt(null);
      setIsAttemptDialogOpen(false);
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filtrar emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {assessment && (
            <div className="flex justify-between items-center gap-4">
              <InsertAssessmentAttempts
                assessment={assessment}
                handleUpdateCoodeshAssessment={handleUpdateCoodeshAssessment}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {assessment &&
                    assessment?.participants_data &&
                    assessment.participants_data.length > 0 && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateCoodeshAssessment(assessment, {
                            participants_data: [],
                          })
                        }
                      >
                        Deletar todos os dados
                      </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="rounded-md border">
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedAttempt && (
        <AttemptDialog
          attempt={selectedAttempt}
          open={isAttemptDialogOpen}
          onClose={() => setIsAttemptDialogOpen(false)}
          // onConfirm={handleDeleteAttempt}
        />
      )}
    </>
  );
}
