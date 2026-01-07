"use client";

import React, { useState, useCallback, type JSX } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ModuleFormDialog, ModuleCard } from ".";
import { useClassroomSettingStore } from "../../store";
import { ClassModules } from "../../types";
import { isModulesListEmpty, getModulesCountDescription } from "../../utils";

export interface ModulesListProps {
  classroomId: string;
}

/**
 * ModulesList component displays and manages classroom modules
 * Provides functionality to create, edit, and view modules in a classroom
 */
export const ModulesList = ({ classroomId }: ModulesListProps): JSX.Element => {
  const [currentModule, setCurrentModule] =
    useState<ClassModules | null>(null);

  const { settingsByClassroom } = useClassroomSettingStore();

  const currentConfig = settingsByClassroom[classroomId];
  const modules = currentConfig?.modules || [];
  const isEmpty = isModulesListEmpty(modules);
  const modulesCountDescription = getModulesCountDescription(modules);

  const handleEditModule = useCallback((module: ClassModules): void => {
    setCurrentModule(module);
  }, []);


  const handleCloseDialog = useCallback((): void => {
    setCurrentModule(null);
  }, []);

  return (
    <div 
      className="flex flex-col border rounded-lg w-full max-w-[400px] h-max max-h-96 overflow-hidden"
      role="region"
      aria-label="Lista de módulos da turma"
    >
      <header className="flex justify-between items-center bg-muted p-3 border-b-2 w-full">
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
          className="flex flex-1 justify-center items-center"
          role="status"
          aria-live="polite"
        >
          <div className="space-y-6 py-4 text-center">
            <div>
              <h3 className="font-semibold">{modulesCountDescription}</h3>
              <p className="text-muted-foreground text-sm">
                Comece criando o primeiro módulo da turma
              </p>
            </div>
            {currentConfig && (
              <ModuleFormDialog
                configId={currentConfig.id}
                trigger={
                  <Button aria-describedby="modules-heading">
                    <Plus className="mr-2 size-4" aria-hidden="true" />
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
            className="grid grid-flow-row *:hover:bg-zinc-50 *:p-3 *:not-first:border-t w-full"
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

