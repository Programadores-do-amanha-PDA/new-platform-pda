"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, FilePen, MoreHorizontal, Trash2 } from "lucide-react";

import { useUsersStore } from "@/features/dashboard/shared/users/store";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuthUserWithProfile, Profile } from "@/features/dashboard/profile";

import { ClassroomProjectDelivery, ClassroomProjectTypeT } from "../../types";
import { Badge } from "@/components/ui/badge";
import { useClassroomProjectDeliveriesStore } from "../../stores/deliveries";

const createColumns = (
    projectType: ClassroomProjectTypeT,
    users: AuthUserWithProfile[],
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

    // Adicionar colunas específicas para mini projects
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
                const user = users.find((user) => user.id === delivery.user_id);
                return (
                    <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                        <span className="font-medium">{user?.email || "Usuário não encontrado"}</span>
                    </div>
                );
            },
            accessorFn: (row) => {
                // Permitir busca por nome e email do usuário
                const user = users.find((user) => user.id === row.user_id);
                if (user?.profile) {
                    const searchTerms = [user.profile.full_name || "", user?.email || "", user.email || ""].filter(
                        (term) => term.length > 0,
                    );
                    return searchTerms.join(" ");
                }
                return "";
            },
        });
    } else if (projectType === "end_module_english_project" || projectType === "end_module_project") {
        columns.push({
            accessorKey: "members",
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
                let member: AuthUserWithProfile[] = [];

                if (delivery.members_id && Array.isArray(delivery.members_id)) {
                    const user = users.find((user) => user.id === delivery.user_id);

                    member = delivery.members_id
                        .map((memberId) => users.find((user) => user.id === memberId))
                        .filter((member): member is AuthUserWithProfile => member !== undefined);

                    if (user?.profile) {
                        member.unshift(user);
                    }
                }
                // Fallback para members (projetos antigos) - usar valores diretos
                else if (delivery.members && Array.isArray(delivery.members)) {
                    memberNames = delivery.members; // Manter os valores originais de members
                }

                return (
                    <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                        {member.length > 0 ? (
                            member.map((profile, index) => (
                                <Badge key={index} variant="outline" className="mr-2">
                                    {profile.email || "Membro desconhecido"}
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

                    const userAuthor = users.find((user) => user.id === row.user_id);
                    if (userAuthor?.profile) {
                        memberSearchTerms.push(userAuthor.profile.full_name || "", userAuthor?.email || "");
                    }

                    row.members_id.forEach((memberId) => {
                        const user = users.find((user) => user.id === memberId);
                        if (user?.profile) {
                            memberSearchTerms.push(user.profile.full_name || "", user?.email || "");
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

export function DeliveryDataTable({
    deliveries,
    projectType,
    classroomId,
    projectId,
}: {
    deliveries: ClassroomProjectDelivery[];
    projectType: ClassroomProjectTypeT;
    classroomId: string;
    projectId: string;
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { users } = useUsersStore();
    const { deleteDelivery } = useClassroomProjectDeliveriesStore();
    const classroomUsers = users.filter((user) =>
        user.profile?.enrollments?.some((enrollment) => enrollment.classroom_id === classroomId),
    );

    const columns = React.useMemo(
        () => createColumns(projectType, classroomUsers, (deliveryId) => deleteDelivery(deliveryId, classroomId)),
        [projectType, users, classroomId, classroomUsers],
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

    const filterColumnId = projectType === "mini_project" ? "user_id" : "members";

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Procurando por alguém?"
                    value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                        console.log("Filter change:", {
                            filterColumnId,
                            value: event.target.value,
                            columnExists: !!table.getColumn(filterColumnId),
                        });
                        table.getColumn(filterColumnId)?.setFilterValue(event.target.value);
                    }}
                    className="max-w-sm"
                />
                <Button asChild>
                    <Link
                        href={`/dashboard/classrooms/${classroomId}/projects/${projectId}/corrections`}
                        className="font-semibold hover:underline"
                    >
                        <FilePen className="w-4 h-4" />
                        Area de correção
                    </Link>
                </Button>
            </div>
            <div className="flex border rounded-lg w-full h-full overflow-hidden">
                <Table>
                    <TableHeader className="top-0 z-10 sticky bg-white p-0!">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="shadow p-0! rounded-t-lg! overflow-hidden">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="p-0!">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="p-0! border-0! h-full!"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-0! border-0! h-full!">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhuma entrega encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex justify-end items-center space-x-2 py-4">
                    <div className="flex-1 text-muted-foreground text-sm">
                        {`${table.getFilteredSelectedRowModel().rows.length} linhas selecionadas.`}
                    </div>
                </div>
            )}
        </div>
    );
}
