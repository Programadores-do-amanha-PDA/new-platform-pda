"use client";

import { useState } from "react";
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
  import { DeleteConfirmationDialog } from "@/components/shared/delete-components";

import { useClassroomSettingStore } from "../../store";
import { SettingJustification } from "../../types";

interface JustificationCardProps {
    configId: string;
    justification: SettingJustification;
    onEdit: (justification: SettingJustification) => void;
}

export const JustificationCard = ({ configId, justification, onEdit }: JustificationCardProps) => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const { updateClassroomSettingById, settingsByClassroom } = useClassroomSettingStore();

    const handleDeleteJustification = async () => {
        const currentConfig = Object.values(settingsByClassroom).find((config) => config.id === configId);
        if (!currentConfig) return;

        const updatedClassTypes = currentConfig.justifications.filter((j: SettingJustification) => j.id !== justification.id);
        await updateClassroomSettingById({ id: configId, updates: { justifications: updatedClassTypes } });
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
                        key={`class-type-limit-${justification.id}`}
                        variant="secondary"
                        style={{
                            backgroundColor: backgroundColor(justification.color),
                            color: Color(justification.color).isDark() ? "#fff" : "#000",
                        }}
                    >
                        <p className="font-semibold text-xs!">({justification.key})</p>
                    </Badge>
                    <h3 className="font-semibold text-sm truncate">{justification.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    {justification.is_presence ? (
                        <div className="flex items-center gap-1">
                            <CheckCircle className="size-3 text-green-600" />
                            <span>Contabiliza como presença</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <XCircle className="size-3 text-red-600" />
                            <span>Não contabiliza como presença</span>
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
                        className="justify-start !w-full text-muted-foreground cursor-pointer"
                        onClick={() => onEdit(justification)}
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
                onConfirm={handleDeleteJustification}
                description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE o módulo e todos os dados relacionados a ele."
            />
        </li>
    );
};

