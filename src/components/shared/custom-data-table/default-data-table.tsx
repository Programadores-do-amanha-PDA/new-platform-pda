import { useState } from "react";
import {
    ColumnFiltersState,
    ColumnDef,
    RowSelectionState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";

/**
 * Props for the DefaultDataTable component.
 * @template TData The shape of the data rows.
 * @property {TData[]} data - The array of data to display in the table.
 * @property {ColumnDef<TData>[]} columns - The column definitions for the table.
 * @property {number} pageSize - The number of rows to display per page.
 */
interface DefaultDataTableProps<TData> {
    readonly data: TData[];
    readonly columns: ColumnDef<TData>[];
    readonly pageSize: number;
}

/**
 * A flexible data table component with sorting, filtering, and row selection.
 * @template TData The shape of the data rows.
 *
 * @example
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'email', header: 'Email' }
 * ];
 * <DefaultDataTable data={users} columns={columns} pageSize={10} />
 */
export const DefaultDataTable = <TData extends Record<string, unknown>>({
    data,
    columns,
    pageSize,
}: DefaultDataTableProps<TData>) => {
    "use no memo";

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable<TData>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
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
                pageSize: pageSize || 1000,
            },
        },
    });

    return (
        <div className="flex flex-col flex-1 gap-4 w-full h-full overflow-hidden">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Procurando por algo?"
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="flex border rounded-lg w-full h-full overflow-hidden">
                <Table>
                    <TableHeader className="top-0 z-10 sticky bg-zinc-100 p-0!">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="shadow-none! p-0! rounded-none! overflow-hidden!">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="p-0!">
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="p-0! border-none! h-full!"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-0! h-full!">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhum dado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
