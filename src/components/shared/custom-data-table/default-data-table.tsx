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
 * @property {number} [pageSize] - Optional number of rows to display per page (defaults to 1000).
 * @property {boolean} [showSearchInput] - Whether to display the search input (defaults to true).
 * @property {string} [searchPlaceholder] - Placeholder text for the search input (defaults to "Search...").
 * @property {string} [searchColumnId] - The column ID to filter by (defaults to "name"). Set to empty string to disable filtering.
 * @property {string} [emptyMessage] - Message displayed when no data is found (defaults to "No data found.").
 */
interface DefaultDataTableProps<TData> {
    readonly data: TData[];
    readonly columns: ColumnDef<TData>[];
    readonly pageSize?: number;
    readonly showSearchInput?: boolean;
    readonly searchPlaceholder?: string;
    readonly searchColumnId?: string;
    readonly emptyMessage?: string;
}

/**
 * A generic data table component with sorting, filtering, and row selection capabilities.
 *
 * @template TData - The shape of the data objects in the table, must extend Record<string, unknown>
 *
 * @param {Object} props - The component props
 * @param {TData[]} props.data - Array of data objects to display in the table
 * @param {ColumnDef<TData>[]} props.columns - Column definitions that specify how to render each column
 * @param {number} [props.pageSize=1000] - Optional number of rows to display per page
 * @param {boolean} [props.showSearchInput=true] - Whether to display the search input
 * @param {string} [props.searchPlaceholder="Search..."] - Placeholder text for the search input
 * @param {string} [props.searchColumnId="name"] - The column ID to filter by. Set to empty string to disable filtering
 * @param {string} [props.emptyMessage="No data found."] - Message displayed when no data is found
 *
 * @returns {JSX.Element} A flex container with optional search input and a data table featuring:
 *   - Optional search functionality filtering by specified column
 *   - Sortable columns
 *   - Filterable columns
 *   - Row selection capability
 *   - Sticky header that remains visible while scrolling
 *   - Customizable empty state message
 *
 * @example
 * ```tsx
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * // Basic usage with defaults
 * <DefaultDataTable<User>
 *   data={users}
 *   columns={userColumns}
 * />
 *
 * // Custom search and without input
 * <DefaultDataTable<User>
 *   data={users}
 *   columns={userColumns}
 *   showSearchInput={false}
 * />
 *
 * // Custom search column
 * <DefaultDataTable<User>
 *   data={users}
 *   columns={userColumns}
 *   searchColumnId="email"
 *   searchPlaceholder="Search by email..."
 * />
 * ```
 */
export const DefaultDataTable = <TData extends Record<string, unknown>>({
    data,
    columns,
    pageSize = 1000,
    showSearchInput = true,
    searchPlaceholder = "Procurando por algo?",
    searchColumnId = "name",
    emptyMessage = "Nenhuma dado a ser exibido.",
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
                pageSize,
            },
        },
    });

    const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : null;

    return (
        <div className="flex flex-col flex-1 gap-4 w-full h-full overflow-hidden">
            {showSearchInput && searchColumn && (
                <div className="flex justify-between items-center">
                    <Input
                        placeholder={searchPlaceholder}
                        value={(searchColumn.getFilterValue() as string) ?? ""}
                        onChange={(event) => searchColumn.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                </div>
            )}
            <div className="flex w-max border rounded-lg max-w-full h-full overflow-hidden">
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
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
