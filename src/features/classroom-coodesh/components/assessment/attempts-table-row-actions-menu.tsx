import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CoodeshAssessment, CoodeshAttemptParticipantData } from "../../types";
import { getAssessmentScore } from "./attempts-data-table.helpers";
import { UpdateAssessmentFn } from "./attempts-data-table.types";

interface RowActionsMenuProps {
    readonly participant: CoodeshAttemptParticipantData;
    readonly assessment: CoodeshAssessment | undefined;
    readonly updateAssessment: UpdateAssessmentFn;
}

const AttemptsTableRowActionsMenu = ({ participant, assessment, updateAssessment }: Readonly<RowActionsMenuProps>) => {
    return (
        <div className="flex justify-center items-center p-2 border-b w-full h-full">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 w-8 h-8">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="font-semibold">Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `${participant.name}\t${participant.email}\t${getAssessmentScore(participant)}`,
                            )
                        }
                    >
                        Copiar dados
                    </DropdownMenuItem>
                    {assessment && assessment.participants_data && assessment.participants_data.length > 0 && (
                        <DropdownMenuItem
                            onClick={() => {
                                const filteredData = assessment.participants_data?.filter((p) => p.email !== participant.email) ?? [];
                                updateAssessment(assessment, {
                                    participants_data: filteredData,
                                });
                            }}
                        >
                            Deletar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default AttemptsTableRowActionsMenu;
