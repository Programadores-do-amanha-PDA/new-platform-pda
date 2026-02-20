"use client";

import { useState } from "react";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import AttemptDialog from "./attempt-dialog";
import { CoodeshAttemptParticipantData } from "../../types";
import AttemptsTableContent from "./attempts-table-content";
import AttemptsTableToolbar from "./attempts-table-toolbar";
import { getAttemptsTableColumns } from "./attempts-table-columns";
import { AttemptsDataTableProps } from "./attempts-data-table.types";

export function AttemptsDataTable({ assessment, updateAssessment }: Readonly<AttemptsDataTableProps>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isAttemptDialogOpen, setIsAttemptDialogOpen] = useState<boolean>(false);
    const [selectedAttempt, setSelectedAttempt] = useState<CoodeshAttemptParticipantData | null>(null);

    const handleOpenAttempt = (attempt: CoodeshAttemptParticipantData) => {
        setSelectedAttempt(attempt);
        setIsAttemptDialogOpen(true);
    };

    const columns = getAttemptsTableColumns({
        assessment,
        updateAssessment,
        onOpenAttempt: handleOpenAttempt,
    });

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

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <AttemptsTableToolbar table={table} assessment={assessment} updateAssessment={updateAssessment} />

            <AttemptsTableContent table={table} columnsLength={columns.length} />

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
