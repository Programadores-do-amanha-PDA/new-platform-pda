"use client";

// Global imports
import React from "react";
import { LoaderCircle } from "lucide-react";
import { DateRange } from "react-day-picker";

// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Shared Components
import DateIntervalPicker from "@/components/shared/date-interval/date-interval-picker";

// Local imports
import { ClassroomProjectT } from "../types/project";
import { getProjectStatistics } from "../utils/project-delivery-status";
import { ClassroomProjectDeliveryT } from "../types/delivery";
import { ClassroomProjectCorrectionT } from "../types/corrections";

export interface ProjectAdminControlsProps {
  /** The project being managed */
  project: ClassroomProjectT;
  /** Whether the project is currently active */
  isActive: boolean;
  /** Current schedule date state */
  scheduleDate: DateRange | undefined;
  /** Function to update schedule date */
  onScheduleDateChange: (date: DateRange | undefined) => void;
  /** Whether an update operation is in progress */
  loading: boolean;
  /** Whether the schedule has been modified */
  hasChanges: boolean;
  /** Function to handle project updates */
  onUpdateProject: () => Promise<void>;
  /** All project deliveries for statistics */
  deliveries: ClassroomProjectDeliveryT[];
  /** All project corrections for statistics */
  corrections: ClassroomProjectCorrectionT[];
}

/**
 * Renders admin controls for project management
 */
export const ProjectAdminControls: React.FC<ProjectAdminControlsProps> = ({
  project,
  isActive,
  scheduleDate,
  onScheduleDateChange,
  loading,
  hasChanges,
  onUpdateProject,
  deliveries,
  corrections,
}) => {
  if (isActive) {
    return (
      <div className="flex flex-col items-start gap-4 bg-primary/25 p-4 rounded-xl">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <Label 
              htmlFor={`date-picker-${project.id}`} 
              className="font-semibold"
            >
              Período de entrega:
            </Label>
            <DateIntervalPicker
              date={scheduleDate}
              setDate={onScheduleDateChange}
              aria-describedby={`date-picker-help-${project.id}`}
            />
            <p 
              id={`date-picker-help-${project.id}`}
              className="text-xs text-muted-foreground sr-only"
            >
              Selecione o período em que os estudantes poderão entregar este projeto
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            disabled={!hasChanges || loading} 
            onClick={onUpdateProject}
            aria-label={`Salvar alterações no projeto ${project.title}`}
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {loading && (
              <LoaderCircle 
                className="size-5 animate-spin" 
                aria-hidden="true"
              />
            )}
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    );
  }

  // Show statistics for inactive projects
  const stats = getProjectStatistics(project, deliveries, corrections);
  
  return (
    <>
      <Separator />
      <div className="flex flex-col items-start gap-2" role="region" aria-label="Estatísticas do projeto">
        <p className="text-sm h-5 text-muted-foreground flex gap-1 font-semibold">
          Entregas:
          <span className="font-normal" aria-label={`${stats.totalDeliveries} entregas`}>
            {stats.totalDeliveries}
          </span>
        </p>
        <p className="text-sm h-5 text-muted-foreground flex gap-1 font-semibold">
          Correções:
          <span className="font-normal" aria-label={`${stats.totalCorrections} correções`}>
            {stats.totalCorrections}
          </span>
        </p>
      </div>
    </>
  );
};