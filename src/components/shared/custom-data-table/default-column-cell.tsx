import { cn } from "@/lib/utils";

export type DefaultColumnCellProps = {
    children: React.ReactNode;
    isLastElementOnVertical?: boolean;
    isLastElementOnHorizontal?: boolean;
    className?: string;
};

export const DefaultRowCell = ({
    children,
    isLastElementOnVertical,
    isLastElementOnHorizontal,
    className,
}: DefaultColumnCellProps) => {
    return (
        <div
            className={
                (cn("w-full h-full flex justify-center items-center p-2  min-w-[120px]"),
                isLastElementOnVertical ? "border-b-0" : "border-b",
                isLastElementOnHorizontal ? "border-r-0" : "border-r",
                className)
            }
        >
            <span className="font-medium">{children}</span>
        </div>
    );
};
