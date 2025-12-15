"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";

import { useSettingStore } from "../../store";
import { Modules } from "../../types";

interface ModuleCardProps {
    module: Modules;
    configId: string;
    onEdit: (module: Modules) => void;
}

export const ModuleCard = ({ module, configId, onEdit }: ModuleCardProps) => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const { updateSettingById, settingsByClassroom } = useSettingStore();

    const handleDeleteModule = async () => {
        const currentConfig = Object.values(settingsByClassroom).find((config) => config.id === configId);
        if (!currentConfig) return;

        const updatedModules = currentConfig.modules.filter((m: Modules) => m.id !== module.id);
        await updateSettingById({ id: configId, updates: { modules: updatedModules } });
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
        <li className="flex justify-between gap-4 w-full h-max overflow-hidden">
            <div className="flex flex-col flex-1 gap-1">
                <p className="font-semibold text-sm truncate" title={module.title}>
                    {module.title}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
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
                        className="justify-start !w-full text-muted-foreground cursor-pointer"
                        onClick={() => onEdit(module)}
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
                onConfirm={handleDeleteModule}
                description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE o módulo e todos os dados relacionados a ele."
            />
        </li>
    );
};

