import { Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { CoodeshAttemptParticipantData } from "../../types";

interface AttemptsTableContentProps {
    readonly table: TanstackTable<CoodeshAttemptParticipantData>;
    readonly columnsLength: number;
}

const AttemptsTableContent = ({ table, columnsLength }: Readonly<AttemptsTableContentProps>) => {
    return (
        <div className="flex border rounded-lg w-full h-full overflow-hidden">
            <Table>
                <TableHeader className="top-0 z-10 sticky bg-white p-0!">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="shadow p-0! rounded-t-lg! overflow-hidden">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="p-0!">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="p-0! border-0! h-full!"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="p-0! border-0! h-full!">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columnsLength} className="h-24 text-center">
                                Nenhuma resposta encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AttemptsTableContent;
