import { useEffect, useState } from "react";

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
import { Profiles } from "./profiles-data-table";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
type UserRoleType = {
  id: number;
  role: string;
  user_id: string;
};

function ProfilesSheetData({ profile }: { profile: Profiles }) {
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/roles?user_id=${profile.id}`);
        const profiles = await response.json();
        console.log("[ROLES]", profiles.results);
        setUserRoles(profiles.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="!px-2 w-full items-start justify-start"
        >
          Editar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Dados de Perfil</SheetTitle>
          <SheetDescription>
            Atualize os dados de perfil e os cargos de um usuário
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Nome completo
            </Label>
            <Input
              id="name"
              value={profile?.full_name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-left">
              Email
            </Label>
            <Input
              id="email"
              value={profile?.email}
              readOnly
              className="col-span-3"
            />
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
              Cargo
            </p>
            <div className="col-span-3">
              {userRoles.map((r, i) => (
                <Badge variant="outline" key={i}>
                  {r.role}
                </Badge>
              ))}
            </div>
          </div>
        </form>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Salvar Mudanças</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default ProfilesSheetData;
