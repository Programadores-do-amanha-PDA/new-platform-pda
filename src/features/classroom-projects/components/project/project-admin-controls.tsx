"use client";

import { ItemActions } from "@/components/ui/item";

import { getProjectStatistics } from "../../utils/deliveries/delivery-status";
import { ProjectAdminControlsPropsT } from "../../types/projects/project-card";

/**
 * Renders admin controls for project management
 */
export const ProjectAdminControls = ({ project, classroomDeliveries, classroomCorrections }: ProjectAdminControlsPropsT) => {
    // Show statistics for inactive projects
    const stats = getProjectStatistics(project, classroomDeliveries, classroomCorrections);

    // {stats.totalDeliveries}

    return (
        <ItemActions className="flex items-center space-x-2" aria-label="Estatísticas do projeto">
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
