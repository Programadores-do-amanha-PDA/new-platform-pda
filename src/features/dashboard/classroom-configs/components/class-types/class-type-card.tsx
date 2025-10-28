"use client";
import React, { useState } from "react";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClassroomConfigClassTypesT } from "../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";
import { useClassroomConfigStore } from "../../stores";
import Color from "color";

interface ClassTypeCardProps {
  classType: ClassroomConfigClassTypesT;
  configId: string;
  onEdit: (classType: ClassroomConfigClassTypesT) => void;
}

const ClassTypeCard = ({ classType, configId, onEdit }: ClassTypeCardProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const handleDeleteClassType = async () => {
    const currentConfig = Object.values(configsByClassroom).find(
      (config) => config.id === configId
    );
    if (!currentConfig) return;

    const updatedClassTypes = currentConfig.class_types.filter(
      (c: ClassroomConfigClassTypesT) => c.id !== classType.id
    );
    await updateConfigById(configId, { class_types: updatedClassTypes });
  };

  const backgroundColor = (color: string) => {
    try {
      return Color(color).hex();
    } catch {
      return "#f3f4f6";
    }
  };

  return (
    <li className="w-full h-max flex justify-between gap-4 overflow-hidden">
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="truncate text-sm font-semibold" title={classType.title}>
          {classType.title} 
        </h3>
        {classType.limits && classType.limits.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {classType.limits.map((limit) => (
              <Badge
                key={`class-type-limit-${limit.id}`}
                variant="secondary"
                className="text-xs!"
                style={{
                  backgroundColor: backgroundColor(limit.color),
                  color: Color(limit.color).isDark() ? "#fff" : "#000",
                }}
              >
                <p className="font-semibold">({limit.key}) {limit.title}:</p>
                {limit.min} - {limit.max ?? "∞"}
              </Badge>
            ))}
          </div>
        )}
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
            onClick={() => onEdit(classType)}
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
        onConfirm={handleDeleteClassType}
        description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE o módulo e todos os dados relacionados a ele."
      />
    </li>
  );
};

export default ClassTypeCard;
