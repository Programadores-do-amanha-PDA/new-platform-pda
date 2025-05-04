import { useState } from "react";

import generatePassword from "generate-password";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "../../ui/separator";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import BadgeSelector from "../badge-selector";
import { LoaderCircle, Sparkles, X } from "lucide-react";

import { AuthUserWithProfileType, RolesType } from "@/types/auth";
import { AuthUser, UserMetadata } from "@supabase/supabase-js";
import { rolesLabels } from "@/utils/supabase/enumeratedTypes/roles";
import { ClassroomType } from "@/types/classrooms";
import { DialogClose } from "@radix-ui/react-dialog";
import { ClassroomCombobox } from "./classroom-combobox";
import { UserClassroomT } from "@/types/user-classroom";
import { UserClassroomStackI } from "@/context/modules/users/classrooms";
import { emailRegex, passwordRegex } from "@/utils/regex/users";

type UserSheetDataProps = {
  mode: "new" | "edit";
  currentUser?: Partial<AuthUserWithProfileType>;
  excludeRoles?: RolesType[];
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
  classrooms?: ClassroomType[];
} & UserClassroomStackI;

const UserSheetData = ({
  mode,
  currentUser,
  excludeRoles,
  handleCreateNewUser,
  handleUpdateUser,
  handleAddUserRole,
  handleUpdateUserRole,
  handleDeleteUserRole,
  classrooms,
  handleInsertUserClassrooms,
  handleDeleteUserClassroom,
}: UserSheetDataProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRoles, setUserRoles] = useState<RolesType[]>([]);
  const [userClassrooms, setUserClassrooms] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (mode == "edit" && open && currentUser) {
      setPassword("");
      setEmail(currentUser.email || "");
      setFullName(currentUser.profile?.full_name || "");
      setUserRoles(
        currentUser.profile?.user_roles?.map((role) => role.role) || []
      );
      setUserClassrooms(currentUser.profile?.classrooms || []);
    } else {
      setFullName("");
      setEmail("");
      setPassword("");
      setUserRoles([]);
    }

    setIsOpen(open);
  };

  const handleSetUserRoles = (newRole: string) => {
    if (!userRoles.includes(newRole as RolesType)) {
      setUserRoles([...userRoles, newRole as RolesType]);
    } else if (userRoles.includes(newRole as RolesType)) {
      setUserRoles(userRoles.filter((role) => role !== (newRole as RolesType)));
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
      if (mode === "new") {
        if (!fullName && !email && !password) throw "fill the fields";

        if (fullName.split(" ").length < 2 || fullName.length < 5)
          throw "Invalid full name";
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
          if (userClassrooms.length > 0) {
            const uClassroom: UserClassroomT[] = userClassrooms.map((id) => ({
              user_id: userCreatedId,
              classroom_id: id,
            }));
            await handleInsertUserClassrooms(uClassroom);
          }
        }
      } else if (mode === "edit" && currentUser && currentUser.id) {
        const userId = currentUser.id;
        if (!fullName && !email) throw "fill the fields";
        if (
          fullName !== currentUser.profile?.full_name &&
          (fullName.split(" ").length < 2 || fullName.length < 5)
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

        if (
          currentUser.profile?.classrooms?.length === 0 &&
          userClassrooms.length > 0
        ) {
          const uClassroom: UserClassroomT[] = userClassrooms.flatMap((uc) => ({
            user_id: userId,
            classroom_id: uc,
          }));

          await handleInsertUserClassrooms(uClassroom);
        } else if (
          !currentUser?.profile?.classrooms?.every((c) =>
            userClassrooms.includes(c)
          )
        ) {
          const deleteClassrooms = currentUser?.profile?.classrooms?.filter(
            (c) => !userClassrooms.includes(c)
          );

          const addClassrooms: UserClassroomT[] = userClassrooms
            .filter((c) => !currentUser?.profile?.classrooms?.includes(c))
            .flatMap((uc) => ({
              user_id: userId,
              classroom_id: uc,
            }));

          if (deleteClassrooms && deleteClassrooms.length > 0) {
            await handleDeleteUserClassroom(userId, deleteClassrooms);
          }

          if (addClassrooms && addClassrooms.length > 0) {
            await handleInsertUserClassrooms(addClassrooms);
          }
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
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          variant={mode === "new" ? "default" : "ghost"}
          className={
            mode === "new"
              ? "!px-4 w-max items-start justify-start font-semibold"
              : "!px-2 w-full h-max items-start justify-start text-start"
          }
        >
          {mode === "new" ? "Adicionar usuário" : "Editar usuário"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[45vw] w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "new" ? "Criar Novo Usuário" : "Editar Dados do Usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "new"
              ? "Insira os dados do usuário e seu cargo"
              : "Modifique os dados do usuário e seu cargo"}
          </DialogDescription>
        </DialogHeader>
        <form
          className="w-full h-full flex gap-4 py-4 overflow-hidden"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="w-2/3 h-full flex flex-col gap-4 flex-grow">
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="name" className="font-semibold">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="email" className="font-semibold">
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="font-semibold">
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
          </div>
          <Separator className="mx-4" orientation="vertical" />
          <div className="w-1/3 h-full flex flex-col gap-4 flex-grow">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
                Cargo
              </p>

              <div className="col-span-3 flex gap-1">
                {userRoles.map((r, i) => (
                  <Badge
                    variant="secondary"
                    key={i}
                    className="flex justify-between gap-2"
                  >
                    <p>
                      {rolesLabels.find((role) => role.value === r)?.label || r}
                    </p>
                    <X
                      onClick={() => handleSetUserRoles(r)}
                      className="size-3.5 cursor-pointer text-muted-foreground hover:text-destructive"
                    />
                  </Badge>
                ))}
                {userRoles.length < 1 &&
                  rolesLabels.filter((role) => !userRoles.includes(role.value))
                    .length > 0 && (
                    <BadgeSelector
                      excludeItens={userRoles.concat(excludeRoles || [])}
                      label="Adicionar cargo"
                      value={userRoles[0]}
                      onChange={handleSetUserRoles}
                      items={rolesLabels}
                    />
                  )}
              </div>
            </div>

            {classrooms && classrooms?.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <p className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
                  Turmas
                </p>

                <div className="col-span-3 flex gap-1">
                  <ClassroomCombobox
                    itens={classrooms?.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    value={userClassrooms}
                    onChange={(newClassroom) =>
                      setUserClassrooms([...newClassroom])
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </form>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-muted-foreground font-semibold"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => (!loading ? handleSubmit() : null)}
            className="gap-2 flex font-semibold"
          >
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            {mode === "new" ? "Adicionar Usuário" : "Editar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSheetData;
