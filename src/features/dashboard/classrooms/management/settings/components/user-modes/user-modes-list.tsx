"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { UserModeCard, UserModeFormDialog } from ".";
import { useSettingStore } from "../../store";
import { UserMode } from "../../types";

interface UserModesListProps {
    classroomId: string;
}

export const UserModesList = ({ classroomId }: UserModesListProps) => {
    const [currentUserMode, setCurrentUserMode] = useState<UserMode | null>(null);

    const { settingsByClassroom } = useSettingStore();

    const currentConfig = settingsByClassroom[classroomId];
    const userModes = currentConfig?.user_modes || [];

    const handleEditUserMode = (userMode: UserMode) => {
        setCurrentUserMode(userMode);
    };

    const handleCloseDialog = () => {
        setCurrentUserMode(null);
    };

    return (
        <div className="flex flex-col border rounded-lg w-full max-w-[400px] h-max max-h-96 overflow-hidden">
            <header className="flex justify-between items-center bg-muted p-3 border-b-2 w-full">
                <h2 className="font-bold">Modos de Usuário</h2>

                {currentConfig && userModes.length > 0 && (
                    <UserModeFormDialog
                        configId={currentConfig.id}
                        trigger={
                            <Button size="icon">
                                <Plus className="size-4" />
                            </Button>
                        }
                    />
                )}
            </header>

            {userModes.length === 0 ? (
                <div className="flex flex-1 justify-center items-center">
                    <div className="space-y-6 py-4 text-center">
                        <div>
                            <h3 className="font-semibold">Nenhum modo de usuário encontrado</h3>
                            <p className="text-muted-foreground text-sm">Comece criando o primeiro modo de usuário</p>
                        </div>
                        {currentConfig && (
                            <UserModeFormDialog
                                configId={currentConfig.id}
                                trigger={
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Criar Primeiro Modo
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <div className="*:not-first:border-t w-full">
                        {userModes.map((userMode) => (
                            <UserModeCard
                                configId={currentConfig.id}
                                key={userMode.id}
                                userMode={userMode}
                                onEdit={handleEditUserMode}
                            />
                        ))}
                    </div>
                </div>
            )}

            {currentConfig && (
                <UserModeFormDialog configId={currentConfig.id} currentUserMode={currentUserMode} onClose={handleCloseDialog} />
            )}
        </div>
    );
};

