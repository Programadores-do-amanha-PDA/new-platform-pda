"use client";
import Color from "color";
import { CheckCircle, Edit, Ellipsis, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { ClassroomConfigJustificationT } from "@/types/classroom-configs";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";

interface JustificationCardProps {
  configId: string;
  justification: ClassroomConfigJustificationT;
  onEdit: (justification: ClassroomConfigJustificationT) => void;
}

const JustificationCard = ({
  configId,
  justification,
  onEdit,
}: JustificationCardProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const handleDeleteJustification = async () => {
    const currentConfig = Object.values(configsByClassroom).find(
      (config) => config.id === configId
    );
    if (!currentConfig) return;

    const updatedClassTypes = currentConfig.justifications.filter(
      (j: ClassroomConfigJustificationT) => j.id !== justification.id
    );
    await updateConfigById(configId, { justifications: updatedClassTypes });
  };

  const backgroundColor = (color: string) => {
    try {
      return Color(color).hex();
    } catch {
      return "#f3f4f6";
    }
  };

  return (
    <li className="w-full h-max flex items-center justify-between gap-4 overflow-hidden p-3 hover:bg-zinc-50">
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex gap-1 items-center">
          <Badge
            key={`class-type-limit-${justification.id}`}
            variant="secondary"
            style={{
              backgroundColor: backgroundColor(justification.color),
              color: Color(justification.color).isDark() ? "#fff" : "#000",
            }}
          >
            <p className="font-semibold text-xs!">({justification.key})</p>
          </Badge>
          <h3 className="truncate text-sm font-semibold">
            {justification.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {justification.is_presence ? (
            <div className="flex items-center gap-1">
              <CheckCircle className="size-3 text-green-600" />
              <span>Deve estar presente</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <XCircle className="size-3 text-red-600" />
              <span>Não precisa estar presente</span>
            </div>
          )}
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
            onClick={() => onEdit(justification)}
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
        onConfirm={handleDeleteJustification}
        description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE o módulo e todos os dados relacionados a ele."
      />
    </li>
  );
};

export default JustificationCard;
