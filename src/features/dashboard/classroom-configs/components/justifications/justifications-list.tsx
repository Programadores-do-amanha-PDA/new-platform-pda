"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomConfigStore } from "../../stores";
import { ClassroomConfigJustificationT } from "../../types";
import { JustificationCard, JustificationFormDialog } from ".";

interface JustificationsListProps {
  classroomId: string;
}

const JustificationsList = ({ classroomId }: JustificationsListProps) => {
  const [currentJustification, setCurrentJustification] =
    useState<ClassroomConfigJustificationT | null>(null);

  const { configsByClassroom } = useClassroomConfigStore();

  const currentConfig = configsByClassroom[classroomId];
  const justifications = currentConfig?.justifications || [];

  const handleEditJustification = (
    justification: ClassroomConfigJustificationT
  ) => {
    setCurrentJustification(justification);
  };

  const handleCloseDialog = () => {
    setCurrentJustification(null);
  };

  return (
    <div className="w-full max-w-[400px] h-max max-h-96 flex flex-col border rounded-lg overflow-hidden">
      <header className="w-full flex items-center justify-between border-b-2 p-3 bg-muted">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-4 space-y-6">
            <div>
              <h3 className="font-semibold">
                Nenhuma justificativa encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Comece criando a primeira justificativa
              </p>
            </div>
            {currentConfig && (
              <JustificationFormDialog
                configId={currentConfig.id}
                trigger={
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Criar Primeira Justificativa
                  </Button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="w-full *:not-first:border-t">
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

export default JustificationsList;
