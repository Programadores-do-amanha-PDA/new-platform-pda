"use client";

import React, { useState } from "react";
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
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";

import { useClassroomSettingStore } from "../../store";
import { ClassTypes } from "../../types";

interface ClassTypeCardProps {
    classType: ClassTypes;
    configId: string;
    onEdit: (classType: ClassTypes) => void;
}

export const ClassTypeCard = ({ classType, configId, onEdit }: ClassTypeCardProps) => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const { updateClassroomSettingById, settingsByClassroom } = useClassroomSettingStore();

    const handleDeleteClassType = async () => {
        const currentConfig = Object.values(settingsByClassroom).find((config) => config.id === configId);
        if (!currentConfig) return;

        const updatedClassTypes = currentConfig.class_types.filter((c: ClassTypes) => c.id !== classType.id);
        await updateClassroomSettingById({ id: configId, updates: { class_types: updatedClassTypes } });
    };

    const backgroundColor = (color: string) => {
        try {
            return Color(color).hex();
        } catch {
            return "#f3f4f6";
        }
    };

    return (
        <li className="flex justify-between gap-4 w-full h-max overflow-hidden">
            <div className="flex flex-col flex-1 gap-1">
                <h3 className="flex gap-4 font-semibold text-sm truncate" title={classType.title}>
                    {classType.title}
                </h3>
                {classType.limits && classType.limits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {classType.presence_calc_type && (
                            <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="font-semibold text-xs!">
                                    {`Presença ${
                                        classType.presence_calc_type === "bySingleMeeting" ? "individual" : "semanal"
                                    }`}
                                </Badge>
                            </div>
                        )}
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
                                <p className="font-semibold">
                                    ({limit.key}) {limit.title}:
                                </p>
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
                        className="justify-start w-full! text-muted-foreground cursor-pointer"
                        onClick={() => onEdit(classType)}
                    >
                        <Edit className="size-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="justify-start text-destructive! cursor-pointer"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Trash2 className="size-4 text-destructive!" />
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

