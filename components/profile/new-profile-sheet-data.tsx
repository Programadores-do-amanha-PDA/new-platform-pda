import { useState } from "react";

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
import { X } from "lucide-react";

import { app_role } from "@/utils/supabase/enumeratedTypes/app_role";

function NewProfileSheetData() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const handleClearInputs = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setUserRoles([]);
  };

  const handleSetUserRoles = (newRoleName: string) => {
    const newRole = app_role.find((role) => role === newRoleName);

    if (newRole && !userRoles.includes(newRole)) {
      setUserRoles([...userRoles, newRole]);
    } else if (newRole && userRoles.includes(newRole)) {
      setUserRoles(userRoles.filter((role) => role !== newRole));
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
        email: email,
        password: password,
        full_name: fullName,
      };

      const singUpResponse = await axios.post("/api/auth/singup", data);

      if (singUpResponse.status !== 201 || !singUpResponse.data.user_id)
        throw "no sing up response";

      console.log(userRoles.length);
      console.log(singUpResponse.data.user_id);
      if (userRoles.length > 0) {
        for (let i = 0; i < userRoles.length; i++) {
          const role = userRoles[i];
          console.log(role);
          const data = { userId: singUpResponse.data.user_id, role: role };
          const roleAssignerResponse = await axios.post("/api/roles", data);
          if (roleAssignerResponse.status !== 201) throw "role assign error";
        }
      }

      toast.success(singUpResponse.data.message);
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

        case "no sing up response":
          toast.error("Erro ao criar usuário! Tente novamente mais tarde.");
          break;

        case "role assign error":
          toast.error("Erro ao atribuir permissões!");
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
                    excludeItens={userRoles}
                    label="Adicionar cargo"
                    value="0"
                    onChange={handleSetUserRoles}
                  />
                )}
            </div>
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
