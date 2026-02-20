import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { filterMetricClassroomStudents } from "@/features/classrooms/utils";
import { useUsersStore } from "@/features/users/management";

import { useClassroomProjectStore } from "../../../../classroom-projects/stores";
import { useClassroomProjectCorrectionsStore } from "../../../../classroom-projects/stores/corrections";
import { useClassroomProjectDeliveriesStore } from "../../../../classroom-projects/stores/deliveries";

import { ProjectKpis, ModuleMetadata } from "../types";
import { calculateProjectKPIs, PROJECTS_KPIS_RULES_LABELS } from "../utils";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useClassroomSettingStore } from "@/features/classrooms/settings";

interface UseProjectsKPIsDataParams {
    readonly classroomId: string;
}

interface UseProjectsKPIsDataReturn {
    readonly modulesMetadata: ModuleMetadata[];
    readonly moduleStatsCache: Record<string, Record<string, string>>;
    readonly projectStatsCache: Record<string, Record<string, string>>;
    readonly rowsMinimized: string[];
    readonly handleSetModulesMinimized: (moduleId: string) => void;
}

const PROJECTS_KPIS_STORAGE_KEY = "projects-kpis-columns-minimized-rows";

/**
 * Hook for managing and computing KPI data for classroom projects.
 *
 * This hook orchestrates data fetching from multiple stores, performs memoized calculations,
 * and manages UI state for the projects KPI dashboard. It handles:
 * - Filtering and organizing project data by modules
 * - Computing KPI metrics (delivery rates, performance by grading rules)
 * - Managing minimized/expanded state of module rows with localStorage persistence
 * - Pre-calculating statistics caches to optimize rendering performance
 *
 * @param params - The hook parameters
 * @param params.classroomId - The ID of the classroom to fetch KPI data for
 *
 * @returns Object containing:
 * @returns modulesMetadata - Array of modules with their projects (structure only, no stats)
 * @returns moduleStatsCache - Pre-calculated statistics for each module organized by rule
 * @returns projectStatsCache - Pre-calculated statistics for each project organized by rule
 * @returns rowsMinimized - Array of module IDs currently in minimized state
 * @returns handleSetModulesMinimized - Callback to toggle minimization state of a module
 *
 * @example
 * ```typescript
 * const {
 *   modulesMetadata,
 *   moduleStatsCache,
 *   projectStatsCache,
 *   rowsMinimized,
 *   handleSetModulesMinimized,
 * } = useProjectsKPIsData({ classroomId: '123' });
 * ```
 */
export const useProjectsKPIsData = ({ classroomId }: UseProjectsKPIsDataParams): UseProjectsKPIsDataReturn => {
    const allProjects = useClassroomProjectStore(useShallow((state) => state.projects));
    const deliveriesByClassroom = useClassroomProjectDeliveriesStore(useShallow((state) => state.deliveries[classroomId]));
    const correctionsByClassroom = useClassroomProjectCorrectionsStore(useShallow((state) => state.corrections[classroomId]));
    const { enrollmentsByUserId } = useEnrollmentsManagementStore();
    const users = useUsersStore(useShallow((state) => state.users));
    const classroomSettings = useClassroomSettingStore(useShallow((state) => state.settingsByClassroom[classroomId]));

    // Memoize filtered data to ensure stable references
    const classroomProjects = useMemo(
        () => allProjects.filter((p) => p.classroom_id === classroomId),
        [allProjects, classroomId],
    );

    const classroomDeliveries = useMemo(() => deliveriesByClassroom ?? [], [deliveriesByClassroom]);

    const classroomCorrections = useMemo(() => correctionsByClassroom ?? [], [correctionsByClassroom]);

    // Memoize settings with JSON comparison for stability
    const userModesKey = useMemo(() => JSON.stringify(classroomSettings?.user_modes ?? []), [classroomSettings?.user_modes]);

    const classroomModulesKey = useMemo(() => JSON.stringify(classroomSettings?.modules ?? []), [classroomSettings?.modules]);

    const userModes = useMemo(() => {
        const modes = classroomSettings?.user_modes;
        if (!modes || modes.length === 0) return [];
        return modes;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userModesKey]);


    const classroomModules = useMemo(() => {
        const modules = classroomSettings?.modules;
        if (!modules || modules.length === 0) return [];
        return modules;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classroomModulesKey]);

    // Memoize classroom-specific users
    const classroomUsers = useMemo(() => {
        if (!users.length) return [];
        return users.filter((user) =>
            enrollmentsByUserId[user.id]?.some((enrollment) => enrollment.classroom_id === classroomId),
        );
    }, [users, classroomId, enrollmentsByUserId]);

    const allAggregatedMetricUsers = useMemo(
        () =>
            filterMetricClassroomStudents({
                users: classroomUsers,
                classroomId,
                userModes,
                ruleId: "projects",
                enrollmentsByUserId,
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [classroomUsers, classroomId, userModesKey],
    );

    /**
     * State for managing which module rows are minimized in the table.
     * Persists to localStorage automatically.
     */
    const [rowsMinimized, setRowsMinimized] = useState<string[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            const stored = window.localStorage.getItem(PROJECTS_KPIS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    /**
     * Persist minimized rows state to localStorage whenever it changes.
     */
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(PROJECTS_KPIS_STORAGE_KEY, JSON.stringify(rowsMinimized));
    }, [rowsMinimized]);

    /**
     * Toggles the minimization state of a module row.
     * When minimized, the module displays in compact view.
     * When expanded, shows individual project breakdown.
     */
    const handleSetModulesMinimized = useCallback((moduleId: string) => {
        setRowsMinimized((prev) => {
            if (prev.includes(moduleId)) {
                return prev.filter((id) => id !== moduleId);
            }
            return [...prev, moduleId];
        });
    }, []);

    /**
     * Calculate project KPIs grouped by modules.
     * Only recalculates when relevant data changes.
     */
    const projectKPIsByModules = useMemo(() => {
        if (classroomModules.length === 0) {
            return [];
        }

        if (classroomProjects.length === 0) {
            return [];
        }

        if (classroomDeliveries.length === 0) {
            return [];
        }

        if (classroomCorrections.length === 0) {
            return [];
        }

        if (allAggregatedMetricUsers.length === 0) {
            return [];
        }

        return classroomModules
            .map((module) => {
                const moduleProjects = classroomProjects
                    .filter((project) => project.module === module.id)
                    .map((project) => {
                        const deliveriesByProject = classroomDeliveries.filter(
                            (delivery) => delivery.project_id === project.id,
                        );
                        const correctionsByProject = classroomCorrections.filter(
                            (correction) => correction.project_id === project.id,
                        );

                        return calculateProjectKPIs(
                            project,
                            deliveriesByProject,
                            correctionsByProject,
                            allAggregatedMetricUsers,
                        );
                    })
                    .filter((item): item is ProjectKpis => item !== null);

                return {
                    module: {
                        id: module.id,
                        title: module.title,
                    },
                    projects: moduleProjects,
                };
            })
            .filter((module) => module.projects.length > 0);
    }, [classroomModules, classroomProjects, classroomDeliveries, classroomCorrections, allAggregatedMetricUsers]);

    /**
     * Pre-calculate all module statistics to avoid recalculating in every cell.
     */
    const moduleStatsCache = useMemo(() => {
        const cache: Record<string, Record<string, string>> = {};

        projectKPIsByModules.forEach((moduleData) => {
            cache[moduleData.module.id] = {};

            PROJECTS_KPIS_RULES_LABELS.forEach(({ rule }) => {
                const totalDelivered = moduleData.projects.reduce((sum, p) => sum + p.kpis.delivered, 0);
                const totalNotDelivered = moduleData.projects.reduce((sum, p) => sum + p.kpis.not_delivered, 0);
                const totalStudents = totalDelivered + totalNotDelivered;

                let modulePercentage = "-";

                if (totalStudents > 0) {
                    if (rule === "max") {
                        const avgMax =
                            moduleData.projects.reduce((sum, p) => sum + p.kpis.averageByRules.max, 0) /
                            moduleData.projects.length;
                        modulePercentage = `${avgMax.toFixed(0)}%`;
                    } else if (rule === "ok") {
                        const avgOk =
                            moduleData.projects.reduce((sum, p) => sum + p.kpis.averageByRules.ok, 0) /
                            moduleData.projects.length;
                        modulePercentage = `${avgOk.toFixed(0)}%`;
                    } else if (rule === "min") {
                        const avgMin =
                            moduleData.projects.reduce((sum, p) => sum + p.kpis.averageByRules.min, 0) /
                            moduleData.projects.length;
                        modulePercentage = `${avgMin.toFixed(0)}%`;
                    } else if (rule === "below_min") {
                        const avgBelowMin =
                            moduleData.projects.reduce((sum, p) => sum + p.kpis.averageByRules.below_min, 0) /
                            moduleData.projects.length;
                        modulePercentage = `${avgBelowMin.toFixed(0)}%`;
                    } else {
                        const avgNote =
                            moduleData.projects.reduce((sum, p) => {
                                const noteData = p.kpis.averageByNotes.find((n) => n.note === rule);
                                return sum + (noteData?.average || 0);
                            }, 0) / moduleData.projects.length;
                        modulePercentage = `${avgNote.toFixed(0)}%`;
                    }
                }

                cache[moduleData.module.id][rule] = modulePercentage;
            });
        });

        return cache;
    }, [projectKPIsByModules]);

    /**
     * Pre-calculate project statistics for faster lookup.
     */
    const projectStatsCache = useMemo(() => {
        const cache: Record<string, Record<string, string>> = {};

        projectKPIsByModules.forEach((moduleData) => {
            moduleData.projects.forEach((project) => {
                cache[project.project.id] = {};

                PROJECTS_KPIS_RULES_LABELS.forEach(({ rule }) => {
                    let projectPercentage = "-";
                    const totalProjectStudents = project.kpis.delivered + project.kpis.not_delivered;

                    if (totalProjectStudents > 0) {
                        if (rule === "max") {
                            projectPercentage = `${project.kpis.averageByRules.max.toFixed(0)}%`;
                        } else if (rule === "ok") {
                            projectPercentage = `${project.kpis.averageByRules.ok.toFixed(0)}%`;
                        } else if (rule === "min") {
                            projectPercentage = `${project.kpis.averageByRules.min.toFixed(0)}%`;
                        } else if (rule === "below_min") {
                            projectPercentage = `${project.kpis.averageByRules.below_min.toFixed(0)}%`;
                        } else {
                            const noteData = project.kpis.averageByNotes.find((n) => n.note === rule);
                            projectPercentage = noteData ? `${noteData.average.toFixed(0)}%` : "0%";
                        }
                    }

                    cache[project.project.id][rule] = projectPercentage;
                });
            });
        });

        return cache;
    }, [projectKPIsByModules]);

    /**
     * Extract only metadata needed for column structure (ids and titles).
     */
    const modulesMetadata = useMemo<ModuleMetadata[]>(
        () =>
            projectKPIsByModules.map((moduleData) => ({
                module: {
                    id: moduleData.module.id,
                    title: moduleData.module.title,
                },
                projects: moduleData.projects.map((project) => ({
                    id: project.project.id,
                    type: project.project.type,
                    title: project.project.title,
                })),
            })),
        [projectKPIsByModules],
    );

    return {
        modulesMetadata,
        moduleStatsCache,
        projectStatsCache,
        rowsMinimized,
        handleSetModulesMinimized,
    };
};
