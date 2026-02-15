"use client";

import { useProjectsKPIsColumns, useProjectsKPIsData } from "./hooks";
import { PROJECTS_KPIS_RULES_LABELS } from "./utils";
import { DefaultDataTable } from "@/components/shared/custom-data-table/default-data-table";

interface ProjectsKPIsTableProps {
    readonly classroomId: string;
}

/**
 * Displays a data table with Key Performance Indicators (KPIs) for projects within a classroom.
 *
 * This component renders a virtualized table showing project-level metrics and rules,
 * including module metadata, statistics, and expandable/collapsible rows for detailed analysis.
 *
 * The table uses React Table for column management and TanStack Table utilities for rendering,
 * ensuring efficient handling of large datasets and smooth user interactions.
 *
 * @component
 * @param {ProjectsKPIsTableProps} props - The component props.
 * @param {string} props.classroomId - The ID of the classroom whose project KPIs should be displayed.
 * @returns {React.ReactElement} A scrollable table component displaying project KPI data.
 *
 * @example
 * // Display KPI metrics for a specific classroom
 * <ProjectsKPIsTable classroomId="classroom-123" />
 *
 * @remarks
 * - The component fetches module and project statistics using the `useProjectsKPIsData` hook.
 * - Column definitions are generated dynamically via `useProjectsKPIsColumns` based on fetched metadata.
 * - The table supports row expansion/collapse for detailed metric views.
 * - Horizontal scrolling is enabled for wider tables that exceed container width.
 * - The table header remains sticky when scrolling vertically for better UX.
 */
export const ProjectsKPIsTable = ({ classroomId }: ProjectsKPIsTableProps) => {
    const { modulesMetadata, moduleStatsCache, projectStatsCache, rowsMinimized, handleSetModulesMinimized } =
        useProjectsKPIsData({ classroomId });

    const columns = useProjectsKPIsColumns({
        modulesMetadata,
        moduleStatsCache,
        projectStatsCache,
        rowsMinimized,
        handleSetModulesMinimized,
    });

    return <DefaultDataTable data={PROJECTS_KPIS_RULES_LABELS} columns={columns} searchColumnId="label" />;
};
