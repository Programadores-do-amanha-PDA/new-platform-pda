import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { CoodeshAssessment, CoodeshAttemptActionPlanRow, CoodeshAttemptIntegrityRow, CoodeshAttemptParticipantData, CoodeshAttemptResultsRow } from "../../types";
import AttemptsTableSortableHeader from "./attempts-table-sortable-header";
import AttemptsTableRowActionsMenu from "./attempts-table-row-actions-menu";
import { getAssessmentScore } from "./attempts-data-table.helpers";
import { UpdateAssessmentFn } from "./attempts-data-table.types";

interface GetColumnsParams {
    readonly assessment: CoodeshAssessment | undefined;
    readonly updateAssessment: UpdateAssessmentFn;
    readonly onOpenAttempt: (attempt: CoodeshAttemptParticipantData) => void;
}

export const getAttemptsTableColumns = ({
    assessment,
    updateAssessment,
    onOpenAttempt,
}: Readonly<GetColumnsParams>): ColumnDef<CoodeshAttemptParticipantData>[] => {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex justify-center items-center px-2 border-r w-full h-full">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center items-center p-2 border-r border-b w-full h-full">
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
            accessorKey: "name",
            header: ({ column }) => <AttemptsTableSortableHeader column={column} label="Nome" />,
            cell: ({ row }) => (
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                    <p className="font-medium hover:underline capitalize cursor-pointer" onClick={() => onOpenAttempt(row.original)}>
                        {row.getValue("name")}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }) => <AttemptsTableSortableHeader column={column} label="Email" />,
            cell: ({ row }) => (
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                    <span className="lowercase">{row.getValue("email")}</span>
                </div>
            ),
        },
        {
            accessorKey: "results",
            header: ({ column }) => <AttemptsTableSortableHeader column={column} label="Respostas" />,
            cell: ({ row }) => (
                <div className="flex justify-center items-center px-2 border-r border-b w-full h-full">
                    <span>{row.getValue<CoodeshAttemptResultsRow[]>("results").length}</span>
                </div>
            ),
        },
        {
            accessorKey: "integrityEvents",
            header: ({ column }) => <AttemptsTableSortableHeader column={column} label="Integridade" />,
            cell: ({ row }) => (
                <div className="flex justify-center items-center px-2 border-r border-b w-full h-full">
                    <span>{row.getValue<CoodeshAttemptIntegrityRow[]>("integrityEvents").length}</span>
                </div>
            ),
        },
        {
            accessorKey: "actionPlans",
            header: ({ column }) => <AttemptsTableSortableHeader column={column} label="Planos de ações" />,
            cell: ({ row }) => (
                <div className="flex justify-center items-center px-2 border-r border-b w-full h-full">
                    <span>{row.getValue<CoodeshAttemptActionPlanRow[]>("actionPlans").length}</span>
                </div>
            ),
        },
        {
            accessorKey: "assessmentScore",
            header: ({ column }) => <AttemptsTableSortableHeader column={column} label="Pontuação" highlighted />,
            cell: ({ row }) => {
                const participant = row.original;
                return (
                    <div className="flex justify-center items-center bg-primary/15 px-2 border-r border-b w-full h-full">
                        <p className="font-semibold">{getAssessmentScore(participant)}%</p>
                    </div>
                );
            },
            sortingFn: (rowA, rowB) => {
                const scoreA = getAssessmentScore(rowA.original);
                const scoreB = getAssessmentScore(rowB.original);
                return scoreA > scoreB ? 1 : scoreA < scoreB ? -1 : 0;
            },
        },
        {
            id: "actions",
            header: () => (
                <div className="flex justify-center items-center px-2 w-full h-full">
                    <p>Ações</p>
                </div>
            ),
            enableHiding: false,
            cell: ({ row }) => (
                <AttemptsTableRowActionsMenu
                    participant={row.original}
                    assessment={assessment}
                    updateAssessment={updateAssessment}
                />
            ),
        },
    ];
};
