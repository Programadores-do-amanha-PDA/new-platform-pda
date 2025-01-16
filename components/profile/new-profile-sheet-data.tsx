import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
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
import { UserRoleType } from "@/types/auth";
import { RoleSelector } from "./RoleSelector";
import { X } from "lucide-react";

const roles: UserRoleType[] = [
  { id: 1, role: "Admin" },
  { id: 2, role: "employer" },
  { id: 3, role: "Alumni" },
];

function NewProfileSheetData() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);

  const [loading, setLoading] = useState(false);

  const handleClearInputs = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setUserRoles([]);
  };

  const handleSetUserRoles = (newRoleId: string) => {
    const newRole = roles.find((role) => String(role.id) === newRoleId);

    if (newRole && !userRoles.includes(newRole)) {
      setUserRoles([...userRoles, newRole]);
    } else if (newRole && userRoles.includes(newRole)) {
      setUserRoles(userRoles.filter((role) => role.id !== newRole.id));
    }
  };

  const handleCreateNewUser = async () => {
    try {
      setLoading(true);
      if (!fullName && !email) throw new Error("fill the fields");

      const fullNameRegex = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/gm;
      const validateEmail = (email: string) => {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      };

      if (!fullNameRegex.test(fullName)) throw new Error("Invalid full name");
      if (!validateEmail(email)) throw new Error("Invalid email");

      const data = {
        full_name: fullName,
        email: email,
        password: password,
        roles: userRoles.map((role) => role.role),
      };

      const response = await axios.post("/api/auth/singup", data);

      if (response.status !== 201 && !response.data.user_id) throw new Error();

      toast.success(response.data.message);
      handleClearInputs();
      setLoading(false);
    } catch (error) {
      switch (error.message) {
        case "fill the fields":
          toast.error("Por favor preencha todos os campos!");
          break;

        case "Invalid full name":
          toast.error("Nome completo inválido!");
          break;

        case "Invalid email":
          toast.error("E-mail inválido!");
          break;

        default:
          toast.error("Erro ao criar usuário! Tente novamente mais tarde.");
          break;
      }
      setLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={handleClearInputs}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="!px-2 w-max items-start justify-start font-semibold"
        >
          Novo usuário
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Criar Novo Usuário</SheetTitle>
          <SheetDescription>
            Insira os dados de perfil e os cargos do usuário
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-left">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
            />
          </div>

          <Separator className="my-4" />
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
              Cargo
            </p>
            {!loading ? (
              <div className="col-span-3 flex gap-1">
                {userRoles.map((r, i) => (
                  <Badge variant="outline" key={i}>
                    {r.role}
                    <X
                      onClick={() => handleSetUserRoles(String(r.id))}
                      className="size-3 ml-1 cursor-pointer"
                    />
                  </Badge>
                ))}
                {roles.filter(
                  (role) =>
                    !userRoles
                      .map((ur) => String(ur.id))
                      .includes(String(role.id))
                ).length > 0 && (
                  <RoleSelector
                    itens={roles.filter(
                      (role) =>
                        !userRoles
                          .map((ur) => String(ur.id))
                          .includes(String(role.id))
                    )}
                    label="Adicionar cargo"
                    value="0"
                    onChange={handleSetUserRoles}
                  />
                )}
              </div>
            ) : (
              <div className="col-span-3 ">
                {Array(3).map((_, i) => (
                  <Badge
                    variant="outline"
                    className="animate-pulse"
                    key={i}
                  ></Badge>
                ))}
              </div>
            )}
          </div>
        </form>
        <SheetFooter>
          <Button type="button" onClick={handleCreateNewUser}>
            Adicionar Usuário
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default NewProfileSheetData;
