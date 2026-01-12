import { ClassroomProject } from "../../../projects/types";

export type NoteAverage = { note: string; average: number };

export type AverageByRules = {
    max: number;
    ok: number;
    min: number;
    below_min: number;
};

export type ProjectKpis = {
    project: {
        id: string;
        type: string;
        title: string;
    };
    kpis: {
        delivered: number;
        not_delivered: number;
        averageByRules: AverageByRules;
        averageByNotes: NoteAverage[];
    };
};

export type projectKPIsByModules = {
    module: { id: string; title: string };
    projects: ProjectKpis[];
};

/**
 * Simplified module structure containing only metadata needed for column rendering.
 * Full KPI data is stored in separate caches for performance.
 */
export type ModuleMetadata = {
    readonly module: {
        readonly id: string;
        readonly title: string;
    };
    readonly projects: ReadonlyArray<{
        readonly id: string;
        readonly type: string;
        readonly title: string;
    }>;
};
