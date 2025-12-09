import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type DefaultTableHeaderProps<TData> = {
    children: React.ReactNode;
    column?: Column<TData, unknown>;
    className?: string;
};

export const DefaultTableHeader = <TData,>({ children, column, className }: DefaultTableHeaderProps<TData>) => {
    const sortState = column?.getIsSorted();
    return (
        <div className={cn("w-full min-h-12 max-h-12 flex justify-between items-center border-r border-b px-2", className)}>
            <p className="text-left font-semibold">{children}</p>
            {column?.getCanFilter() && (
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
            )}
        </div>
    );
};
