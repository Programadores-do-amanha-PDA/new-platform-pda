import { Table as TanstackTable } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import InsertAssessmentAttempts from "./insert-assessment-attempts";
import { CoodeshAssessment, CoodeshAttemptParticipantData } from "../../types";
import { UpdateAssessmentFn } from "./attempts-data-table.types";

interface AttemptsTableToolbarProps {
    readonly table: TanstackTable<CoodeshAttemptParticipantData>;
    readonly assessment: CoodeshAssessment | undefined;
    readonly updateAssessment: UpdateAssessmentFn;
}

const AttemptsTableToolbar = ({ table, assessment, updateAssessment }: Readonly<AttemptsTableToolbarProps>) => {
    return (
        <div className="flex justify-between items-center">
            <Input
                placeholder="Procurando por alguém?"
                value={
                    ((table.getColumn("email")?.getFilterValue() as string) ||
                        (table.getColumn("name")?.getFilterValue() as string)) ??
                    ""
                }
                onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
                className="max-w-sm"
            />
            {assessment && (
                <div className="flex justify-between items-center gap-4">
                    <InsertAssessmentAttempts assessment={assessment} updateAssessment={updateAssessment} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 w-8 h-8">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="font-semibold">Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {assessment.participants_data && assessment.participants_data.length > 0 && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        updateAssessment(assessment, {
                                            participants_data: [],
                                        })
                                    }
                                >
                                    Deletar todos os dados
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
};

export default AttemptsTableToolbar;
