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
import { RoleSelector } from "./RoleSelector";
import { LoaderCircle, Sparkles, X } from "lucide-react";

import { app_role } from "@/utils/supabase/enumeratedTypes/app_role";
import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import { AuthUser, UserMetadata } from "@supabase/supabase-js";

const UserSheetData = ({
  mode,
  currentUser,
  handleCreateNewUser,
  handleUpdateUser,
  handleAddUserRole,
  handleUpdateUserRole,
  handleDeleteUserRole,
  excludeRoles,
}: {
  mode: "new" | "edit";
  currentUser?: Partial<AuthUserWithProfileType>;
  handleCreateNewUser: (
    user: Partial<AuthUser & { password: string }>
  ) => Promise<string | false>;
  handleUpdateUser: (
    userID: string,
    user: Partial<AuthUser & { password: string }>
  ) => Promise<boolean>;
  handleAddUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleUpdateUserRole: (userId: string, role: RolesType) => Promise<boolean>;
  handleDeleteUserRole: (userId: string) => Promise<boolean>;
  excludeRoles?: RolesType[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRoles, setUserRoles] = useState<RolesType[]>([]);

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

  const handleSetUserRoles = (newRoleName: RolesType) => {
    if (!userRoles.includes(newRoleName)) {
      setUserRoles([...userRoles, newRoleName]);
    } else if (userRoles.includes(newRoleName)) {
      setUserRoles(userRoles.filter((role) => role !== newRoleName));
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
        const userCreatedId = await handleCreateNewUser(data);

        if (userCreatedId) {
          if (userRoles.length > 0) {
            const role = userRoles[0];
            await handleAddUserRole(userCreatedId, role);
          }
        }
      } else if (mode === "edit" && currentUser && currentUser.id) {
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

        const userUpdateResponse = await handleUpdateUser(currentUser.id, data);
        if (!userUpdateResponse) throw "no edit user response";

        if (
          currentUser?.profile?.user_roles?.length === 0 &&
          userRoles.length === 1
        ) {
          const role = userRoles[0];
          await handleAddUserRole(currentUser.id, role);
        } else if (
          currentUser?.profile?.user_roles?.length === 1 &&
          userRoles.length === 1 &&
          !currentUser?.profile.user_roles
            .map((r) => r.role)
            .includes(userRoles[0])
        ) {
          const role = userRoles[0];
          await handleUpdateUserRole(currentUser.id, role);
        } else if (
          currentUser?.profile?.user_roles?.length === 1 &&
          userRoles.length === 0
        ) {
          await handleDeleteUserRole(currentUser.id);
        }

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
                    value={userRoles[0]}
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
