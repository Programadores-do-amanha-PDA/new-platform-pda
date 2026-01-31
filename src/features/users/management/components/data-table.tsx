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

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/features/users/profile";

type DataTableProps = {
    data: User[];
    columns: ColumnDef<User>[];
    loading: boolean;
    headerRightOptions?: (selectedUsers: User[], clearSelection?: () => void) => React.ReactNode;
};

export function DataTable({ data, columns, loading, headerRightOptions }: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
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
        manualPagination: false,
        autoResetPageIndex: false,
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: data?.length || 1000,
            },
        },
    });

    // Get selected users
    const selectedUsers = table.getFilteredSelectedRowModel().rows.map((row) => row.original) as User[];

    // Function to clear selection
    const clearSelection = () => {
        setRowSelection({});
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
            <div className="sticky flex justify-between items-center py-4">
                <Input
                    placeholder="Procurando por alguém?"
                    value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("profile")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                {headerRightOptions?.(selectedUsers, clearSelection)}
            </div>

            <div className="flex border rounded-lg w-full h-full overflow-hidden">
                <Table>
                    <TableHeader className="top-0 z-10 sticky bg-white">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="shadow rounded-t-lg! overflow-hidden">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="px-0!">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex justify-end items-center space-x-2 py-4">
                    <div className="flex-1 text-muted-foreground text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s)
                        selecionada(s).
                    </div>
                </div>
            )}
        </div>
    );
}
