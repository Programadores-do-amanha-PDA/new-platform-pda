"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { ClassroomConfigUserModeT } from "@/types/classroom-configs";
import { UserModeCard, UserModeFormDialog } from "./";

interface UserModesListProps {
  classroomId: string;
}

const UserModesList = ({ classroomId }: UserModesListProps) => {
  const [currentUserMode, setCurrentUserMode] =
    useState<ClassroomConfigUserModeT | null>(null);

  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const userModes = currentConfig?.user_modes || [];

  const handleEditUserMode = (userMode: ClassroomConfigUserModeT) => {
    setCurrentUserMode(userMode);
  };

  const handleCloseDialog = () => {
    setCurrentUserMode(null);
  };

  return (
    <div className="w-full max-w-[400px] h-max max-h-96 flex flex-col border rounded-lg overflow-hidden">
      <header className="w-full flex items-center justify-between border-b-2 p-3 bg-muted">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-4 space-y-6">
            <div>
              <h3 className="font-semibold">
                Nenhum modo de usuário encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Comece criando o primeiro modo de usuário
              </p>
            </div>
            {currentConfig && (
              <UserModeFormDialog
                configId={currentConfig.id}
                trigger={
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Criar Primeiro Modo
                  </Button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="w-full *:not-first:border-t">
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
        <UserModeFormDialog
          configId={currentConfig.id}
          currentUserMode={currentUserMode}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};

export default UserModesList;