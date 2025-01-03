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

function ProfilesSheetData({ profile }: { profile: Profiles }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="!px-2">
          Editar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Dados de Perfil</SheetTitle>
          <SheetDescription>Atualizar informações de perfil</SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 py-4" onSubmit={(e) => e.preventDefault()}>
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
            <Input id="email" value={profile?.email} className="col-span-3" />
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
