import { Button } from "@/components/ui/button";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export const DefaultTableHeader = <TData,>({ children, column }: { children: React.ReactNode; column: Column<TData> }) => {
    const sortState = column.getIsSorted();
    return (
        <div className="w-full h-[133.5px] flex justify-between items-center border-r border-b px-2">
            <p className="text-left font-semibold">{children}</p>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    if (!sortState) {
                        column.toggleSorting(false);
                    } else if (sortState === "asc") {
                        column.toggleSorting(true);
                    } else {
                        column.clearSorting();
                    }
                }}
            >
                {sortState === "asc" ? (
                    <ArrowUp className="stroke-primary-foreground" />
                ) : sortState === "desc" ? (
                    <ArrowDown className="stroke-primary-foreground" />
                ) : (
                    <ArrowUpDown />
                )}
            </Button>
        </div>
    );
};
