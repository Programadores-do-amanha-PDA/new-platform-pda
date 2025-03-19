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

import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserSheetData from "./user-sheet-data";
import { AuthUser } from "@supabase/supabase-js";
import InsertManyUsersDrawer from "./insert-many-users-drawer";

export function DataTable({
  data,
  columns,
  loading,
  handleCreateNewUser,
  handleUpdateUser,
  handleAddUserRole,
  handleUpdateUserRole,
  handleDeleteUserRole,
  excludeRoles,
}: {
  data: Partial<AuthUserWithProfileType>[];
  columns: ColumnDef<Partial<AuthUserWithProfileType>>[];
  loading: boolean;
  handleCreateNewUser: (
    user: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  defaultRoleValue: RolesType;
  handleUpdateUser: (
    userID: string,
    user: Partial<AuthUser & { password: string }>
  ) => Promise<boolean>;
  handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleDeleteUserRole: (userId: string) => Promise<boolean>;
  excludeRoles?: RolesType[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
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

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Busque por um email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-4">
          <InsertManyUsersDrawer
            handleAddUserRole={handleAddUserRole}
            handleCreateNewUser={handleCreateNewUser}
            excludeRoles={excludeRoles}
          />

          <UserSheetData
            mode="new"
            handleCreateNewUser={handleCreateNewUser}
            handleUpdateUser={handleUpdateUser}
            handleAddUserRole={handleAddUserRole}
            handleUpdateUserRole={handleUpdateUserRole}
            handleDeleteUserRole={handleDeleteUserRole}
            excludeRoles={excludeRoles}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="!px-0">
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
            ) : loading ? (
              [...Array(3)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, i) => (
                    <TableCell key={i} className="h-12 text-center">
                      <Skeleton className="w-full h-11" />
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
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
            </>
          )}
        </div>
        <div className="space-x-2">
          {table.getCanPreviousPage() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
          )}

          {table.getCanNextPage() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Proxima
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
