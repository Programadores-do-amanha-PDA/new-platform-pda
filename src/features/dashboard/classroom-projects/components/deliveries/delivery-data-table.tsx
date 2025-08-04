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
import { ClassroomProjectDeliveryT } from "@/types/classroom-projects/delivery";

const columns: ColumnDef<ClassroomProjectDeliveryT>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-full h-full flex justify-center items-center px-2 border-r">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "members",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Membros</p>
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
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-start items-center p-2 border-r border-b">
        <span className="font-medium">
          {(row.getValue("members") as string[]).join(", ")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Entregue em</p>
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
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formatted = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
      }).format(date);

      return (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b">
          <span>{formatted}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastCorrection",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p>Corrigido em</p>
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
    cell: ({ row }) => {
      if (!row.getValue("lastCorrection")) {
        return (
          <div className="w-full h-full flex justify-center items-center p-2 border-r border-b">
            <span className="text-muted-foreground">Correção pendente</span>
          </div>
        );
      }
      const date = new Date(row.getValue("lastCorrection"));
      const formatted = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
      }).format(date);

      return (
        <div className="w-full h-full flex justify-center items-center p-2 border-r border-b">
          <span>{formatted}</span>
        </div>
      );
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
      const delivery = row.original;

      return (
        <div className="w-full h-full flex justify-center items-center p-2 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(delivery.id)}
              >
                Copiar Id da Entrega
              </DropdownMenuItem>
              <DropdownMenuItem>Deletar entrega</DropdownMenuItem>
              <DropdownMenuItem>Download attachments</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Procurando por alguém?"
          value={(table.getColumn("members")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("members")?.setFilterValue(event.target.value)
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
                  className="p-0! h-full! border-0!"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-0! h-full! border-0!">
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
                  Nenhuma entrega encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {`${
              table.getFilteredSelectedRowModel().rows.length
            } linhas selecionadas.`}
          </div>
        </div>
      )}
    </div>
  );
}
