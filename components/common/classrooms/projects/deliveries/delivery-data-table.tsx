"use client";

import * as React from "react";
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
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";

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
import { ClassroomProjectDeliveryT } from "@/types/projects/delivery";

const columns: ColumnDef<ClassroomProjectDeliveryT>[] = [
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
    accessorKey: "members",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full flex justify-start items-center">
          <Button
            variant="ghost"
            className="text-left px-2"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            Membros
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full flex px-2 items-center justify-start">
        {(row.getValue("members") as string[]).join(", ")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full flex justify-center items-center">
          <Button
            variant="ghost"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            Criado em
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formatted = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
      }).format(date);

      return (
        <div className="w-full h-full flex justify-center items-center">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "lastCorrection",
    header: ({ column }) => {
      const sortState = column.getIsSorted();
      return (
        <div className="w-full flex justify-center items-center">
          <Button
            variant="ghost"
            onClick={() => {
              if (!sortState) {
                column.toggleSorting(false);
              } else if (sortState === "asc") {
                column.toggleSorting(true);
              } else {
                column.clearSorting();
              }
            }}
          >
            Corrigido em
            {sortState === "asc" ? (
              <ArrowUp className="stroke-primary" />
            ) : sortState === "desc" ? (
              <ArrowDown className="stroke-primary" />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      if (!row.getValue("lastCorrection")) {
        return (
          <div className="w-full h-full flex justify-center items-center">
            Correção pendente
          </div>
        );
      }
      const date = new Date(row.getValue("lastCorrection"));
      const formatted = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
      }).format(date);

      return (
        <div className="w-full h-full flex justify-center items-center">
          {formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const delivery = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(delivery.id)}
            >
              Copiar Id da Entrega
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Deletar entrega</DropdownMenuItem>
            <DropdownMenuItem>Download attachments</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DeliveryDataTable({
  deliveries,
}: {
  deliveries: ClassroomProjectDeliveryT[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: deliveries,
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
        pageSize: deliveries?.length || 1000,
      },
    },
  });

  return (
    <div className="w-full h-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("members")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("members")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="w-full h-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
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
                  No deliveries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            `${
              table.getFilteredSelectedRowModel().rows.length
            } linhas selecionadas.`}
        </div>
      </div>
    </div>
  );
}
