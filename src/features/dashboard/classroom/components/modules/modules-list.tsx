"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { ClassroomConfigModulesT } from "@/types/classroom-configs";
import ModuleCard from "./module-card";
import ModuleFormDialog from "./module-form-dialog";

interface ModulesListProps {
  classroomId: string;
}

const ModulesList = ({ classroomId }: ModulesListProps) => {
  const [currentModule, setCurrentModule] =
    useState<ClassroomConfigModulesT | null>(null);
  const { configsByClassroom, loading, getConfigByClassroom } =
    useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const modules = currentConfig?.modules || [];

  // Carregar config quando o componente montar
  React.useEffect(() => {
    if (!currentConfig) {
      getConfigByClassroom(classroomId);
    }
  }, [classroomId, currentConfig, getConfigByClassroom]);

  const handleEditModule = (module: ClassroomConfigModulesT) => {
    setCurrentModule(module);
  };

  const handleCloseDialog = () => {
    setCurrentModule(null);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] h-max max-h-96 flex flex-col border rounded-lg overflow-hidden">
      <header className="w-full flex items-center justify-between border-b p-3">
        <h2 className="font-bold">Módulos da Turma</h2>

        {currentConfig && (
          <ModuleFormDialog
            configId={currentConfig.id}
            trigger={
              <Button size="icon">
                <Plus className="size-4" />
              </Button>
            }
          />
        )}
      </header>

      {modules.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Plus className="size-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Nenhum módulo encontrado
              </h3>
              <p className="text-muted-foreground">
                Comece criando o primeiro módulo da turma
              </p>
            </div>
            {currentConfig && (
              <ModuleFormDialog
                configId={currentConfig.id}
                trigger={
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Criar Primeiro Módulo
                  </Button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ul className="w-full grid grid-flow-row gap-4 *:hover:bg-zinc-50 *:p-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                configId={currentConfig!.id}
                onEdit={handleEditModule}
              />
            ))}
          </ul>
        </div>
      )}

      {currentConfig && (
        <ModuleFormDialog
          configId={currentConfig.id}
          currentModule={currentModule}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};

export default ModulesList;
