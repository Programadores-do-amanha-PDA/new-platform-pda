"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useClassroomSettingStore } from "../../store";
import { SettingJustification } from "../../types";
import { JustificationFormDialog, JustificationCard } from ".";

interface JustificationsListProps {
    classroomId: string;
}

export const JustificationsList = ({ classroomId }: JustificationsListProps) => {
    const [currentJustification, setCurrentJustification] = useState<SettingJustification | null>(null);

    const { settingsByClassroom } = useClassroomSettingStore();

    const currentConfig = settingsByClassroom[classroomId];
    const justifications = currentConfig?.justifications || [];

    const handleEditJustification = (justification: SettingJustification) => {
        setCurrentJustification(justification);
    };

    const handleCloseDialog = () => {
        setCurrentJustification(null);
    };

    return (
        <div className="flex flex-col border rounded-lg w-full max-w-[400px] h-max max-h-96 overflow-hidden">
            <header className="flex justify-between items-center bg-muted p-3 border-b-2 w-full">
                <h2 className="font-bold">Justificativas</h2>

                {currentConfig && justifications.length > 0 && (
                    <JustificationFormDialog
                        configId={currentConfig.id}
                        trigger={
                            <Button size="icon">
                                <Plus className="size-4" />
                            </Button>
                        }
                    />
                )}
            </header>

            {justifications.length === 0 ? (
                <div className="flex flex-1 justify-center items-center">
                    <div className="space-y-6 py-4 text-center">
                        <div>
                            <h3 className="font-semibold">Nenhuma justificativa encontrada</h3>
                            <p className="text-muted-foreground text-sm">Comece criando a primeira justificativa</p>
                        </div>
                        {currentConfig && (
                            <JustificationFormDialog
                                configId={currentConfig.id}
                                trigger={
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Criar Primeira Justificativa
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <div className="*:not-first:border-t w-full">
                        {justifications.map((justification) => (
                            <JustificationCard
                                configId={currentConfig.id}
                                key={justification.id}
                                justification={justification}
                                onEdit={handleEditJustification}
                            />
                        ))}
                    </div>
                </div>
            )}

            {currentConfig && (
                <JustificationFormDialog
                    configId={currentConfig.id}
                    currentJustification={currentJustification}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
};
