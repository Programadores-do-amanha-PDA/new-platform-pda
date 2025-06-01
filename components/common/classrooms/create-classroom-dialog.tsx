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
import {
  ClassroomPeriodsType,
  ClassroomType,
  ClassroomTypeStatus,
} from "@/types/classrooms";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { useEffect, useState } from "react";
import ClassroomPeriodSelector from "./classroom-period-selector";
import ClassroomStatusSelector from "./classroom-status-selector";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const CreateOrEditClassroomDialog = ({
  currentClassroom,
}: {
  currentClassroom?: ClassroomType;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [period, setPeriod] = useState<ClassroomPeriodsType>("afternoon");
  const [status, setStatus] = useState<ClassroomTypeStatus>("active");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const {
    classroomsStack: { handleCreateClassroom, handleUpdateClassroom },
  } = useAdminStackContext();

  const handleSetModalOpen = (open: boolean) => {
    if (!open) {
      setName("");
      setPeriod("afternoon");
    }
    setModalOpen(open);
  };

  useEffect(() => {
    if (currentClassroom) {
      setName(currentClassroom.name);
      setPeriod(currentClassroom.period);
      setStatus(currentClassroom.status);
    }
  }, [currentClassroom]);

  const handleSubmit = async () => {
    if (!name || !period || !status) {
      toast.error(
        `Erro ao ${currentClassroom ? "Editar" : "Adicionar"} a turma!`
      );
    }

    setLoading(true)

    if (currentClassroom) {
      const updates = {} as Partial<ClassroomType>;
      if (name !== currentClassroom.name) updates.name = name;
      if (period !== currentClassroom.period) updates.period = period;
      if (status !== currentClassroom.status) updates.status = status;

      await handleUpdateClassroom(currentClassroom.id, updates);

    setLoading(false)
      return handleSetModalOpen(false);
    }

    await handleCreateClassroom({
      name: name,
      period: period,
      status: status,
    });

    setLoading(false)
    return handleSetModalOpen(false);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button
          className="font-semibold"
          variant={currentClassroom ? "outline-solid" : "default"}
        >
          {currentClassroom ? "Editar Turma" : "Adicionar Turma"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-max">
        <DialogHeader>
          <DialogTitle>
            {currentClassroom
              ? `Editar ${currentClassroom.name}`
              : "Adicionar Turma"}
          </DialogTitle>
          <DialogDescription>
            {currentClassroom
              ? `Edite as informações da ${currentClassroom.name}`
              : "Insira o nome (ou codinome), o período e o status da nova turma."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-start justify-center">
            <Label htmlFor="name" className="font-semibold">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="w-full flex justify-between items-center gap-4">
            <div className="flex flex-col gap-2 items-start justify-center">
              <Label className="font-semibold">Período</Label>
              <ClassroomPeriodSelector
                value={period}
                handleOnchange={(value) => setPeriod(value)}
              />
            </div>
            <div className="flex flex-col gap-2 items-start justify-center">
              <Label className="font-semibold">Status da turma</Label>
              <ClassroomStatusSelector
                value={status}
                handleOnchange={(value) => setStatus(value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="w-full flex gap-4 mt-4">
          <Button variant="outline" onClick={() => handleSetModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="font-semibold" disabled={loading}>
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            {currentClassroom ? "Salvar alterações" : "Criar turma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrEditClassroomDialog;
