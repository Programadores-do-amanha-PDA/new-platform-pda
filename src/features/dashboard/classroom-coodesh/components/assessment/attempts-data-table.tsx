"use client";

import { useState } from "react";
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

import InsertAssessmentAttempts from "./insert-assessment-attempts";
import AttemptDialog from "./attempt-dialog";

import {
  ActionPlanRowT,
  IntegrityRowT,
  ParticipantDataT,
  ResultsRowT,
  ClassroomCoodeshAssessmentT,
} from "@/types";

export function AttemptsDataTable({
  assessment,
  updateAssessment,
}: {
  assessment: ClassroomCoodeshAssessmentT | undefined;
  updateAssessment: (
    assessment: ClassroomCoodeshAssessmentT,
    assessmentData: Partial<ClassroomCoodeshAssessmentT>
  ) => Promise<boolean>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<ParticipantDataT>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="w-full h-full flex justify-center items-center px-2 border-r">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Nome</p>
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
          <p
            className="font-medium capitalize cursor-pointer hover:underline"
            onClick={() => handleOpenChangeAttemptDialog(true, row.original)}
          >
            {row.getValue("name")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Email</p>
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
          <span className="lowercase">{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "results",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Respostas</p>
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
        <div className="w-full h-full flex justify-center items-center px-2 border-r border-b">
          <span>{row.getValue<ResultsRowT[]>("results").length}</span>
        </div>
      ),
    },
    {
      accessorKey: "integrityEvents",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Integridade</p>
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
        <div className="w-full h-full flex justify-center items-center px-2 border-r border-b">
          <span>{row.getValue<IntegrityRowT[]>("integrityEvents").length}</span>
        </div>
      ),
    },
    {
      accessorKey: "actionPlans",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
            <p>Planos de ações</p>
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
        <div className="w-full h-full flex justify-center items-center px-2 border-r border-b">
          <span>{row.getValue<ActionPlanRowT[]>("actionPlans").length}</span>
        </div>
      ),
    },
    {
      accessorKey: "assessmentScore",
      header: ({ column }) => {
        return (
          <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r bg-primary/15">
            <p className="font-semibold">Pontuação</p>
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
          <div className="w-full h-full flex justify-center items-center px-2 border-r border-b bg-primary/15">
            <p className="font-semibold">
              {row.getValue<ResultsRowT[]>("results")[0].assessmentScore}%
            </p>
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const resultsA = rowA.getValue<ResultsRowT[]>(columnId);
        const resultsB = rowB.getValue<ResultsRowT[]>(columnId);

        const scoreA = resultsA[0].assessmentScore;
        const scoreB = resultsB[0].assessmentScore;

        return scoreA > scoreB ? 1 : scoreA < scoreB ? -1 : 0;
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="w-full h-full flex justify-center items-center px-2">
          <p>Ações</p>
        </div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const participant = row.original;

        return (
          <div className="w-full h-full flex justify-center items-center p-2 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-semibold">
                  Ações
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${participant.name}	${participant.email}	${participant.results[0].assessmentScore}`
                    )
                  }
                >
                  Copiar dados
                </DropdownMenuItem>
                {assessment &&
                  assessment?.participants_data &&
                  assessment.participants_data.length > 0 && (
                    <DropdownMenuItem
                      onClick={() =>
                        updateAssessment(assessment, {
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
          </div>
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
    manualPagination: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: assessment?.participants_data?.length || 1000,
      },
    },
  });

  const [isAttemptDialogOpen, setIsAttemptDialogOpen] =
    useState<boolean>(false);
  const [selectedAttempt, setSelectedAttempt] =
    useState<ParticipantDataT | null>(null);

  const handleOpenChangeAttemptDialog = (
    isOpen: boolean,
    attempt: ParticipantDataT | null
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
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Procurando por alguém?"
          value={
            ((table.getColumn("email")?.getFilterValue() as string) ||
              (table.getColumn("name")?.getFilterValue() as string)) ??
            ""
          }
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {assessment && (
          <div className="flex justify-between items-center gap-4">
            <InsertAssessmentAttempts
              assessment={assessment}
              updateAssessment={updateAssessment}
            />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-semibold">
                  Ações
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {assessment &&
                  assessment?.participants_data &&
                  assessment.participants_data.length > 0 && (
                    <DropdownMenuItem
                      onClick={() =>
                        updateAssessment(assessment, {
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
                  className="p-0! h-full! border-0!"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-0! h-full!  border-0!"
                    >
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
                  Nenhuma resposta encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedAttempt && (
        <AttemptDialog
          attempt={selectedAttempt}
          open={isAttemptDialogOpen}
          onClose={() => setIsAttemptDialogOpen(false)}
        />
      )}
    </div>
  );
}
