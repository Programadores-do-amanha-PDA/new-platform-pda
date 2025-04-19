import { ChangeEvent, useState } from "react";
import Papa from "papaparse";
import generatePassword from "generate-password";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { app_role } from "@/utils/supabase/enumeratedTypes/app_role";
import { RoleSelector } from "./RoleSelector";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";

interface UserData {
  name: string;
  email: string;
  password?: string;
  status?: "success" | "error" | "warning";
  userRoles?: RolesType[];
}

interface UserRow {
  nome?: string;
  email?: string;
}

const InsertManyUsersDrawer = ({
  handleCreateNewUser,
  handleAddUserRole,
  excludeRoles,
}: {
  handleCreateNewUser: (
    user: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  excludeRoles?: RolesType[];
}) => {
  const [open, setOpen] = useState(false);

  const [users, setUsers] = useState<UserData[]>([]);
  const [allUsersRole, setAllUsersRole] = useState<RolesType[]>([]);
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
              name: row.nome || "",
              email: row.email || "",
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

  const handleSetRolesForAll = (newRoleName: RolesType) => {
    setUsers((users) =>
      users.map((user) => ({
        ...user,
        userRoles: [newRoleName],
      }))
    );
    setAllUsersRole([newRoleName]);
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

        console.log(user);
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
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger>
        <Button variant={"secondary"}>Inserir via CSV</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {stage === 0 &&
              "Selecione um arquivo csv para carregar os dados dos usuários"}
            {stage === 1 && "Revise os dados dos usuários a serem inseridos"}
            {stage === 2 && "Resultados das inserções"}
          </DrawerTitle>
        </DrawerHeader>

        {stage === 0 ? (
          <div className="grid w-full items-center gap-1.5 px-4 my-6">
            <Label htmlFor="file"></Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              className="max-w-sm"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full max-h-96 overflow-y-auto px-4 my-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-56 w-56 truncate">Nome</TableHead>
                  <TableHead className="max-w-56 w-56 truncate">
                    Email
                  </TableHead>
                  <TableHead className="max-w-36 w-36 truncate">
                    <div className="flex items-center gap-2">
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

                  <TableHead className="max-w-36 w-36 truncate">
                    <div className="flex items-center gap-2">
                      Cargo
                      {allUsersRole.map((r, i) => (
                        <Badge variant="outline" key={i}>
                          {r}
                          <X
                            onClick={handleRemoveRolesForAll}
                            className="size-3 ml-1 cursor-pointer"
                          />
                        </Badge>
                      ))}
                      {allUsersRole.length < 1 &&
                        app_role.filter((role) => !allUsersRole.includes(role))
                          .length > 0 && (
                          <RoleSelector
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
                </TableRow>
              </TableHeader>
              <TableBody>
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
                          {user?.userRoles?.map((r, i) => (
                            <Badge variant="outline" key={i}>
                              {r}
                              <X
                                onClick={() =>
                                  setUsers((prevUsers) =>
                                    prevUsers.map((u, i) =>
                                      index === i ? { ...u, userRoles: [] } : u
                                    )
                                  )
                                }
                                className="size-3 ml-1 cursor-pointer"
                              />
                            </Badge>
                          ))}
                          {user.userRoles &&
                            user.userRoles?.length < 1 &&
                            app_role.filter(
                              (role) => !user.userRoles?.includes(role)
                            ).length > 0 && (
                              <RoleSelector
                                excludeItens={excludeRoles || []}
                                label="Adicionar cargo"
                                value={user.userRoles[0]}
                                onChange={(role) =>
                                  setUsers((prevUsers) =>
                                    prevUsers.map((u, i) =>
                                      index === i
                                        ? { ...u, userRoles: [role] }
                                        : u
                                    )
                                  )
                                }
                              />
                            )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
              </TableBody>
            </Table>
          </div>
        )}

        <DrawerFooter className="!flex !flex-row justify-end gap-8">
          {stage === 0 && (
            <DrawerClose>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          )}
          {stage === 1 && (
            <>
              <Button onClick={() => setUsers([])} variant="outline">
                Trocar arquivo csv
              </Button>
              {users.length > 0 && (
                <Button onClick={() => (!loading ? handleSubmit() : null)}>
                  {loading && <LoaderCircle className="size-5 animate-spin" />}
                  Inserir {users.length} usuários
                </Button>
              )}
            </>
          )}
          {stage === 2 && (
            <>
              <DrawerClose>
                <Button>Finalizar</Button>
              </DrawerClose>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InsertManyUsersDrawer;
