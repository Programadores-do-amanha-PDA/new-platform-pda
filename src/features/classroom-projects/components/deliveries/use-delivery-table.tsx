import * as React from "react";
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { Profile } from "@/features/users/profile/types/profile";
import { ClassroomProjectType } from "../../types/projects/project";
import { ClassroomProjectDelivery } from "../../types/deliveries/delivery";

/**
 * Creates column definitions for the delivery data table based on project type.
 *
 * @param projectType - The type of classroom project (mini_project, end_module_project, etc.)
 * @param usersProfiles - Array of usersProfiles to match against delivery user IDs
 * @param deleteDelivery - Callback function to handle delivery deletion
 * @returns Array of column definitions for the table
 */
const createColumns = (
    projectType: ClassroomProjectType,
    usersProfiles: Profile[],
    deleteDelivery: (deliveryId: string) => void,
): ColumnDef<ClassroomProjectDelivery>[] => {
    const columns: ColumnDef<ClassroomProjectDelivery>[] = [
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
    ];

    // Add specific columns for mini projects
    if (projectType === "mini_project") {
        columns.push({
            accessorKey: "user_id",
            header: ({ column }) => {
                return (
                    <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                        <p>Entregue por</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const delivery = row.original;
                const user = usersProfiles.find((user) => user.id === delivery.user_id);
                return (
                    <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                        <span className="font-medium">{user?.email || "Usuário não encontrado"}</span>
                    </div>
                );
            },
            accessorFn: (row) => {
                // Allow search by user name and email
                const user = usersProfiles.find((user) => user.id === row.user_id);
                if (user) {
                    const searchTerms = [user.full_name || "", user?.email || "", user.email || ""].filter(
                        (term) => term.length > 0,
                    );
                    return searchTerms.join(" ");
                }
                return "";
            },
        });
    } else if (projectType === "end_module_english_project" || projectType === "end_module_project") {
        columns.push({
            accessorKey: "membersProfiles",
            header: ({ column }) => {
                return (
                    <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                        <p>Membros</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const delivery = row.original;
                let memberNames: string[] = [];
                let membersProfiles: Profile[] = [];

                if (delivery.members_id && Array.isArray(delivery.members_id)) {
                    const user = usersProfiles.find((user) => user.id === delivery.user_id);

                    membersProfiles = delivery.members_id
                        .map((memberId) => usersProfiles.find((user) => user.id === memberId))
                        .filter((member): member is Profile => member !== undefined);

                    if (user) {
                        membersProfiles.unshift(user);
                    }
                }
                // Fallback for membersProfiles (legacy projects) - use direct values
                else if (delivery.members && Array.isArray(delivery.members)) {
                    memberNames = delivery.members;
                }

                return (
                    <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                        {membersProfiles.length > 0 ? (
                            membersProfiles.map((member, index) => (
                                <Badge key={index} variant="outline" className="mr-2">
                                    {member.email || "Membro desconhecido"}
                                </Badge>
                            ))
                        ) : (
                            <span className="font-medium">
                                {memberNames.length > 0 ? memberNames.join(", ") : "Sem membros"}
                            </span>
                        )}
                    </div>
                );
            },
            accessorFn: (row) => {
                if (row.members_id && Array.isArray(row.members_id)) {
                    const memberSearchTerms: string[] = [];

                    const userAuthor = usersProfiles.find((user) => user.id === row.user_id);
                    if (userAuthor) {
                        memberSearchTerms.push(userAuthor.full_name || "", userAuthor?.email || "");
                    }

                    row.members_id.forEach((memberId) => {
                        const user = usersProfiles.find((user) => user.id === memberId);
                        if (user) {
                            memberSearchTerms.push(user.full_name || "", user?.email || "");
                        }
                    });

                    return memberSearchTerms.filter((term) => term.length > 0).join(" ");
                } else if (row.members && Array.isArray(row.members)) {
                    return row.members.join(" ");
                }
                return "";
            },
        });
    }

    columns.push(
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                        <p>Entregue em</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                const formatted = new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                }).format(date);

                return (
                    <div className="flex justify-center items-center p-2 border-r border-b w-full h-full">
                        <span>{formatted}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "lastCorrection",
            header: ({ column }) => {
                return (
                    <div className="flex justify-between items-center gap-4 px-2 border-r w-full h-full">
                        <p>Corrigido em</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                if (!row.getValue("lastCorrection")) {
                    return (
                        <div className="flex justify-center items-center p-2 border-r border-b w-full h-full">
                            <span className="text-muted-foreground">Correção pendente</span>
                        </div>
                    );
                }
                const date = new Date(row.getValue("lastCorrection"));
                const formatted = new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                }).format(date);

                return (
                    <div className="flex justify-center items-center p-2 border-r border-b w-full h-full">
                        <span>{formatted}</span>
                    </div>
                );
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
            cell: ({ row }) => {
                const delivery = row.original;

                return (
                    <div className="flex justify-center items-center p-2 border-b w-full h-full">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="ghost" className="p-0 w-8 h-8">
                                    <span className="sr-only">Abrir menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => deleteDelivery(delivery.id)} variant="destructive">
                                    <Trash2 />
                                    Deletar Entrega
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    );

    return columns;
};

interface UseDeliveryTableParams {
    readonly deliveries: ClassroomProjectDelivery[];
    readonly projectType: ClassroomProjectType;
    readonly classroomUsers: Profile[];
    readonly onDeleteDelivery: (deliveryId: string) => void;
}

/**
 * Custom hook to manage delivery table state and configuration.
 * Encapsulates table sorting, filtering, column visibility, and row selection logic.
 *
 * @param params - Configuration parameters for the delivery table
 * @param params.deliveries - Array of classroom project deliveries to display
 * @param params.projectType - Type of project determining column structure
 * @param params.classroomUsers - Filtered usersProfiles enrolled in the classroom
 * @param params.onDeleteDelivery - Callback to handle delivery deletion
 * @returns Table instance and filter column ID for search functionality
 *
 * @example
 * const { table, filterColumnId } = useDeliveryTable({
 *   deliveries,
 *   projectType: 'mini_project',
 *   classroomUsers,
 *   onDeleteDelivery: handleDelete
 * });
 */
export const useDeliveryTable = ({ deliveries, projectType, classroomUsers, onDeleteDelivery }: UseDeliveryTableParams) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns = React.useMemo(
        () => createColumns(projectType, classroomUsers, onDeleteDelivery),
        [projectType, classroomUsers, onDeleteDelivery],
    );

    const table = useReactTable({
        data: deliveries,
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
                pageSize: deliveries?.length || 1000,
            },
        },
    });

    const filterColumnId = projectType === "mini_project" ? "user_id" : "membersProfiles";

    return { table, filterColumnId, columns } as const;
};
