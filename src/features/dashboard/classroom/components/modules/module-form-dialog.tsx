"use client";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
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
import { DateIntervalPicker } from "@/components/shared/date-interval";

import { ClassroomConfigModulesT } from "@/types/classroom-configs";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";

interface ModuleFormDialogProps {
  configId: string;
  currentModule?: ClassroomConfigModulesT | null;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

const ModuleFormDialog = ({
  configId,
  currentModule,
  onClose,
  trigger,
}: ModuleFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  useEffect(() => {
    if (currentModule) {
      setTitle(currentModule.title);
      setDateRange(currentModule.interval);
      setOpen(true);
    }
  }, [currentModule]);

  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setDateRange(undefined);
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Título é obrigatório!");
      return;
    }

    if (!dateRange?.from) {
      toast.error("Data de início é obrigatória!");
      return;
    }

    setLoading(true);

    try {
      const currentConfig = Object.values(configsByClassroom).find(
        (config) => config.id === configId
      );
      if (!currentConfig) {
        toast.error("Configuração não encontrada!");
        return;
      }

      const newModule: ClassroomConfigModulesT = {
        id:
          currentModule?.id ||
          `module_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        title: title.trim(),
        interval: dateRange,
        created_at: currentModule?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let updatedModules;
      if (currentModule) {
        // Update existing module
        updatedModules = currentConfig.modules.map(
          (module: ClassroomConfigModulesT) =>
            module.id === currentModule.id ? newModule : module
        );
      } else {
        // Add new module
        updatedModules = [...currentConfig.modules, newModule];
      }

      const success = await updateConfigById(configId, {
        modules: updatedModules,
      });

      if (success) {
        handleClose();
        toast.success(
          currentModule
            ? "Módulo atualizado com sucesso!"
            : "Módulo criado com sucesso!"
        );
      }
    } catch (error) {
      console.error("Error saving module:", error);
      toast.error("Erro ao salvar módulo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentModule ? "Editar Módulo" : "Novo Módulo"}
          </DialogTitle>
          <DialogDescription>
            {currentModule
              ? "Edite as informações do módulo."
              : "Crie um novo módulo para a turma."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Módulo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Módulo 1 - Introdução"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Período do Módulo</Label>
            <DateIntervalPicker buttonClassName="w-full" date={dateRange} setDate={setDateRange}  />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : currentModule ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleFormDialog;
