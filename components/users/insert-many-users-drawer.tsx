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
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle, Sparkles } from "lucide-react";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import { AuthUser } from "@supabase/supabase-js";
import { app_role } from "@/utils/supabase/enumeratedTypes/app_role";
import { RoleSelector } from "./RoleSelector";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

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
  const [users, setUsers] = useState<UserData[]>([]);
  const [allUsersRole, setAllUsersRole] = useState<RolesType[]>([]);
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
            console.error("Erros de parsing:", results.errors);
            setUsers([]);
            return;
          }

          console.log(results.data);

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

          console.log(parsedUsers);

          setUsers(parsedUsers);
        },
        error: (error: Error) => {
          console.error("Erro ao ler arquivo:", error);
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

  const handleSetUserRolesForAll = (newRoleName: RolesType) => {
    setUsers((users) =>
      users.map((user) => ({
        ...user,
        userRoles: [newRoleName],
      }))
    );
    setAllUsersRole([newRoleName]);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const fullNameRegex = /^[a-zA-Z]{2,}(?: [a-zA-Z]{2,})+$/;
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
    }
  };

  return (
    <Drawer>
      <DrawerTrigger>
        <Button variant={"secondary"}>Inserir via CSV</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Inserir usuários em lote</DrawerTitle>
          {/* <DrawerDescription>
            Faça upload de um arquivo csv para carregar os dados dos usuários a
            serem inseridos.
          </DrawerDescription> */}
        </DrawerHeader>

        {!users.length ? (
          <div className="grid w-full items-center gap-1.5 px-4 my-6">
            <Label htmlFor="file">
              Selecione um arquivo csv para carregar os dados dos usuários:
            </Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              className="max-w-sm"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full max-h-96 overflow-y-auto px-4">
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
                        variant="ghost"
                        size="icon"
                        className="flex items-center justify-center"
                        title="Gerar senha aleatória"
                        onClick={() => handleGenerateRandomPassword()}
                      >
                        <Sparkles className="size-5" />
                      </Button>
                    </div>
                  </TableHead>

                  <TableHead className="max-w-36 w-36 truncate">
                    <div className="flex items-center gap-2">
                      Cargo
                      {app_role.filter((role) => !allUsersRole.includes(role))
                        .length > 0 && (
                        <RoleSelector
                          excludeItens={excludeRoles}
                          label="Adicionar cargo"
                          value={allUsersRole[0]}
                          onChange={(v) => handleSetUserRolesForAll(v)}
                        />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users &&
                  users.map((user, index) => (
                    <TableRow key={index} className={ `${user.status && user.status === "success" ? "bg-green-50" : user.status && user.status === "error" ? 'bg-red-50': 'bg-yellow-50'}`}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.password}</TableCell>
                      {user.userRoles && user.userRoles.length > 0 && (
                        <TableCell>
                          <Badge variant="outline">{user.userRoles[0]}</Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DrawerFooter className="!flex !flex-row justify-end gap-8">
          <DrawerClose>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          {users.length > 0 && (
            <Button onClick={() => (!loading ? handleSubmit() : null)}>
              {loading && <LoaderCircle className="size-5 animate-spin" />}
              Inserir {users.length} usuários
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InsertManyUsersDrawer;
