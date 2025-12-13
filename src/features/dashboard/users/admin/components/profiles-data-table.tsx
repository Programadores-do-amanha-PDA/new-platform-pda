"use client";
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
import { cn } from "@/lib/utils";
import { AuthUserWithProfileT, ProfileT, RolesT } from "@/types/auth";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";

import { UserMetadata } from "@supabase/supabase-js";
import { DataTable } from "../../components/data-table";
import { useUsersStore } from "@/stores/modules/users/users-store";
import InsertManyUsersDialog from "../../components/insert-many-users-dialog";
import UserSheetData from "../../components/user-sheet-data";
import BulkPasswordResetButton from "../../components/bulk-password-reset-button";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import { useClassroomStore } from "@/features/dashboard/classrooms/stores/classrooms";
import BulkEmailVerificationButton from "../../components/bulk-email-verification-button";
import BulkUsersCredentialsButton from "../../components/bulk-users-credentials-button";

type ProfilesDataTableProps = {
    excludeRoles?: RolesT[];
    defaultRoleValue?: RolesT;
    loading: boolean;
};

const ProfilesDataTable = ({ loading, excludeRoles }: ProfilesDataTableProps) => {
    const { classrooms } = useClassroomStore();
    const { users, deleteUser } = useUsersStore();

    const columns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
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
                                .getValue<ProfileT>("profile")
                                .full_name.split(" ")
                                .filter((word, i) => i < 2)
                                .map((word) => word[0].toUpperCase())
                                .join("") || "U"}
                        </AvatarFallback>
                        <AvatarImage src={row.getValue<ProfileT>("profile").avatar_url || ""} />
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
            cell: ({ row }) => (
                <div className="flex flex-col w-full truncate lowercase">
                    <p className="font-bold text-sm capitalize">{row.getValue<ProfileT>("profile").full_name}</p>
                    <p>{row.getValue<ProfileT>("profile").email}</p>
                </div>
            ),
            sortingFn: (rowA, rowB) => {
                const nameA = rowA.original?.profile?.full_name?.toLowerCase() || "";
                const nameB = rowB.original?.profile?.full_name?.toLowerCase() || "";
                return nameA?.localeCompare(nameB);
            },
            filterFn: (row, id, filterValue) => {
                const profile = row.getValue(id) as ProfileT;
                const searchTerm = filterValue.toLowerCase();

                return profile.full_name.toLowerCase().includes(searchTerm) || profile.email.toLowerCase().includes(searchTerm);
            },
        },
        {
            accessorKey: "user_roles",
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
                return (
                    <div className="flex justify-center w-full align-center">
                        {row.getValue<ProfileT>("profile").user_roles?.map((userRole, i) => (
                            <Badge variant="outline" className="mx-auto!" key={i}>
                                {rolesLabelsOptions.find((role) => role.value === userRole.role)?.label || userRole.role}
                            </Badge>
                        ))}
                    </div>
                );
            },
            sortingFn: (rowA, rowB) => {
                const rolesA = rowA.original?.profile?.user_roles || [];
                const rolesB = rowB.original?.profile?.user_roles || [];

                const rolesStrA = rolesA
                    .map((r) => r.role)
                    .sort()
                    .join(",");
                const rolesStrB = rolesB
                    .map((r) => r.role)
                    .sort()
                    .join(",");

                return rolesStrA.localeCompare(rolesStrB);
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
                        {row.getValue<UserMetadata>("user_metadata")?.email_verified === true ? "Confirmado" : "Não confirmado"}
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

    const actionsColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] = [
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
                            <UserSheetData mode="edit" currentUser={user} excludeRoles={excludeRoles} />
                            {user.id && (
                                <Button
                                    variant="ghost"
                                    className="justify-start items-start px-2! w-full h-max text-start cursor-pointer"
                                    onClick={() => user.id && deleteUser({ userId: user.id })}
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

    const classroomColumns: ColumnDef<Partial<AuthUserWithProfileT>>[] =
        classrooms && classrooms.length > 0
            ? [
                  {
                      id: "classrooms",
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
                                      Turmas
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
                              <div className="flex justify-center w-full align-center">
                                  {profile?.classrooms?.map((classroom, i) => (
                                      <Badge variant="outline" className="mx-auto!" key={`${i}-${classroom}`}>
                                          {classrooms?.find((c) => c.id === classroom.classroom_id)?.name || ""}
                                      </Badge>
                                  ))}
                              </div>
                          );
                      },
                      sortingFn: (rowA, rowB) => {
                          const classroomsA = rowA.original?.profile?.classrooms || [{ classroom_id: "" }];
                          const classroomsB = rowB.original?.profile?.classrooms || [{ classroom_id: "" }];

                          const classroomsStrA = classroomsA
                              .map((c) => classrooms?.find((cr) => cr.id === c.classroom_id)?.name)
                              .sort()
                              .join(",");
                          const classroomsStrB = classroomsB
                              .map((c) => classrooms?.find((cr) => cr.id === c.classroom_id)?.name)
                              .sort()
                              .join(",");

                          return classroomsStrA.localeCompare(classroomsStrB);
                      },
                  },
              ]
            : [];

    const headerOptions = (selectedUsers: AuthUserWithProfileT[], clearSelection?: () => void) => (
        <div className="flex gap-4">
            <BulkUsersCredentialsButton selectedUsers={selectedUsers} />
            <BulkEmailVerificationButton selectedUsers={selectedUsers} onComplete={clearSelection} />
            <BulkPasswordResetButton selectedUsers={selectedUsers} onComplete={clearSelection} />

            <InsertManyUsersDialog excludeRoles={excludeRoles} classrooms={classrooms} />

            <UserSheetData mode="new" excludeRoles={excludeRoles} />
        </div>
    );

    const allColumns = [...columns, ...classroomColumns, ...actionsColumns];

    return <DataTable columns={allColumns} data={users} loading={loading} headerRightOptions={headerOptions} />;
};

export default ProfilesDataTable;
