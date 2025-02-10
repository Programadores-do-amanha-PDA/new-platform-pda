import { useState } from "react";

import generatePassword from "generate-password";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { RoleSelector } from "./RoleSelector";
import { LoaderCircle, Sparkles, X } from "lucide-react";

import { app_role } from "@/utils/supabase/enumeratedTypes/app_role";
import { AuthUserWithProfileType } from "@/types/auth";
import { UserMetadata } from "@supabase/supabase-js";

const UserSheetData = ({
  mode,
  currentUser,
  onInsertNewUser,
  onUpdateUser,
  excludeRoles,
}: {
  mode: "new" | "edit";
  currentUser?: AuthUserWithProfileType;
  onInsertNewUser: (newUser: AuthUserWithProfileType) => void;
  onUpdateUser: (
    userID: string | undefined,
    user: Partial<AuthUserWithProfileType>
  ) => void;
  excludeRoles?: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (mode == "edit" && open && currentUser) {
      setPassword("");
      setEmail(currentUser.email || "");
      setFullName(currentUser.profile?.full_name || "");
      setUserRoles(
        currentUser.profile?.user_roles?.map((role) => role.role) || []
      );
    } else {
      setFullName("");
      setEmail("");
      setPassword("");
      setUserRoles([]);
    }

    setIsOpen(open);
  };

  const handleSetUserRoles = (newRoleName: string) => {
    const newRole = app_role.find((role) => role === newRoleName);

    if (newRole && !userRoles.includes(newRole)) {
      setUserRoles([...userRoles, newRole]);
    } else if (newRole && userRoles.includes(newRole)) {
      setUserRoles(userRoles.filter((role) => role !== newRole));
    }
  };

  const handleGenerateRandomPassword = () => {
    return generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const fullNameRegex = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/gm;
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-]{7,}$/;

      if (mode === "new") {
        if (!fullName && !email && !password) throw "fill the fields";

        if (!fullNameRegex.test(fullName)) throw "Invalid full name";
        if (!emailRegex.test(email)) throw "Invalid email";
        if (!passwordRegex.test(password)) throw "Invalid password";

        const data: Partial<AuthUserWithProfileType & { password: string }> = {
          email: email,
          password: password,
          user_metadata: {
            full_name: fullName,
            user_email: email,
          },
        };
        const response = await axios.post("/api/auth_users", data);
        if (response.status !== 201 || !response.data.new_user.id)
          throw "no sing up response";

        if (userRoles.length > 0) {
          const role = userRoles[0];
          const data = { userId: response.data.new_user.id, role: role };
          const roleAssignerResponse = await axios.post("/api/roles", data);
          if (roleAssignerResponse.status !== 201) throw "role assign error";
          onInsertNewUser({
            ...response.data.new_user,
            profile: {
              ...response.data.new_user.profile,
              user_roles: [{ role: role }],
            },
          });
        }

        toast.success("Sucesso ao criar novo usuário!");
      } else if (mode === "edit" && currentUser) {
        if (!fullName && !email) throw "fill the fields";
        if (
          fullName !== currentUser.profile?.full_name &&
          !fullNameRegex.test(fullName)
        )
          throw "Invalid full name";
        if (email !== currentUser.email && !emailRegex.test(email))
          throw "Invalid email";
        if (password && !passwordRegex.test(password)) throw "Invalid password";

        const data: Partial<AuthUserWithProfileType & { password: string }> =
          {};

        if (email !== currentUser.email) {
          data.email = email;
        }

        if (password) {
          data.password = password;
        }

        const userMetadata: UserMetadata = {};
        if (fullName !== currentUser.profile?.full_name) {
          userMetadata.full_name = fullName;
        }

        if (email !== currentUser.email) {
          userMetadata.user_email = email;
        }

        if (Object.keys(userMetadata).length > 0) {
          data.user_metadata = userMetadata;
        }

        const userUpdateResponse = await axios.put("/api/auth_users", {
          id: currentUser.id,
          updates: data,
        });
        if (
          userUpdateResponse.status !== 201 ||
          !userUpdateResponse.data.updatedUser.id
        )
          throw "no edit user response";

        const userUpdatedData: AuthUserWithProfileType = {
          ...currentUser,
          ...userUpdateResponse.data.updatedUser,
          profile: {
            ...currentUser.profile,
            email: userUpdateResponse.data.updatedUser.user_metadata.user_email,
            full_name:
              userUpdateResponse.data.updatedUser.user_metadata.full_name,
          },
          user_metadata: {
            ...currentUser.user_metadata,
            ...userUpdateResponse.data.updatedUser.user_metadata,
          },
        };

        if (
          currentUser?.profile?.user_roles?.length === 0 &&
          userRoles.length === 1
        ) {
          const role = userRoles[0];
          const data = { userId: currentUser.id, role: role };
          const roleAssignerResponse = await axios.post("/api/roles", data);
          if (roleAssignerResponse.status !== 201) throw "role assign error";
          if (userUpdatedData.profile) {
            userUpdatedData.profile.user_roles =
              roleAssignerResponse.data.results;
          }
        } else if (
          currentUser?.profile?.user_roles?.length === 1 &&
          userRoles.length === 1 &&
          !currentUser?.profile.user_roles
            .map((r) => r.role)
            .includes(userRoles[0])
        ) {
          const role = userRoles[0];
          const roleAssignerResponse = await axios.put("/api/roles", {
            role: role,
            id: currentUser.id,
          });
          if (roleAssignerResponse.status !== 201) throw "role assign error";
          if (userUpdatedData.profile) {
            userUpdatedData.profile.user_roles =
              roleAssignerResponse.data.results;
          }
        } else if (
          currentUser?.profile?.user_roles?.length === 1 &&
          userRoles.length === 0
        ) {
          const roleAssignerResponse = await axios.delete(
            `/api/roles?id=${currentUser.id}`
          );

          if (roleAssignerResponse.status !== 200) throw "role delete error";
          if (userUpdatedData.profile) {
            userUpdatedData.profile.user_roles = [];
          }
        }
        onUpdateUser(currentUser.id, userUpdatedData);
        toast.success("Sucesso ao editar o usuário!");
      }

      handleOpenChange(false);
      setLoading(false);
    } catch (error) {
      switch (error) {
        case "fill the fields":
          toast.error("Por favor preencha todos os campos!");
          break;

        case "Invalid full name":
          toast.error("Nome completo inválido!");
          break;

        case "Invalid email":
          toast.error("E-mail inválido!");
          break;

        case "Invalid email":
          toast.error("Senha inválida!");
          break;

        case "no sing up response":
          toast.error("Erro ao criar usuário! Tente novamente mais tarde.");
          break;

        case "no edit user response":
          toast.error("Erro ao editar usuário! Tente novamente mais tarde.");
          break;

        case "role assign error":
          toast.error(
            mode === "new"
              ? "Erro ao atribuir o cargo!"
              : "Erro ao atualizar o cargo!"
          );
          break;

        case "role delete error":
          toast.error("Erro ao remover o cargo do usuário!");
          break;

        default:
          toast.error(
            mode === "new"
              ? "Erro ao criar usuário! Tente novamente mais tarde."
              : "Erro ao atualizar o usuário! Tente novamente mais tarde."
          );
          break;
      }
      setLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          variant={mode === "new" ? "default" : "ghost"}
          className={
            mode === "new"
              ? "!px-4 w-max items-start justify-start font-semibold"
              : "!px-2 w-full h-max items-start justify-start text-start"
          }
        >
          {mode === "new" ? "Novo usuário" : "Editar usuário"}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {mode === "new" ? "Criar Novo Usuário" : "Editar Dados do Usuário"}
          </SheetTitle>
          <SheetDescription>
            {mode === "new"
              ? "Insira os dados do usuário e seu cargo"
              : "Modifique os dados do usuário e seu cargo"}
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-rows-2 items-center gap-2">
            <Label htmlFor="name" className="text-left">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-2">
            <Label htmlFor="email" className="text-left">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-2">
            <Label htmlFor="password" className="text-left">
              {mode === "new" ? "Senha" : "Nova senha"}
            </Label>
            <div className="flex justify-between gap-2">
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="outline"
                className="flex items-center justify-center"
                title="Gerar senha aleatória"
                onClick={() => setPassword(handleGenerateRandomPassword())}
              >
                <Sparkles className="size-5" />
              </Button>
            </div>
          </div>

          <Separator className="my-4" />
          <div className="grid grid-rows-2 items-center gap-2">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
              Cargo
            </p>

            <div className="col-span-3 flex gap-1">
              {userRoles.map((r, i) => (
                <Badge variant="outline" key={i}>
                  {r}
                  <X
                    onClick={() => handleSetUserRoles(r)}
                    className="size-3 ml-1 cursor-pointer"
                  />
                </Badge>
              ))}
              {userRoles.length < 1 &&
                app_role.filter((role) => !userRoles.includes(role)).length >
                  0 && (
                  <RoleSelector
                    excludeItens={userRoles.concat(excludeRoles || [])}
                    label="Adicionar cargo"
                    value="0"
                    onChange={handleSetUserRoles}
                  />
                )}
            </div>
          </div>
        </form>
        <SheetFooter>
          <Button
            type="button"
            onClick={() => (!loading ? handleSubmit() : null)}
            className="gap-2 flex font-semibold"
          >
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            {mode === "new" ? "Adicionar Usuário" : "Editar Usuário"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UserSheetData;
