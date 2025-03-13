"use client";
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
import { TeamPeriodsType } from "@/types/teams";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { useState } from "react";

export function CreateTeamDialog() {
  const {
    teamsStack: { handleCreateTeam },
  } = useAdminStackContext();

  const [teamName, setTeamName] = useState<string>("");
  const [teamPeriod, setTeamPeriod] = useState<TeamPeriodsType>("afternoon");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleSetModalOpen = (open: boolean) => {
    if (!open) {
      setTeamName("");
      setTeamPeriod("afternoon");
    }
    setModalOpen(open);
  };

  const handleSubmit = async () => {
    const isCreated = await handleCreateTeam({
      name: teamName,
      period: teamPeriod,
    });
    if (isCreated) {
      handleSetModalOpen(false);
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
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
            <Input
              id="name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Período</Label>
            <TeamPeriodSelector
              value={teamPeriod}
              handleOnchange={(value) => setTeamPeriod(value)}
            />
          </div>
        </div>
        <DialogFooter className="w-full flex !justify-between gap-4">
          <Button variant="secondary" onClick={() => handleSetModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Criar Turma</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
