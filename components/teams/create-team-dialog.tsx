import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamPeriodSelector } from "./team-period-selector";

export function CreateTeamDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-semibold">Nova Turma</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Turma</DialogTitle>
          <DialogDescription>
            Insira o nome (ou codinome) e o período da nova turma.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 justify-start">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value="Turma 10" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Período</Label>
            <TeamPeriodSelector />
          </div>
        </div>
        <DialogFooter className="w-full flex !justify-between gap-4">
          <Button variant="secondary">Cancelar</Button>
          <Button type="submit">Criar Turma</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
