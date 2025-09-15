"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
import { ClassroomConfigClassTypesT } from "@/types/classroom-configs";
import ClassTypeCard from "./class-type-card";
import ClassTypeFormDialog from "./class-type-form-dialog";

interface ClassTypesListProps {
  classroomId: string;
}

const ClassTypesList = ({ classroomId }: ClassTypesListProps) => {
  const [currentClassType, setCurrentClassType] =
    useState<ClassroomConfigClassTypesT | null>(null);

  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const classTypes = currentConfig?.class_types || [];

  const handleEditClassType = (classType: ClassroomConfigClassTypesT) => {
    setCurrentClassType(classType);
  };

  const handleCloseDialog = () => {
    setCurrentClassType(null);
  };

  return (
    <div className="w-full max-w-[600px] h-full max-h-96 flex flex-col border rounded-lg overflow-hidden">
      <header className="w-full flex items-center justify-between border-b p-3">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-4 space-y-6">
            <div>
              <h3 className="font-semibold">Nenhum tipo de aula encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Comece criando o primeiro tipo de aula
              </p>
            </div>
            {currentConfig && (
              <ClassTypeFormDialog
                configId={currentConfig!.id}
                trigger={
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Criar Primeiro Tipo
                  </Button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ul className="w-full grid grid-flow-row *:hover:bg-zinc-50 *:p-3 *:not-first:border-t">
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

export default ClassTypesList;
