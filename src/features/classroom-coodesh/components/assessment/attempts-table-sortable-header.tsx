import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CoodeshAttemptParticipantData } from "../../types";

interface SortableHeaderProps {
    readonly column: Column<CoodeshAttemptParticipantData, unknown>;
    readonly label: string;
    readonly highlighted?: boolean;
}

const AttemptsTableSortableHeader = ({ column, label, highlighted = false }: Readonly<SortableHeaderProps>) => {
    return (
        <div
            className={`flex justify-between items-center gap-4 px-2 border-r w-full h-full ${
                highlighted ? "bg-primary/15" : ""
            }`}
        >
            <p className={highlighted ? "font-semibold" : ""}>{label}</p>
            <Button variant="ghost" size="icon" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                <ArrowUpDown />
            </Button>
        </div>
    );
};

export default AttemptsTableSortableHeader;
