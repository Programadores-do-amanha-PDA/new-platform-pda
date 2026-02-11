"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Profile } from "@/features/users/profile/types/profile";

export const usersColumns: ColumnDef<Profile>[] = [
    {
        accessorKey: "full_name",
        header: ({ column }) => {
            const sortState = column.getIsSorted();
            return (
                <div className="flex justify-between items-center px-2 border-r border-b w-full h-[133.5px]">
                    <p className="font-semibold text-left">Usuário</p>
                    <Button
                        variant="ghost"
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
        },
        cell: ({ row }) => {
            const user = row.original as Profile;
            return (
                <div className="flex flex-row justify-start items-center gap-2 bg-background group-hover/row:bg-muted/50! px-2 border-r border-b w-full h-[57px]">
                    <Avatar>
                        <AvatarFallback>
                            {user.full_name
                                .split(" ")
                                .filter((_, i) => i < 2)
                                .map((word) => word[0].toUpperCase())
                                .join("") || "U"}
                        </AvatarFallback>
                        <AvatarImage src={user.avatar_url || ""} />
                    </Avatar>
                    <div className="flex flex-col justify-center w-full truncate lowercase">
                        <p className="font-bold text-sm capitalize">{user.full_name}</p>
                        <p>{user.email}</p>
                    </div>
                </div>
            );
        },
        sortingFn: (rowA, rowB) => {
            const nameA = rowA.original?.full_name?.toLowerCase() || "";
            const nameB = rowB.original?.full_name?.toLowerCase() || "";
            return nameA?.localeCompare(nameB);
        },
        filterFn: (row, filterValue) => {
            const user = row.original as Profile;
            const userEmail = user?.email || "";
            const searchTerm = filterValue.toLowerCase();

            return user.full_name.toLowerCase().includes(searchTerm) || userEmail.toLowerCase().includes(searchTerm);
        },
    },
];
