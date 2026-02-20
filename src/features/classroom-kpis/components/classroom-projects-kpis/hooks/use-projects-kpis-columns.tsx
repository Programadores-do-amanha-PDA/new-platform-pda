"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    DefaultTableColumnCell,
    DefaultTableHeaderCell,
    TableHeaderItemWithCustomItem,
} from "@/components/shared/custom-data-table";
import { ModuleMetadata } from "../types";
import { PROJECTS_KPIS_RULES_LABELS } from "../utils";

type ProjectKPIRuleLabel = (typeof PROJECTS_KPIS_RULES_LABELS)[number];

interface UseProjectsKPIsColumnsProps {
    readonly modulesMetadata: ModuleMetadata[];
    readonly moduleStatsCache: Record<string, Record<string, string>>;
    readonly projectStatsCache: Record<string, Record<string, string>>;
    readonly rowsMinimized: string[];
    readonly handleSetModulesMinimized: (moduleId: string) => void;
}

/**
 * Hook that generates table column definitions for project KPIs display.
 *
 * Creates a memoized array of column definitions combining static index columns with dynamic project columns.
 * The index column displays KPI rule labels, while project columns are organized by module and show
 * aggregated and individual project KPI statistics.
 *
 * @param {UseProjectsKPIsColumnsProps} props - Configuration object
 * @param {ModuleMetadata[]} props.modulesMetadata - Array of module metadata containing module information and associated projects
 * @param {Record<string, Record<ProjectKPIRule, string | number>>} props.moduleStatsCache - Cached module-level KPI statistics (O(1) lookup)
 * @param {Record<string, Record<ProjectKPIRule, string | number>>} props.projectStatsCache - Cached project-level KPI statistics (O(1) lookup)
 * @param {string[]} props.rowsMinimized - Array of module IDs that are currently in minimized state
 * @param {(moduleId: string) => void} props.handleSetModulesMinimized - Callback to toggle module minimization state
 *
 * @returns {ColumnDef<ProjectKPIRuleLabel>[]} Array of table column definitions for TanStack Table, combining:
 *   - Index column with KPI rule labels and sorting capability
 *   - Dynamic project columns grouped by module with expandable/collapsible functionality
 *
 * @remarks
 * - Index columns are completely static and memoized separately with empty dependencies
 * - Project columns update when module metadata, caches, or minimization state change
 * - Uses pre-calculated cache values to ensure O(1) lookup performance
 * - The `handleSetModulesMinimized` callback is intentionally excluded from dependencies as it's stable
 *   and including it would cause unnecessary re-renders
 */
export const useProjectsKPIsColumns = ({
    modulesMetadata,
    moduleStatsCache,
    projectStatsCache,
    rowsMinimized,
    handleSetModulesMinimized,
}: UseProjectsKPIsColumnsProps) => {
    /**
     * Index column definition with KPI rule labels.
     * This column is static and never changes.
     */
    const indexColumns: ColumnDef<ProjectKPIRuleLabel>[] = useMemo(
        () => [
            {
                accessorKey: "label",
                header: ({ column }) => (
                    <DefaultTableHeaderCell column={column} className="border-r-2 border-b-2 w-full min-w-60! h-24! max-h-24!">
                        Indicadores
                    </DefaultTableHeaderCell>
                ),
                cell: ({ row }) => {
                    const isLastRow = PROJECTS_KPIS_RULES_LABELS.length - 1 === row.index;

                    return (
                        <DefaultTableColumnCell
                            className="border-r-2 w-full min-w-60! **:font-medium! **:capitalize!"
                            isLastElementOnVertical={isLastRow}
                        >
                            % {row.original.label}
                        </DefaultTableColumnCell>
                    );
                },
                sortingFn: (rowA, rowB) => {
                    const labelA = rowA.original.label.toLowerCase();
                    const labelB = rowB.original.label.toLowerCase();
                    return labelA.localeCompare(labelB);
                },
            },
        ],
        [],
    );

    /**
     * Dynamic columns for each project module.
     * Updates when metadata, caches, or minimization state changes.
     */
    const projectsColumnsByModule: ColumnDef<ProjectKPIRuleLabel>[] = useMemo(
        () => [
            {
                accessorKey: "projects",
                header: () => (
                    <div className="top-0 z-10 sticky flex flex-row justify-between items-center border-b-2 w-max h-max max-h-24">
                        {modulesMetadata.map((moduleData, index) => {
                            const isLastModule = index === modulesMetadata.length - 1;
                            const isCurrentModuleMinimized = rowsMinimized.includes(moduleData.module.id);

                            return (
                                <div
                                    key={`kpi-projects-module-${moduleData.module.id}`}
                                    className={cn(
                                        "flex flex-col justify-between items-center border-r-2 w-max h-max max-h-24",
                                        isCurrentModuleMinimized && "min-w-[140px]! max-w-[160px]! w-[160px]",
                                        isLastModule && "border-r-0!",
                                    )}
                                >
                                    <TableHeaderItemWithCustomItem
                                        className={cn(
                                            "gap-4 border-r-0 font-semibold capitalize",
                                            isCurrentModuleMinimized && "min-w-[140px]! max-w-[160px]! w-full **:truncate",
                                        )}
                                        customIcon={<ChevronsLeftRight />}
                                        handleIconClick={() => handleSetModulesMinimized(moduleData.module.id)}
                                    >
                                        {moduleData.module.title}
                                    </TableHeaderItemWithCustomItem>
                                    <div className="flex flex-row justify-between items-center *:last:border-r-0! w-full h-max max-h-12">
                                        <DefaultTableHeaderCell
                                            className={cn(
                                                "justify-center items-center px-2! border-r w-40 h-12",
                                                isCurrentModuleMinimized && "w-full",
                                            )}
                                        >
                                            {isCurrentModuleMinimized ? "Total" : "T"}
                                        </DefaultTableHeaderCell>
                                        {!isCurrentModuleMinimized &&
                                            moduleData.projects.map((project) => (
                                                <DefaultTableHeaderCell
                                                    key={`kpi-project-header-${project.id}`}
                                                    className="flex justify-center items-center border-r border-dashed w-40 h-12 text-xs"
                                                >
                                                    {project.type}
                                                </DefaultTableHeaderCell>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ),
                cell: ({ row }) => {
                    const isLastRow = PROJECTS_KPIS_RULES_LABELS.length - 1 === row.index;
                    const currentRule = row.original.rule;

                    return (
                        <div className="flex flex-row justify-between items-center border-0 w-max h-max">
                            {modulesMetadata.map((moduleData) => {
                                const isCurrentModuleMinimized = rowsMinimized.includes(moduleData.module.id);

                                // Use pre-calculated value from cache (O(1) lookup)
                                const modulePercentage = moduleStatsCache[moduleData.module.id]?.[currentRule] || "-";

                                return (
                                    <div
                                        key={`kpi-projects-cell-module-${moduleData.module.id}-rule-${currentRule}`}
                                        className={cn(
                                            "flex flex-row justify-between items-center border-r-2 last:border-r-0! *:last:border-r-0! w-max h-max",
                                            isCurrentModuleMinimized && "min-w-[140px]! max-w-[160px]! w-[160px]",
                                        )}
                                    >
                                        <DefaultTableColumnCell
                                            className={cn(
                                                "justify-center border-r w-40 h-12",
                                                isCurrentModuleMinimized && "min-w-[140px]! max-w-[160px]! w-[160px]",
                                            )}
                                            isLastElementOnVertical={isLastRow}
                                        >
                                            {modulePercentage}
                                        </DefaultTableColumnCell>
                                        {!isCurrentModuleMinimized &&
                                            moduleData.projects.map((project, projectIndex) => {
                                                const isLastProject = projectIndex === moduleData.projects.length - 1;

                                                // Use pre-calculated value from cache (O(1) lookup)
                                                const projectPercentage = projectStatsCache[project.id]?.[currentRule] || "-";

                                                return (
                                                    <div
                                                        key={`kpi-projects-cell-project-${project.id}`}
                                                        className={cn("border-b", isLastRow && "border-b-0!")}
                                                    >
                                                        <DefaultTableColumnCell
                                                            className="border-b-0! border-dashed justify-center w-40 h-12"
                                                            isLastElementOnHorizontal={isLastProject}
                                                        >
                                                            {projectPercentage}
                                                        </DefaultTableColumnCell>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                },
            },
        ],
        // handleSetModulesMinimized is a stable callback from useCallback with no dependencies
        // Including it would cause infinite re-renders due to reference changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [modulesMetadata, rowsMinimized, moduleStatsCache, projectStatsCache],
    );

    /**
     * Combined columns array, memoized to prevent unnecessary re-renders.
     */
    return useMemo(() => [...indexColumns, ...projectsColumnsByModule], [indexColumns, projectsColumnsByModule]);
};
