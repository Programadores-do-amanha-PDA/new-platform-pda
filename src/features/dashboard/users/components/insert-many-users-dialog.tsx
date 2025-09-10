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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { ClassroomCombobox } from "./classroom-combobox";
import { emailRegex, passwordRegex } from "@/utils/regex/users";
import { AuthUserWithProfileT, RolesT, UserClassroomT } from "@/types/auth";
import { ClassroomT } from "@/types/classrooms";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { useRolesStore } from "@/stores/modules/users/user-roles-store";
import { useUserClassroomsStore } from "@/stores/modules/users/user-classrooms-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import BadgeSelector from "@/components/shared/badge-selector";
import { cn } from "@/lib/utils";

interface UserData {
  name: string;
  email: string;
  password?: string;
  status?: "success" | "error" | "warning";
  userRoles?: RolesT[];
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
  excludeRoles?: RolesT[];
  classrooms?: ClassroomT[];
};

const InsertManyUsersDialog = ({
  excludeRoles,
  classrooms,
}: InsertManyUsersDialogProps) => {
  const [open, setOpen] = useState(false);

  const [users, setUsers] = useState<UserData[]>([]);
  const [allUsersRole, setAllUsersRole] = useState<RolesT[]>([]);
  const [allUsersClassroom, setAllUsersClassroom] = useState<string[]>([]);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(false);

  const { createNewUser } = useUsersStore();
  const { addUserRole } = useRolesStore();
  const { createUserClassrooms } = useUserClassroomsStore();

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
            .filter(
              (user) =>
                user.name.trim() !== "" &&
                user.email.trim() !== "" &&
                user.email.includes("@")
            );

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
      }))
    );
  };

  const handleSetRolesForAll = (newRoleName: string) => {
    setUsers((users) =>
      users.map((user) => ({
        ...user,
        userRoles: [newRoleName as RolesT],
      }))
    );
    setAllUsersRole([newRoleName as RolesT]);
  };

  const handleSetClassroomsForAll = (newClassroom: string[]) => {
    setUsers((users) =>
      users.map((user) => ({
        ...user,
        userClassrooms: [...newClassroom],
      }))
    );
    setAllUsersClassroom([...newClassroom]);
  };

  const handleRemoveRolesForAll = () => {
    setUsers((users) =>
      users.map((user) => ({
        ...user,
        userRoles: [],
      }))
    );
    setAllUsersRole([]);
  };

  const handleSubmit = async () => {
    setLoading(true);

    for (const user of users) {
      try {
        if (!user.email || !user.name || !user.password)
          throw "fill the fields";

        if (user.name.split(" ").length < 2 || user.name.length < 5)
          throw "Invalid full name";
        if (!emailRegex.test(user.email)) throw "Invalid email";
        if (!passwordRegex.test(user.password)) throw "Invalid password";

        const data: Partial<AuthUserWithProfileT & { password: string }> = {
          email: user.email,
          password: user.password,
          user_metadata: {
            full_name: user.name,
            user_email: user.email,
          },
        };
        const userCreatedId = await createNewUser(data);

        if (userCreatedId) {
          if (user.userRoles && user.userRoles.length > 0) {
            const role = user.userRoles[0];
            await addUserRole(userCreatedId, role);
          }

          if (classrooms && classrooms?.length > 0 && createUserClassrooms) {
            if (user.userClassrooms && user.userClassrooms.length > 0) {
              const uClassroom: UserClassroomT[] = user.userClassrooms.map(
                (id) => ({
                  user_id: userCreatedId,
                  classroom_id: id,
                })
              );
              await createUserClassrooms(uClassroom);
            }
          }
        }
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === user.email ? { ...u, status: "success" } : u
          )
        );
      } catch (error) {
        console.error("Error", error);
        switch (error) {
          case "role assign error":
            toast.error("Erro ao atribuir o cargo!");
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.email === user.email ? { ...u, status: "warning" } : u
              )
            );
            break;

          default:
            toast.error("Erro ao criar usuário! Tente novamente mais tarde.");

            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.email === user.email ? { ...u, status: "error" } : u
              )
            );
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
      <DialogContent className="max-w-[85vw]! w-max! overflow-hidden">
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
          <div className="grid w-full items-center gap-4 my-4">
            <Label
              htmlFor="csv-file"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2 w-max cursor-pointer"
            >
              Selecionar arquivo
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full max-h-96 flex overflow-y-auto my-4 border rounded-lg">
            <Table className="w-full h-full">
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="max-w-56 w-56 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-start items-center border-r ">
                      Nome
                    </div>
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-start items-center border-r">
                      Email
                    </div>
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate font-semibold p-0!">
                    <div className="w-full h-full! p-2 flex items-center justify-between pr-2 gap-2 border-r">
                      Senha
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex items-center justify-center py-1! h-max! w-10!"
                        title="Gerar senha aleatória"
                        onClick={() => handleGenerateRandomPassword()}
                      >
                        <Sparkles className="size-3!" />
                      </Button>
                    </div>
                  </TableHead>

                  <TableHead className="max-w-36 w-36 p-0! truncate font-semibold">
                    <div className="w-full h-full! p-2 flex items-center justify-between pr-2 gap-2 border-r">
                      {allUsersRole.length === 0 && "Cargo"}

                      {allUsersRole.length === 1 ? (
                        <Badge
                          variant="secondary"
                          className="flex justify-between gap-2 cursor-pointer!"
                          onClick={handleRemoveRolesForAll}
                        >
                          <p className="font-semibold">
                            {rolesLabelsOptions.find(
                              (role) => role.value === allUsersRole[0]
                            )?.label || allUsersRole[0]}
                          </p>

                          <X
                            className="size-3.5! text-destructive hover:text-destructive !cursor-pointer"
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
                    <TableHead className="max-w-36 w-36 truncate font-semibold p-0!">
                      <div
                        className={cn(
                          "w-full h-full p-2 flex items-center justify-between pr-2 gap-2",
                          allUsersRole.length && "justify-center"
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
                            {
                              classrooms.find(
                                (c) => c.id === allUsersClassroom[0]
                              )?.name
                            }
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
                                (r) =>
                                  user.userRoles &&
                                  r.value === user.userRoles[0]
                              )?.label || user.userRoles[0]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.userClassrooms &&
                            user.userClassrooms?.length > 0 && (
                              <Badge variant="secondary">
                                {classrooms?.find(
                                  (c) =>
                                    user?.userClassrooms &&
                                    c.id === user?.userClassrooms[0]
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
                          <div className="h-14! flex justify-center items-center border-r p-2 max-w-56 w-56">
                            <Input
                              type="text"
                              value={user.name}
                              className="bg-background"
                              onChange={(e) =>
                                setUsers((prevUsers) =>
                                  prevUsers.map((u, i) =>
                                    index === i
                                      ? { ...u, name: e.target.value }
                                      : u
                                  )
                                )
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-center items-center border-r p-2 max-w-56 w-56">
                            <Input
                              type="email"
                              value={user.email}
                              className="bg-background"
                              onChange={(e) =>
                                setUsers((prevUsers) =>
                                  prevUsers.map((u, i) =>
                                    index === i
                                      ? { ...u, email: e.target.value }
                                      : u
                                  )
                                )
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-center items-center border-r p-2 max-w-56 w-56">
                            <Input
                              type="password"
                              value={user.password}
                              className="bg-background"
                              onChange={(e) =>
                                setUsers((prevUsers) =>
                                  prevUsers.map((u, i) =>
                                    index === i
                                      ? { ...u, password: e.target.value }
                                      : u
                                  )
                                )
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-center items-center border-r p-2 max-w-36 w-36">
                            {user.userRoles?.length ? (
                              user?.userRoles?.map((r, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="flex justify-between gap-2 cursor-pointer!"
                                  onClick={() =>
                                    setUsers((prevUsers) =>
                                      prevUsers.map((u, i) =>
                                        index === i
                                          ? { ...u, userRoles: [] }
                                          : u
                                      )
                                    )
                                  }
                                >
                                  <p className="font-semibold">
                                    {rolesLabelsOptions.find(
                                      (role) => role.value === r
                                    )?.label || r}
                                  </p>

                                  <X
                                    className="size-3.5! text-destructive hover:text-destructive !cursor-pointer"
                                    strokeWidth={2}
                                  />
                                </Badge>
                              ))
                            ) : (
                              <div className="w-full h-full flex justify-center items-center">
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
                                              userRoles: [role as RolesT],
                                            }
                                          : u
                                      )
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {classrooms && classrooms.length > 0 && (
                          <TableCell className="p-0!">
                            <div className="h-14! flex justify-center items-center p-2 max-w-36 w-36">
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
                                        : u
                                    )
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="!flex flex-row! justify-end gap-2">
          {stage === 0 && (
            <DialogClose>
              <Button
                variant="outline"
                className="font-semibold text-muted-foreground"
              >
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
                    setUsers((prev) =>
                      prev.filter((u) => u.status !== "success")
                    );
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
