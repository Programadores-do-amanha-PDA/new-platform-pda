"use client";

// Global imports
import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Local imports
import { useClassroomConfigStore } from "../../stores";
import { ClassroomConfigModulesT } from "../../types";
import { ModulesListPropsT } from "../../types";
import { 
  isModulesListEmpty, 
  getModulesCountDescription 
} from "../../utils";
import ModuleCard from "./module-card";
import ModuleFormDialog from "./module-form-dialog";

/**
 * ModulesList component displays and manages classroom modules
 * Provides functionality to create, edit, and view modules in a classroom
 */
const ModulesList = ({ classroomId }: ModulesListPropsT): JSX.Element => {
  const [currentModule, setCurrentModule] =
    useState<ClassroomConfigModulesT | null>(null);

  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const modules = currentConfig?.modules || [];
  const isEmpty = isModulesListEmpty(modules);
  const modulesCountDescription = getModulesCountDescription(modules);

  /**
   * Handles module editing by setting the current module for the dialog
   * @param module - Module to edit
   */
  const handleEditModule = useCallback((module: ClassroomConfigModulesT): void => {
    setCurrentModule(module);
  }, []);

  /**
   * Handles dialog close by clearing the current module
   */
  const handleCloseDialog = useCallback((): void => {
    setCurrentModule(null);
  }, []);

  return (
    <div 
      className="w-full max-w-[400px] h-max max-h-96 flex flex-col border rounded-lg overflow-hidden"
      role="region"
      aria-label="Lista de módulos da turma"
    >
      <header className="w-full flex items-center justify-between border-b-2 p-3 bg-muted">
        <h2 className="font-bold" id="modules-heading">
          Módulos da Turma
        </h2>

        {!isEmpty && currentConfig && (
          <ModuleFormDialog
            configId={currentConfig.id}
            trigger={
              <Button 
                size="icon"
                aria-label="Adicionar novo módulo"
              >
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            }
          />
        )}
      </header>

      {isEmpty ? (
        <div 
          className="flex-1 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="text-center py-4 space-y-6">
            <div>
              <h3 className="font-semibold">{modulesCountDescription}</h3>
              <p className="text-sm text-muted-foreground">
                Comece criando o primeiro módulo da turma
              </p>
            </div>
            {currentConfig && (
              <ModuleFormDialog
                configId={currentConfig.id}
                trigger={
                  <Button aria-describedby="modules-heading">
                    <Plus className="size-4 mr-2" aria-hidden="true" />
                    Criar Primeiro Módulo
                  </Button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ul 
            className="w-full grid grid-flow-row *:hover:bg-zinc-50 *:p-3 *:not-first:border-t"
            role="list"
            aria-labelledby="modules-heading"
          >
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
