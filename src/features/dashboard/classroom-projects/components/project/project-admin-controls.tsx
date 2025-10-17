"use client";

// Global imports
import React from "react";

// UI Components
import { Label } from "@/components/ui/label";

// Local imports
import { getProjectStatistics } from "../../utils/deliveries/delivery-status";
import { ItemActions } from "@/components/ui/item";
import { ProjectAdminControlsPropsT } from "../../types";
import { isProjectActive } from "../../utils";

/**
 * Renders admin controls for project management
 */
export const ProjectAdminControls: React.FC<ProjectAdminControlsPropsT> = ({
  project,
  classroomDeliveries,
  classroomCorrections,
}) => {
  const isActive = isProjectActive(project);

  if (isActive) {
    return (
      <ItemActions className="flex flex-col items-start gap-4 bg-primary/25 p-4 rounded-xl">
        <Label htmlFor={`date-picker-${project.id}`} className="font-semibold">
          Período de entrega:
        </Label>
        {/* <DateIntervalPicker
              date={scheduleDate}
              setDate={onScheduleDateChange}
              aria-describedby={`date-picker-help-${project.id}`}
            /> */}
      </ItemActions>
    );
  }

  // Show statistics for inactive projects
  const stats = getProjectStatistics(
    project,
    classroomDeliveries,
    classroomCorrections
  );

  // {stats.totalDeliveries}

  return (
    <ItemActions
      className="flex items-center space-x-2"
      aria-label="Estatísticas do projeto"
    >
      <div className="text-center px-4 py-1.5 rounded-md bg-muted/50 border-border">
        <div className="text-xs text-secondary">Entregas</div>
        <div className="font-bold text-primary">{stats.totalDeliveries}</div>
      </div>
      <div className="text-center px-4 py-1.5 rounded-md bg-muted/50 border-border">
        <div className="text-xs text-secondary">Correções</div>
        <div className="font-bold text-primary">{stats.totalCorrections}</div>
      </div>
      {/* TODO Add an edit and delete options */}  
      {/* <Button variant="ghost" size="icon-lg" onClick={() => {}}>
        <EllipsisVertical className="size-5 stroke-2" />
      </Button> */}
    </ItemActions>
  );
};
