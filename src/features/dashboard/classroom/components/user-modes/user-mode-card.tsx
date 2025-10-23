"use client";
import Color from "color";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
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
import { ClassroomConfigUserMode } from "@/types/classroom-configs";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";

interface UserModeCardProps {
  configId: string;
  userMode: ClassroomConfigUserMode;
  onEdit: (userMode: ClassroomConfigUserMode) => void;
}

const UserModeCard = ({ configId, userMode, onEdit }: UserModeCardProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { updateConfigById, configsByClassroom } = useClassroomConfigStore();

  const handleDeleteUserMode = async () => {
    const currentConfig = Object.values(configsByClassroom).find(
      (config) => config.id === configId
    );
    if (!currentConfig) return;

    const updatedUserModes = currentConfig.user_modes.filter(
      (u: ClassroomConfigUserMode) => u.id !== userMode.id
    );
    await updateConfigById(configId, { user_modes: updatedUserModes });
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
            key={`user-mode-${userMode.id}`}
            variant="secondary"
            style={{
              backgroundColor: backgroundColor(userMode.color),
              color: Color(userMode.color).isDark() ? "#fff" : "#000",
            }}
          >
            <p className="font-semibold text-xs!">{userMode.key}</p>
          </Badge>
          <h3 className="truncate text-sm font-semibold">{userMode.title}</h3>
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
            onClick={() => onEdit(userMode)}
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
        onConfirm={handleDeleteUserMode}
        description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE o modo de usuário e todos os dados relacionados a ele."
      />
    </li>
  );
};

export default UserModeCard;
