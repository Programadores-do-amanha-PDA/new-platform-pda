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
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnVisibilityDropdown } from "./column-visibility-dropdown";
import { getColumnGroups } from "./column-groups";
import { ClassroomOverviewData } from "@/types/classroom-overview";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fullData?: ClassroomOverviewData; // For accessing coodesh tests and projects names
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fullData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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
        pageSize: data?.length || 1000,
      },
    },
  });

  const allColumns = table.getAllColumns();
  const columnGroups = useMemo(() => {
    // Provide a default structure if fullData is not available
    const defaultData: ClassroomOverviewData = {
      students: [],
      coodeshTests: [],
      projects: [],
    };

    return getColumnGroups(
      allColumns as Array<{
        id: string;
        columnDef?: { accessorKey?: string; header?: unknown };
      }>,
      fullData || defaultData
    );
  }, [allColumns, fullData]);

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Procurando por alguém?"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <ColumnVisibilityDropdown table={table} columnGroups={columnGroups} />
      </div>

      <div className="rounded-md border flex w-full h-full overflow-auto">
        <Table className="w-full">
          <TableHeader className="bg-sidebar sticky top-0 left-0 right-0 z-20 overflow-hidden shadow-md">
            {/* Group headers row */}
            <TableRow className="w-full p-0">
              {/* Name column */}
              {columnGroups
                .filter((group) => {
                  // Filter out groups that have no visible columns
                  return group.columns.some((columnId) => {
                    const tableColumn = table.getColumn(columnId);
                    return tableColumn?.getIsVisible() ?? true;
                  });
                })
                .map((group) => {
                  // Calculate actual visible colspan
                  const visibleColspan = group.columns.filter((columnId) => {
                    const tableColumn = table.getColumn(columnId);
                    return tableColumn?.getIsVisible() ?? true;
                  }).length;

                  const isFirstColumn = group.id === "name";

                  return (
                    <TableHead
                      key={group.id}
                      colSpan={visibleColspan}
                      rowSpan={group.label === null ? 2 : 1}
                      className={`w-full h-max p-0! m-0 ${
                        isFirstColumn ? "sticky left-0 bg-sidebar z-10" : ""
                      }`}
                    >
                      {group.label ? (
                        <div className="w-full h-11 flex justify-start items-center px-2 font-bold border-r border-b">
                          {group.label}
                        </div>
                      ) : (
                        <div className="w-full h-full flex justify-center items-center">
                          {(() => {
                            const header = table
                              .getHeaderGroups()[0]
                              ?.headers.find(
                                (h) =>
                                  h.id === group.columns[0] &&
                                  h.column.getIsVisible()
                              );
                            if (!header || header.isPlaceholder) return null;
                            return flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            );
                          })()}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
            </TableRow>
            {/* Individual column headers row - only for grouped columns */}
            <TableRow>
              {table
                .getHeaderGroups()[0]
                ?.headers.filter((header) => header.column.getIsVisible())
                .map((header) => {
                  // Skip rendering if this column is individual (already rendered in first row)
                  const isIndividualColumn = columnGroups.some(
                    (group) =>
                      group.label === null && group.columns.includes(header.id)
                  );

                  if (isIndividualColumn) {
                    return null;
                  }

                  return (
                    <TableHead key={header.id} className="w-full h-11 p-0">
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
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="!border-0 !h-max"
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isFirstColumn = index === 0;
                    return (
                      <TableCell
                        key={cell.id}
                        className={`p-0 border-0 h-full ${
                          isFirstColumn ? "sticky left-0 z-10" : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
