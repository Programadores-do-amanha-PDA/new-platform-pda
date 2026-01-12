"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipWrapper } from "@/components/shared/tooltip-wrapper";

import { UserMetadata } from "@supabase/supabase-js";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import { AuthUserWithProfile, Profile } from "@/features/dashboard/profile";
import { Role } from "@/types";
import { ClassroomT } from "@/types/classrooms";
import UserModalData from "../components/user-modal-data";

interface UseUsersColumnsProps {
    readonly excludeRoles?: Role[];
    readonly classrooms?: ClassroomT[];
    readonly deleteUser: (params: { id: string }) => void;
}

/**
 * Custom hook that generates all table columns for the users data table.
 * This hook manages the creation of base columns, action columns, and classroom columns.
 *
 * @param excludeRoles - Roles to exclude from the role selector
 * @param classrooms - Array of classrooms for enrollment display
 * @param deleteUser - Function to delete a user
 * @returns An object containing all columns arrays: { columns, actionsColumns, classroomColumns, allColumns }
 */
export function useUsersColumns({ excludeRoles, classrooms, deleteUser }: UseUsersColumnsProps) {
    const defaultColumns: ColumnDef<AuthUserWithProfile>[] = useMemo(() => {
        return [
            {
                id: "select",
                header: ({ table }) => (
                    <div className="flex justify-center items-center w-full">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                            onCheckedChange={(value: unknown) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                            className="mx-2"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center items-center w-full">
                        <Avatar className="group relative">
                            <AvatarFallback>
                                {row
                                    .getValue<Profile>("profile")
                                    .full_name.split(" ")
                                    .filter((word, i) => i < 2)
                                    .map((word) => word[0].toUpperCase())
                                    .join("") || "U"}
                            </AvatarFallback>
                            <AvatarImage src={row.getValue<Profile>("profile").avatar_url || ""} />
                            <div
                                className={cn(
                                    "hidden top-0 right-0 bottom-0 left-0 absolute group-hover:flex justify-center items-center bg-black/55 m-auto rounded-full",
                                    row.getIsSelected() && "flex!",
                                )}
                            >
                                <Checkbox
                                    checked={row.getIsSelected()}
                                    onCheckedChange={(value: unknown) => row.toggleSelected(!!value)}
                                    aria-label="Select row"
                                    className="size-5"
                                />
                            </div>
                        </Avatar>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "profile",
                header: ({ column }) => {
                    const sortState = column.getIsSorted();
                    return (
                        <div className="flex justify-start items-center w-full">
                            <Button
                                variant="ghost"
                                className="px-2 font-semibold text-left"
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
                                Usuário
                                {sortState === "asc" ? (
                                    <ArrowUp className="stroke-primary" />
                                ) : sortState === "desc" ? (
                                    <ArrowDown className="stroke-primary" />
                                ) : (
                                    <ArrowUpDown />
                                )}
                            </Button>
                        </div>
                    );
                },
                cell: ({ row }) => {
                    const user = row.original as AuthUserWithProfile;
                    return (
                        <div className="flex flex-col w-full truncate lowercase">
                            <p className="font-bold text-sm capitalize">{user.profile.full_name}</p>
                            <p>{user.email}</p>
                        </div>
                    );
                },
                sortingFn: (rowA, rowB) => {
                    const nameA = rowA.original?.profile?.full_name?.toLowerCase() || "";
                    const nameB = rowB.original?.profile?.full_name?.toLowerCase() || "";
                    return nameA?.localeCompare(nameB);
                },
                filterFn: (row, id, filterValue) => {
                    const user = row.original as AuthUserWithProfile;
                    const userEmail = user?.email || "";
                    const searchTerm = filterValue.toLowerCase();

                    return (
                        user.profile.full_name.toLowerCase().includes(searchTerm) ||
                        userEmail.toLowerCase().includes(searchTerm)
                    );
                },
            },
            {
                accessorKey: "user_role",
                header: ({ column }) => {
                    const sortState = column.getIsSorted();
                    return (
                        <div className="flex justify-center w-full align-center">
                            <Button
                                variant="ghost"
                                className="px-2 font-semibold text-center"
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
                                Cargo
                                {sortState === "asc" ? (
                                    <ArrowUp className="stroke-primary" />
                                ) : sortState === "desc" ? (
                                    <ArrowDown className="stroke-primary" />
                                ) : (
                                    <ArrowUpDown />
                                )}
                            </Button>
                        </div>
                    );
                },
                cell: ({ row }) => {
                    const userRole = row.original.profile?.user_role;
                    return (
                        <div className="flex justify-center w-full align-center">
                            <Badge variant="outline" className="mx-auto!">
                                {rolesLabelsOptions.find((role) => role.value === userRole?.role)?.label}
                            </Badge>
                        </div>
                    );
                },
                sortingFn: (rowA, rowB) => {
                    const rolesA = rowA.original?.profile?.user_role.role || "";
                    const rolesB = rowB.original?.profile?.user_role.role || "";

                    return rolesA.localeCompare(rolesB);
                },
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => {
                    const sortState = column.getIsSorted();

                    return (
                        <div className="flex justify-center items-center w-full">
                            <Button
                                variant="ghost"
                                className="px-2 font-semibold text-left"
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
                                Criado em
                                {sortState === "asc" ? (
                                    <ArrowUp className="stroke-primary" />
                                ) : sortState === "desc" ? (
                                    <ArrowDown className="stroke-primary" />
                                ) : (
                                    <ArrowUpDown />
                                )}
                            </Button>
                        </div>
                    );
                },
                cell: ({ row }) => {
                    const createdAt = row.getValue("created_at") as string;
                    const date = new Date(createdAt);
                    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}/${date.getFullYear()}`;

                    return <div className="flex justify-center items-center w-full">{formattedDate}</div>;
                },
            },
            {
                accessorKey: "user_metadata",
                header: ({ column }) => {
                    const sortState = column.getIsSorted();

                    return (
                        <div className="flex justify-center items-center w-full">
                            <Button
                                variant="ghost"
                                className="px-2 font-semibold text-left"
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
                                Email confirmado?
                                {sortState === "asc" ? (
                                    <ArrowUp className="stroke-primary" />
                                ) : sortState === "desc" ? (
                                    <ArrowDown className="stroke-primary" />
                                ) : (
                                    <ArrowUpDown />
                                )}
                            </Button>
                        </div>
                    );
                },
                cell: ({ row }) => (
                    <div className="flex justify-center items-center w-full">
                        <Badge variant="outline" className="m-1! truncate">
                            {row.getValue<UserMetadata>("user_metadata")?.email_verified === true
                                ? "Confirmado"
                                : "Não confirmado"}
                        </Badge>
                    </div>
                ),
            },
            {
                accessorKey: "email_confirmed_at",
                header: ({ column }) => {
                    const sortState = column.getIsSorted();

                    return (
                        <div className="flex justify-center items-center w-full">
                            <Button
                                variant="ghost"
                                className="px-2 font-semibold text-left"
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
                                Email confirmado em
                                {sortState === "asc" ? (
                                    <ArrowUp className="stroke-primary" />
                                ) : sortState === "desc" ? (
                                    <ArrowDown className="stroke-primary" />
                                ) : (
                                    <ArrowUpDown />
                                )}
                            </Button>
                        </div>
                    );
                },
                cell: ({ row }) => {
                    const emailConfirmedAt = row.getValue("email_confirmed_at") as string;
                    const date = new Date(emailConfirmedAt);
                    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}/${date.getFullYear()}`;
                    return (
                        <div className="flex justify-center items-center w-full lowercase">
                            {formattedDate !== "NaN/NaN/NaN" ? formattedDate : "--"}
                        </div>
                    );
                },
            },
        ];
    }, []);

    const actionsColumns: ColumnDef<AuthUserWithProfile>[] = useMemo(() => {
        return [
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="ghost" className="p-0 w-8 h-8">
                                    <span className="sr-only">Abrir Menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="font-bold">Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <UserModalData mode="edit" currentUser={user} excludeRoles={excludeRoles} />
                                {user.id && (
                                    <Button
                                        variant="ghost"
                                        className="justify-start items-start px-2! w-full h-max text-start cursor-pointer"
                                        onClick={() => user.id && deleteUser({ id: user.id })}
                                    >
                                        Deletar
                                    </Button>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, [deleteUser, excludeRoles]);

    const classroomColumns: ColumnDef<AuthUserWithProfile>[] = useMemo(() => {
        if (!classrooms || classrooms.length === 0) {
            return [];
        }

        return [
            {
                id: "enrollments",
                header: ({ column }) => {
                    const sortState = column.getIsSorted();
                    return (
                        <div className="flex justify-center w-full align-center">
                            <Button
                                variant="ghost"
                                className="px-2 font-semibold text-center"
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
                                IDs
                                {sortState === "asc" ? (
                                    <ArrowUp className="stroke-primary" />
                                ) : sortState === "desc" ? (
                                    <ArrowDown className="stroke-primary" />
                                ) : (
                                    <ArrowUpDown />
                                )}
                            </Button>
                        </div>
                    );
                },
                cell: ({ row }) => {
                    const { profile } = row.original;
                    return (
                        <div className="flex flex-wrap gap-1 justify-center w-full align-center">
                            {profile?.enrollments?.map((enrollment, i) => (
                                <TooltipWrapper
                                    key={`${i}-${enrollment.short_id}`}
                                    title={classrooms?.find((c) => c.id === enrollment.classroom_id)?.name || ""}
                                >
                                    <Badge variant="outline" className="text-muted-foreground font-semibold">
                                        {enrollment.short_id}
                                    </Badge>
                                </TooltipWrapper>
                            ))}
                        </div>
                    );
                },
                sortingFn: (rowA, rowB) => {
                    const enrollmentsA = rowA.original?.profile?.enrollments || [{ classroom_id: "" }];
                    const enrollmentsB = rowB.original?.profile?.enrollments || [{ classroom_id: "" }];

                    const enrollmentsStrA = enrollmentsA
                        .map((c) => classrooms?.find((cr) => cr.id === c.classroom_id)?.name)
                        .sort()
                        .join(",");
                    const enrollmentsStrB = enrollmentsB
                        .map((c) => classrooms?.find((cr) => cr.id === c.classroom_id)?.name)
                        .sort()
                        .join(",");

                    return enrollmentsStrA.localeCompare(enrollmentsStrB);
                },
            },
        ];
    }, [classrooms]);

    const allColumns = useMemo(() => {
        return [...defaultColumns, ...classroomColumns, ...actionsColumns];
    }, [defaultColumns, classroomColumns, actionsColumns]);

    return {
        defaultColumns,
        actionsColumns,
        classroomColumns,
        allColumns,
    };
}
