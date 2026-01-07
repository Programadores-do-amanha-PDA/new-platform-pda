"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useClassroomSettingStore } from "../../store";
import { ClassTypeCard } from "./class-type-card";
import { ClassTypeFormDialog } from "./class-type-form-dialog";
import { ClassTypes } from "../../types";

interface ClassTypesListProps {
    classroomId: string;
}

export const ClassTypesList = ({ classroomId }: ClassTypesListProps) => {
    const [currentClassType, setCurrentClassType] = useState<ClassTypes | null>(null);

    const { settingsByClassroom } = useClassroomSettingStore();

    const currentConfig = settingsByClassroom[classroomId];
    const classTypes = currentConfig?.class_types || [];

    const handleEditClassType = (classType: ClassTypes) => {
        setCurrentClassType(classType);
    };

    const handleCloseDialog = () => {
        setCurrentClassType(null);
    };

    return (
        <div className="flex flex-col border rounded-lg w-full max-w-[600px] h-full max-h-96 overflow-hidden">
            <header className="flex justify-between items-center bg-muted p-3 border-b-2 w-full">
                <h2 className="font-bold">Tipos de Aula</h2>

                {currentConfig && classTypes.length > 0 && (
                    <ClassTypeFormDialog
                        configId={currentConfig!.id}
                        trigger={
                            <Button size="icon">
                                <Plus className="size-4" />
                            </Button>
                        }
                    />
                )}
            </header>

            {classTypes.length === 0 ? (
                <div className="flex flex-1 justify-center items-center">
                    <div className="space-y-6 py-4 text-center">
                        <div>
                            <h3 className="font-semibold">Nenhum tipo de aula encontrado</h3>
                            <p className="text-muted-foreground text-sm">Comece criando o primeiro tipo de aula</p>
                        </div>
                        {currentConfig && (
                            <ClassTypeFormDialog
                                configId={currentConfig!.id}
                                trigger={
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Criar Primeiro Tipo
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <ul className="grid grid-flow-row *:hover:bg-zinc-50 *:p-3 *:not-first:border-t w-full">
                        {classTypes.map((classType) => (
                            <ClassTypeCard
                                key={classType.id}
                                classType={classType}
                                configId={currentConfig!.id}
                                onEdit={handleEditClassType}
                            />
                        ))}
                    </ul>
                </div>
            )}

            {currentConfig && (
                <ClassTypeFormDialog
                    currentClassType={currentClassType}
                    configId={currentConfig.id}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
};
