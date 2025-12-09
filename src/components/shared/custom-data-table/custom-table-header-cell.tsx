import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ITableHeaderItemWithCustomItemProps {
    children: React.ReactNode;
    customIcon?: React.ReactNode;
    handleIconClick?: () => void;
    className?: string;
}

export const TableHeaderItemWithCustomItem = ({
    children,
    handleIconClick,
    customIcon,
    className,
}: ITableHeaderItemWithCustomItemProps) => {
    return (
        <div className={cn("w-full min-h-12 max-h-12 flex justify-between items-center border-r border-b px-2", className)}>
            <p className="text-left font-semibold">{children}</p>
            {customIcon && (
                <Button variant="ghost" size="icon" onClick={handleIconClick}>
                    {customIcon}
                </Button>
            )}
        </div>
    );
};
