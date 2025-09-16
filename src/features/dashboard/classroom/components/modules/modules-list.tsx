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

  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const modules = currentConfig?.modules || [];

  const handleEditModule = (module: ClassroomConfigModulesT) => {
    setCurrentModule(module);
  };

  const handleCloseDialog = () => {
    setCurrentModule(null);
  };

  return (
    <div className="w-full max-w-[400px] h-max max-h-96 flex flex-col border rounded-lg overflow-hidden">
      <header className="w-full flex items-center justify-between border-b-2 p-3 bg-muted">
        <h2 className="font-bold">Módulos da Turma</h2>

        {modules.length > 0 && currentConfig && (
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
          <div className="text-center py-4 space-y-6">
            <div>
              <h3 className="font-semibold">Nenhum módulo encontrado</h3>
              <p className="text-sm text-muted-foreground">
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
          <ul className="w-full grid grid-flow-row *:hover:bg-zinc-50 *:p-3 *:not-first:border-t">
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
