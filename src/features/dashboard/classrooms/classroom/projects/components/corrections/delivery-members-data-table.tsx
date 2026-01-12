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
import { ArrowUpDown } from "lucide-react";

// Global imports
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ButtonGroupInput from "@/components/shared/button-group-input";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";
import { cn } from "@/lib/utils";

// Local imports
import { DeliveryMemberT, DeliveryMembersDataTablePropsT } from "../../types";

export function DeliveryMembersDataTable({
  members,
  selectedMembers,
  onMemberSelect,
  onSelectAll,
  emailsSent = [],
  showStatus = false,
  disableSelection = false,
}: DeliveryMembersDataTablePropsT) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const selectColumn: ColumnDef<DeliveryMemberT> = {
    id: "select",
    header: ({ table }) => (
      <div className="w-full h-full flex justify-center items-center px-2 border-r">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={onSelectAll}
          aria-label="Select all"
          disabled={disableSelection}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-full h-full flex justify-center items-center p-2 border-r border-b">
        <Checkbox
          checked={selectedMembers.some(
            (d) =>
              d.email === row.original.email &&
              d.deliveryId === row.original.deliveryId
          )}
          onCheckedChange={() => onMemberSelect(row.original)}
          aria-label="Select row"
          disabled={disableSelection}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const userColumn: ColumnDef<DeliveryMemberT> = {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4 border-r">
          <p className="font-semibold">Usuário</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-full h-full flex items-center gap-3 p-2 border-r border-b">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={row.original.avatar_url || ""}
            alt={row.original.name}
          />
          <AvatarFallback>
            {getFirstLastInitials(row.original.name) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-bold capitalize">{row.original.name}</p>
          <p className="text-sm text-muted-foreground lowercase">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.name.toLowerCase();
      const nameB = rowB.original.name.toLowerCase();
      return nameA.localeCompare(nameB);
    },
    filterFn: (row, _id, filterValue) => {
      const searchTerm = filterValue.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(searchTerm) ||
        row.original.email.toLowerCase().includes(searchTerm)
      );
    },
  };

  const noteColumn: ColumnDef<DeliveryMemberT> = {
    accessorKey: "deliveryData.final_note",
    header: ({ column }) => {
      return (
        <div className="w-full h-full flex justify-between items-center px-2 gap-4">
          <p className="font-semibold">Nota</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const finalNote = row.original.deliveryData.final_note;
      return (
        <div className="w-full h-full flex justify-center items-center px-2 border-b">
          <p
            className={cn(
              "font-semibold text-sm",
              Number(finalNote) >= 7 ? "text-green-600" : "text-destructive"
            )}
          >
            {finalNote || "N/A"}
          </p>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const noteA = rowA.original.deliveryData.final_note || "0";
      const noteB = rowB.original.deliveryData.final_note || "0";

      const numA = parseFloat(noteA);
      const numB = parseFloat(noteB);

      return numA > numB ? 1 : numA < numB ? -1 : 0;
    },
  };

  const statusColumn: ColumnDef<DeliveryMemberT> = {
    accessorKey: "status",
    header: () => {
      return (
        <div className="w-full h-full flex justify-center items-center px-2 border-l">
          <p className="font-semibold">Status</p>
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status || "pending";
      const isSent = emailsSent.includes(row.original.email);

      // Use the status property if available, otherwise fallback to emailsSent check
      const currentStatus =
        status !== "pending" ? status : isSent ? "sent" : "pending";

      return (
        <div className="w-full h-full flex justify-center items-center px-2 border-b border-l">
          {currentStatus === "sent" && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Enviado
            </span>
          )}
          {currentStatus === "sending" && (
            <span className="text-xs text-blue-600 font-medium">
              📤 Enviando...
            </span>
          )}
          {currentStatus === "error" && (
            <span className="text-xs text-red-600 font-medium">❌ Erro</span>
          )}
          {currentStatus === "pending" && (
            <span className="text-xs text-muted-foreground">⏳ Pendente</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  };

  const baseColumns = disableSelection
    ? [userColumn, noteColumn]
    : [selectColumn, userColumn, noteColumn];

  const columns = showStatus ? [...baseColumns, statusColumn] : baseColumns;

  const table = useReactTable({
    data: members,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    manualPagination: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: members.length || 1000,
      },
    },
  });

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <ButtonGroupInput
          inputProps={{
            placeholder: "Procurando por alguém?",
            value: (table.getColumn("name")?.getFilterValue() as string) ?? "",
            onChange: (event) =>
              table.getColumn("name")?.setFilterValue(event.target.value),
          }}
          buttonGroupProps={{
            className: "max-w-sm w-full",
          }}
          buttonProps={{
            variant: "outline",
          }}
        />
        {!disableSelection && (
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            {selectedMembers.length === members.length
              ? "Desmarcar Todos"
              : "Selecionar Todos"}
          </Button>
        )}
      </div>

      <div className="w-full max-h-60 flex border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="shadow rounded-t-lg overflow-hidden"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-0">
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
                  key={`${row.original.deliveryId}-${row.original.email}`}
                  className="p-0 h-full border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-0 h-full border-0">
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
                  Nenhuma entrega corrigida encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
