import { ChangeEvent, useState } from "react";
import Papa from "papaparse";
import generatePassword from "generate-password";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { ClassroomCombobox } from "./classroom-combobox";
import { REGEX_FOR_EMAIL_VALIDATION, REGEX_FOR_PASSWORD_VALIDATION } from "@/utils/regex/user-regex-validations";
import { ClassroomT } from "@/types/classrooms";
import { useUsersStore } from "@/features/users/management";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { rolesLabelsOptions } from "@/features/auth/access-control/utils";
import BadgeSelector from "@/components/shared/badge-selector";
import { cn } from "@/lib/utils";
import { Role } from "@/features/auth/access-control/types";
import { User } from "@/features/users/profile";
import { Enrollment, useEnrollmentsManagementStore } from "@/features/enrollments";
import { useUserRolesManagementStore } from "@/features/auth/access-control/stores";

interface UserData {
    name: string;
    email: string;
    password?: string;
    status?: "success" | "error" | "warning";
    userRoles?: Role[];
    userClassrooms?: string[];
}

interface UserRow {
    nome?: string;
    Nome?: string;
    name?: string;
    Name?: string;
    email?: string;
    Email?: string;
}

type InsertManyUsersDialogProps = {
    excludeRoles?: Role[];
    classrooms?: ClassroomT[];
};

const InsertManyUsersDialog = ({ excludeRoles, classrooms }: InsertManyUsersDialogProps) => {
    const [open, setOpen] = useState(false);

    const [users, setUsers] = useState<UserData[]>([]);
    const [allUsersRole, setAllUsersRole] = useState<Role[]>([]);
    const [allUsersClassroom, setAllUsersClassroom] = useState<string[]>([]);
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [loading, setLoading] = useState(false);

    const { createNewUser } = useUsersStore();
    const { addUserRole } = useUserRolesManagementStore();
    const { createNewEnrollments } = useEnrollmentsManagementStore();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            Papa.parse(file, {
                header: true,
                transformHeader: (h) => h.trim().toLowerCase(),
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.error("Parsing errors:", results.errors);
                        setUsers([]);
                        return;
                    }

                    const parsedUsers = (results.data as UserRow[])
                        .map((row: UserRow) => ({
                            name: row.nome || row.Nome || row.name || row.Name || "",
                            email: row.email || row.Email || "",
                        }))
                        .filter((user) => user.name.trim() !== "" && user.email.trim() !== "" && user.email.includes("@"));

                    setUsers(parsedUsers);
                    setStage(1);
                },
                error: (error: Error) => {
                    console.error("Error in parsing file:", error);
                    setStage(0);
                    setUsers([]);
                },
            });
        } else {
            setUsers([]);
        }
    };

    const handleGenerateRandomPassword = () => {
        const randomPassword = () =>
            generatePassword.generate({
                length: 12,
                numbers: true,
                symbols: true,
                uppercase: true,
                lowercase: true,
                excludeSimilarCharacters: true,
                strict: true,
            });

        setUsers((users) =>
            users.map((user) => ({
                ...user,
                password: randomPassword(),
            })),
        );
    };

    const handleSetRolesForAll = (newRoleName: string) => {
        setUsers((users) =>
            users.map((user) => ({
                ...user,
                userRoles: [newRoleName as Role],
            })),
        );
        setAllUsersRole([newRoleName as Role]);
    };

    const handleSetClassroomsForAll = (newClassroom: string[]) => {
        setUsers((users) =>
            users.map((user) => ({
                ...user,
                userClassrooms: [...newClassroom],
            })),
        );
        setAllUsersClassroom([...newClassroom]);
    };

    const handleRemoveRolesForAll = () => {
        setUsers((users) =>
            users.map((user) => ({
                ...user,
                userRoles: [],
            })),
        );
        setAllUsersRole([]);
    };

    const handleSubmit = async () => {
        setLoading(true);

        for (const user of users) {
            try {
                if (!user.email || !user.name || !user.password) throw "fill the fields";

                if (user.name.split(" ").length < 2 || user.name.length < 5) throw "Invalid full name";
                if (!REGEX_FOR_EMAIL_VALIDATION.test(user.email)) throw "Invalid email";
                if (!REGEX_FOR_PASSWORD_VALIDATION.test(user.password)) throw "Invalid password";

                const data: Partial<User & { password: string }> = {
                    email: user.email,
                    password: user.password,
                    user_metadata: {
                        full_name: user.name,
                        user_email: user.email,
                    },
                };
                const userCreatedId = await createNewUser({ userData: data });

                if (userCreatedId) {
                    if (user.userRoles && user.userRoles.length > 0) {
                        const role = user.userRoles[0];
                        await addUserRole({ userId: userCreatedId, role });
                    }

                    if (classrooms && classrooms?.length > 0 && createNewEnrollments) {
                        if (user.userClassrooms && user.userClassrooms.length > 0) {
                            const newClassroomEnrollments: Omit<Enrollment, "short_id" | "mode">[] = user.userClassrooms.map(
                                (id) => ({
                                    user_id: userCreatedId,
                                    classroom_id: id,
                                }),
                            );
                            await createNewEnrollments({ enrollments: newClassroomEnrollments });
                        }
                    }
                }
                setUsers((prevUsers) => prevUsers.map((u) => (u.email === user.email ? { ...u, status: "success" } : u)));
            } catch (error) {
                console.error("Error", error);
                switch (error) {
                    case "role assign error":
                        toast.error("Erro ao atribuir o cargo!");
                        setUsers((prevUsers) =>
                            prevUsers.map((u) => (u.email === user.email ? { ...u, status: "warning" } : u)),
                        );
                        break;

                    default:
                        toast.error("Erro ao criar usuário! Tente novamente mais tarde.");

                        setUsers((prevUsers) => prevUsers.map((u) => (u.email === user.email ? { ...u, status: "error" } : u)));
                        break;
                }
            }
        }

        setLoading(false);
        setStage(2);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setUsers([]);
            setAllUsersRole([]);
            setAllUsersClassroom([]);
            setStage(0);
            setLoading(false);
        }

        setOpen(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger>
                <Button variant={"secondary"}>Inserir via CSV</Button>
            </DialogTrigger>
            <DialogContent className="w-max! max-w-[85vw]! overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Inserir usuários via CSV</DialogTitle>
                    <DialogDescription>
                        {stage === 0 && (
                            <>
                                Selecione um arquivo csv para carregar os dados dos usuários
                                <p>
                                    O arquivo deve conter as colunas: <b>Nome</b>, <b>Email</b>
                                </p>
                            </>
                        )}
                        {stage === 1 && "Revise os dados dos usuários a serem inseridos"}
                        {stage === 2 && "Resultados das inserções"}
                    </DialogDescription>
                </DialogHeader>

                {stage === 0 ? (
                    <div className="items-center gap-4 grid my-4 w-full">
                        <Label
                            htmlFor="csv-file"
                            className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-sm px-4 py-2 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring w-max h-9 [&_svg]:size-4 font-semibold text-primary-foreground text-sm whitespace-nowrap transition-colors cursor-pointer [&_svg]:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0"
                        >
                            Selecionar arquivo
                        </Label>
                        <Input id="csv-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </div>
                ) : (
                    <div className="flex my-4 border rounded-lg w-full max-h-96 overflow-y-auto">
                        <Table className="w-full h-full">
                            <TableHeader className="top-0 z-10 sticky bg-background shadow-sm">
                                <TableRow>
                                    <TableHead className="p-0! w-56 max-w-56 font-semibold truncate">
                                        <div className="flex justify-start items-center p-2 border-r w-full h-full">Nome</div>
                                    </TableHead>
                                    <TableHead className="p-0! w-56 max-w-56 font-semibold truncate">
                                        <div className="flex justify-start items-center p-2 border-r w-full h-full">Email</div>
                                    </TableHead>
                                    <TableHead className="p-0! w-56 max-w-56 font-semibold truncate">
                                        <div className="flex justify-between items-center gap-2 p-2 pr-2 border-r w-full h-full!">
                                            Senha
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="flex justify-center items-center py-1! w-10! h-max!"
                                                title="Gerar senha aleatória"
                                                onClick={() => handleGenerateRandomPassword()}
                                            >
                                                <Sparkles className="size-3!" />
                                            </Button>
                                        </div>
                                    </TableHead>

                                    <TableHead className="p-0! w-36 max-w-36 font-semibold truncate">
                                        <div className="flex justify-between items-center gap-2 p-2 pr-2 border-r w-full h-full!">
                                            {allUsersRole.length === 0 && "Cargo"}

                                            {allUsersRole.length === 1 ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex justify-between gap-2 cursor-pointer!"
                                                    onClick={handleRemoveRolesForAll}
                                                >
                                                    <p className="font-semibold">
                                                        {rolesLabelsOptions.find((role) => role.value === allUsersRole[0])
                                                            ?.label || allUsersRole[0]}
                                                    </p>

                                                    <X
                                                        className="size-3.5! text-destructive hover:text-destructive cursor-pointer!"
                                                        strokeWidth={2}
                                                    />
                                                </Badge>
                                            ) : (
                                                <BadgeSelector
                                                    items={rolesLabelsOptions}
                                                    excludeItens={allUsersRole.concat(excludeRoles || [])}
                                                    label="Adicionar cargo"
                                                    value={allUsersRole[0]}
                                                    onChange={handleSetRolesForAll}
                                                />
                                            )}
                                        </div>
                                    </TableHead>

                                    {classrooms && classrooms.length > 0 && (
                                        <TableHead className="p-0! w-36 max-w-36 font-semibold truncate">
                                            <div
                                                className={cn(
                                                    "flex justify-between items-center gap-2 p-2 pr-2 w-full h-full",
                                                    allUsersRole.length && "justify-center",
                                                )}
                                            >
                                                {allUsersClassroom.length === 0 && "Turmas"}
                                                {stage !== 2 ? (
                                                    <ClassroomCombobox
                                                        itens={classrooms?.map((c) => ({
                                                            label: c.name,
                                                            value: c.id,
                                                        }))}
                                                        value={allUsersClassroom}
                                                        onChange={handleSetClassroomsForAll}
                                                    />
                                                ) : (
                                                    <Badge variant="secondary">
                                                        {classrooms.find((c) => c.id === allUsersClassroom[0])?.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users &&
                                    users.map((user, index) =>
                                        user.status === "success" ? (
                                            <TableRow key={index} className={"bg-green-100!"}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.password}</TableCell>
                                                <TableCell>
                                                    {user.userRoles && user.userRoles.length > 0 && (
                                                        <Badge variant="secondary">
                                                            {rolesLabelsOptions.find(
                                                                (r) => user.userRoles && r.value === user.userRoles[0],
                                                            )?.label || user.userRoles[0]}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {user.userClassrooms && user.userClassrooms?.length > 0 && (
                                                        <Badge variant="secondary">
                                                            {classrooms?.find(
                                                                (c) => user?.userClassrooms && c.id === user?.userClassrooms[0],
                                                            )?.name || user.userClassrooms}{" "}
                                                            {user?.userClassrooms.length > 1 &&
                                                                `+${user?.userClassrooms.length - 1}`}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow
                                                key={index}
                                                className={
                                                    user.status === "error"
                                                        ? "bg-red-100!"
                                                        : user.status !== undefined
                                                          ? "bg-yellow-100!"
                                                          : ""
                                                }
                                            >
                                                <TableCell className="p-0!">
                                                    <div className="flex justify-center items-center p-2 border-r w-56 max-w-56 h-14!">
                                                        <Input
                                                            type="text"
                                                            value={user.name}
                                                            className="bg-background"
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((u, i) =>
                                                                        index === i ? { ...u, name: e.target.value } : u,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-0!">
                                                    <div className="flex justify-center items-center p-2 border-r w-56 max-w-56 h-14!">
                                                        <Input
                                                            type="email"
                                                            value={user.email}
                                                            className="bg-background"
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((u, i) =>
                                                                        index === i ? { ...u, email: e.target.value } : u,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-0!">
                                                    <div className="flex justify-center items-center p-2 border-r w-56 max-w-56 h-14!">
                                                        <Input
                                                            type="password"
                                                            value={user.password}
                                                            className="bg-background"
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((u, i) =>
                                                                        index === i ? { ...u, password: e.target.value } : u,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-0!">
                                                    <div className="flex justify-center items-center p-2 border-r w-36 max-w-36 h-14!">
                                                        {user.userRoles?.length ? (
                                                            user?.userRoles?.map((r, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                    className="flex justify-between gap-2 cursor-pointer!"
                                                                    onClick={() =>
                                                                        setUsers((prevUsers) =>
                                                                            prevUsers.map((u, i) =>
                                                                                index === i ? { ...u, userRoles: [] } : u,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <p className="font-semibold">
                                                                        {rolesLabelsOptions.find((role) => role.value === r)
                                                                            ?.label || r}
                                                                    </p>

                                                                    <X
                                                                        className="size-3.5! text-destructive hover:text-destructive cursor-pointer!"
                                                                        strokeWidth={2}
                                                                    />
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <div className="flex justify-center items-center w-full h-full">
                                                                <BadgeSelector
                                                                    items={rolesLabelsOptions}
                                                                    excludeItens={excludeRoles || []}
                                                                    label="Adicionar cargo"
                                                                    onChange={(role) =>
                                                                        setUsers((prevUsers) =>
                                                                            prevUsers.map((u, i) =>
                                                                                index === i
                                                                                    ? {
                                                                                          ...u,
                                                                                          userRoles: [role as Role],
                                                                                      }
                                                                                    : u,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {classrooms && classrooms.length > 0 && (
                                                    <TableCell className="p-0!">
                                                        <div className="flex justify-center items-center p-2 w-36 max-w-36 h-14!">
                                                            <ClassroomCombobox
                                                                itens={classrooms?.map((c) => ({
                                                                    label: c.name,
                                                                    value: c.id,
                                                                }))}
                                                                value={user?.userClassrooms || []}
                                                                onChange={(classrooms) =>
                                                                    setUsers((prevUsers) =>
                                                                        prevUsers.map((u, i) =>
                                                                            index === i
                                                                                ? {
                                                                                      ...u,
                                                                                      userClassrooms: [...classrooms],
                                                                                  }
                                                                                : u,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ),
                                    )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <DialogFooter className="flex! flex-row! justify-end gap-2">
                    {stage === 0 && (
                        <DialogClose>
                            <Button variant="outline" className="font-semibold text-muted-foreground">
                                Cancelar
                            </Button>
                        </DialogClose>
                    )}
                    {stage === 1 && (
                        <>
                            <Button
                                onClick={() => {
                                    setUsers([]);
                                    setStage(0);
                                }}
                                variant="outline"
                                className="font-semibold text-muted-foreground"
                            >
                                Trocar arquivo csv
                            </Button>
                            {users.length > 0 && (
                                <Button
                                    onClick={() => (!loading ? handleSubmit() : null)}
                                    className="font-semibold"
                                    disabled={loading}
                                >
                                    {loading && <LoaderCircle className="size-5 animate-spin" />}
                                    Inserir {users.length} usuários
                                </Button>
                            )}
                        </>
                    )}
                    {stage === 2 && (
                        <>
                            {users.filter((u) => u.status !== "success").length > 0 && (
                                <Button
                                    onClick={() => {
                                        setUsers((prev) => prev.filter((u) => u.status !== "success"));
                                        setStage(1);
                                    }}
                                    variant="outline"
                                    className="font-semibold text-muted-foreground"
                                >
                                    Usuários não inseridos
                                </Button>
                            )}

                            <DialogClose>
                                <Button className="font-semibold">Finalizar</Button>
                            </DialogClose>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InsertManyUsersDialog;
