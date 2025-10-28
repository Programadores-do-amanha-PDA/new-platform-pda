"use client";
import { useState } from "react";
import { Edit, Ellipsis, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useClassroomConfigStore } from "../../stores";
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";
import { ClassroomConfigModulesT } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModuleCardProps {
  module: ClassroomConfigModulesT;
  configId: string;
  onEdit: (module: ClassroomConfigModulesT) => void;
}

const ModuleCard = ({ module, configId, onEdit }: ModuleCardProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const handleDeleteModule = async () => {
    const currentConfig = Object.values(configsByClassroom).find(
      (config) => config.id === configId
    );
    if (!currentConfig) return;

    const updatedModules = currentConfig.modules.filter(
      (m: ClassroomConfigModulesT) => m.id !== module.id
    );
    await updateConfigById(configId, { modules: updatedModules });
  };

  const formatDateRange = () => {
    if (!module.interval?.from) return "Data não definida";

    const fromDate = format(new Date(module.interval.from), "dd/MM/yyyy", {
      locale: ptBR,
    });
    const toDate = module.interval.to
      ? format(new Date(module.interval.to), "dd/MM/yyyy", { locale: ptBR })
      : "Em andamento";

    return `${fromDate} - ${toDate}`;
  };

  return (
    <li className="w-full h-max flex justify-between gap-4 overflow-hidden">
      <div className="flex flex-col gap-1 flex-1">
        <p className="truncate text-sm font-semibold" title={module.title}>
          {module.title}
        </p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="size-3" />
          <span className="text-xs">{formatDateRange()}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="w-max">
          <Button variant="ghost" size="sm">
            <Ellipsis className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="!w-full cursor-pointer text-muted-foreground justify-start"
            onClick={() => onEdit(module)}
          >
            <Edit className="size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer !text-destructive justify-start"
            onClick={() => setDialogOpen(true)}
          >
            <Trash2 className="size-4  !text-destructive" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleDeleteModule}
        description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE o módulo e todos os dados relacionados a ele."
      />
    </li>
  );
};

export default ModuleCard;
