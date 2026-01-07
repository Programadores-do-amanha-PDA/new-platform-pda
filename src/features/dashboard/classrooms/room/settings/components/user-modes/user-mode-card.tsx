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
import { useClassroomSettingStore } from "../../store";
import { UserMode } from "../../types";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";

interface UserModeCardProps {
    configId: string;
    userMode: UserMode;
    onEdit: (userMode: UserMode) => void;
}

export const UserModeCard = ({ configId, userMode, onEdit }: UserModeCardProps) => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const { updateSettingById, settingsByClassroom } = useClassroomSettingStore();

    const handleDeleteUserMode = async () => {
        const currentConfig = Object.values(settingsByClassroom).find((config) => config.id === configId);
        if (!currentConfig) return;

        const updatedUserModes = currentConfig.user_modes.filter((u: UserMode) => u.id !== userMode.id);
        await updateSettingById({ id: configId, updates: { user_modes: updatedUserModes } });
    };

    const backgroundColor = (color: string) => {
        try {
            return Color(color).hex();
        } catch {
            return "#f3f4f6";
        }
    };

    return (
        <li className="flex justify-between items-center gap-4 hover:bg-zinc-50 p-3 w-full h-max overflow-hidden">
            <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center gap-1">
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
                    <h3 className="font-semibold text-sm truncate">{userMode.title}</h3>
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
                        className="justify-start !w-full text-muted-foreground cursor-pointer"
                        onClick={() => onEdit(userMode)}
                    >
                        <Edit className="size-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="justify-start !text-destructive cursor-pointer"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Trash2 className="size-4 !text-destructive" />
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
