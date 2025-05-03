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
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import { AuthUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";
import BadgeSelector from "../badge-selector";
import { rolesLabels } from "@/utils/supabase/enumeratedTypes/roles";
import { ClassroomType } from "@/types/classrooms";
import { ClassroomCombobox } from "./classroom-combobox";

interface UserData {
  name: string;
  email: string;
  password?: string;
  status?: "success" | "error" | "warning";
  userRoles?: RolesType[];
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
  handleCreateNewUser: (
    user: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  excludeRoles?: RolesType[];
  classrooms?: ClassroomType[];
};

const InsertManyUsersDialog = ({
  handleCreateNewUser,
  handleAddUserRole,
  excludeRoles,
  classrooms,
}: InsertManyUsersDialogProps) => {
  const [open, setOpen] = useState(false);

  const [users, setUsers] = useState<UserData[]>([]);
  const [allUsersRole, setAllUsersRole] = useState<RolesType[]>([]);
  const [allUsersClassroom, setAllUsersClassroom] = useState<string[]>([]);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(false);

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
        userRoles: [newRoleName as RolesType],
      }))
    );
    setAllUsersRole([newRoleName as RolesType]);
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

    const fullNameRegex = /^[a-zA-ZÀ-ÿ'\-]+(?: [a-zA-ZÀ-ÿ'\-]+)*$/;
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-]{7,}$/;

    for (const user of users) {
      try {
        if (!user.email || !user.name || !user.password)
          throw "fill the fields";

        if (!fullNameRegex.test(user.name)) throw "Invalid full name";
        if (!emailRegex.test(user.email)) throw "Invalid email";
        if (!passwordRegex.test(user.password)) throw "Invalid password";

        const data: Partial<AuthUserWithProfileType & { password: string }> = {
          email: user.email,
          password: user.password,
          user_metadata: {
            full_name: user.name,
            user_email: user.email,
          },
        };
        const userCreatedId = await handleCreateNewUser(data);

        if (userCreatedId) {
          if (user.userRoles && user.userRoles.length > 0) {
            const role = user.userRoles[0];
            await handleAddUserRole(userCreatedId, role);
          }
        }
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === user.email ? { ...u, status: "success" } : u
          )
        );
      } catch (error) {
        console.log(error);
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

      setLoading(false);
      setStage(1);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUsers([]);
      setAllUsersRole([]);
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
      <DialogContent className="max-w-[85vw] w-max overflow-hidden">
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
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-max cursor-pointer"
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
              <TableHeader className="sticky top-0 bg-background z-10 shadow">
                <TableRow>
                  <TableHead className="max-w-56 w-56 truncate font-semibold">Nome</TableHead>
                  <TableHead className="max-w-56 w-56 truncate font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate font-semibold">
                    <div className="w-full flex items-center justify-between pr-2 gap-2">
                      Senha
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex items-center justify-center !py-1 !h-max !w-10"
                        title="Gerar senha aleatória"
                        onClick={() => handleGenerateRandomPassword()}
                      >
                        <Sparkles className="!size-3" />
                      </Button>
                    </div>
                  </TableHead>

                  <TableHead className="max-w-36 w-36 truncate font-semibold">
                    <div className="w-full flex items-center justify-between pr-2 gap-2">
                      {allUsersRole.length === 0 && "Cargo"}
                      {allUsersRole.map((r, i) => (
                        <Badge
                          variant="secondary"
                          key={i}
                          className="flex justify-between gap-2 w-max"
                        >
                          <p>
                            {rolesLabels.find((role) => role.value === r)
                              ?.label || r}
                          </p>
                          <X
                            onClick={handleRemoveRolesForAll}
                            className="size-3.5 cursor-pointer text-muted-foreground hover:text-destructive"
                          />
                        </Badge>
                      ))}
                      {allUsersRole.length < 1 &&
                        rolesLabels.filter(
                          (role) => !allUsersRole.includes(role.value)
                        ).length > 0 && (
                          <BadgeSelector
                            items={rolesLabels}
                            excludeItens={allUsersRole.concat(
                              excludeRoles || []
                            )}
                            label="Adicionar cargo"
                            value={allUsersRole[0]}
                            onChange={handleSetRolesForAll}
                          />
                        )}
                    </div>
                  </TableHead>

                  {classrooms && classrooms.length > 0 && (
                    <TableHead className="max-w-36 w-36 truncate font-semibold">
                      <div className="w-full flex items-center justify-between pr-2 gap-2">
                        {allUsersClassroom.length === 0 && "Turmas"}
                        <ClassroomCombobox
                          itens={classrooms?.map((c) => ({
                            label: c.name,
                            value: c.id,
                          }))}
                          value={allUsersClassroom}
                          onChange={handleSetClassroomsForAll}
                        />
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr:nth-child(odd)]:!bg-muted-foreground/5 [&_tr:nth-child(odd)]:hover:!bg-muted">
                {users &&
                  users.map((user, index) =>
                    user.status ? (
                      <TableRow
                        key={index}
                        className={`${
                          user.status === "success"
                            ? "bg-green-50"
                            : user.status === "error"
                            ? "bg-red-50"
                            : "bg-yellow-50"
                        }`}
                      >
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.password}</TableCell>
                        <TableCell>
                          {user.userRoles && user.userRoles.length > 0 && (
                            <Badge variant="outline">{user.userRoles[0]}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="text"
                            value={user.name}
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
                        </TableCell>
                        <TableCell>
                          <Input
                            type="email"
                            value={user.email}
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
                        </TableCell>
                        <TableCell>
                          <Input
                            type="password"
                            value={user.password}
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
                        </TableCell>
                        <TableCell>
                          {user.userRoles?.length ? (
                            user?.userRoles?.map((r, i) => (
                              <Badge
                                variant="secondary"
                                key={i}
                                className="flex justify-between gap-2 w-max"
                              >
                                <p>
                                  {rolesLabels.find((role) => role.value === r)
                                    ?.label || r}
                                </p>
                                <X
                                  onClick={() =>
                                    setUsers((prevUsers) =>
                                      prevUsers.map((u, i) =>
                                        index === i
                                          ? { ...u, userRoles: [] }
                                          : u
                                      )
                                    )
                                  }
                                  className="size-3.5 cursor-pointer text-muted-foreground hover:text-destructive"
                                />
                              </Badge>
                            ))
                          ) : (
                            <div className="w-full h-full flex justify-center items-center">
                              <BadgeSelector
                                items={rolesLabels}
                                excludeItens={excludeRoles || []}
                                label="Adicionar cargo"
                                onChange={(role) =>
                                  setUsers((prevUsers) =>
                                    prevUsers.map((u, i) =>
                                      index === i
                                        ? {
                                            ...u,
                                            userRoles: [role as RolesType],
                                          }
                                        : u
                                    )
                                  )
                                }
                              />
                            </div>
                          )}
                        </TableCell>
                        {classrooms && classrooms.length > 0 && (
                          <TableCell>
                            <div className="w-full h-full flex justify-center items-center">
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

        <DialogFooter className="!flex !flex-row justify-end gap-8">
          {stage === 0 && (
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          )}
          {stage === 1 && (
            <>
              <Button onClick={() => setUsers([])} variant="outline">
                Trocar arquivo csv
              </Button>
              {users.length > 0 && (
                <Button
                  onClick={() => (!loading ? handleSubmit() : null)}
                  className="font-semibold"
                >
                  {loading && <LoaderCircle className="size-5 animate-spin" />}
                  Inserir {users.length} usuários
                </Button>
              )}
            </>
          )}
          {stage === 2 && (
            <>
              <DialogClose>
                <Button>Finalizar</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsertManyUsersDialog;
