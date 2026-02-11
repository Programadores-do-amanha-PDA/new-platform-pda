import { logger } from "@/lib/logger";
import { Profile } from "@/features/users/profile/types/profile";
import { NoteAverage, ProjectKpis } from "./types";
import { ClassroomProject } from "@/features/classroom-projects/types/projects/project";
import { ClassroomProjectCorrection } from "@/features/classroom-projects/types/corrections/corrections";
import { ClassroomProjectDelivery } from "@/features/classroom-projects/types/deliveries/delivery";

const log = logger.child({ module: "useProjectsKpisCalcs" });

const PROJECT_TYPE_LABELS: { [key: string]: string } = {
    mini_project: "MP",
    end_module_project: "P",
    end_module_english_project: "PI",
};

/**
 * Calculates the percentage of users who delivered a project.
 *
 * @param deliveries - List of project deliveries.
 * @param users - List of users to calculate metrics for.
 * @param project - The classroom project.
 * @returns The delivered percentage or null if calculation cannot be performed.
 */
export const calculatingProjectDeliveredPercentageByClassroomUsers = ({
    deliveries,
    users,
    project,
}: {
    deliveries: ClassroomProjectDelivery[];
    users: Profile[];
    project: ClassroomProject;
}) => {
    // Early return validations
    if (deliveries.length === 0) {
        log.warn({ projectId: project.id }, "No deliveries found for project");
        return null;
    }

    if (users.length === 0) {
        log.warn({ projectId: project.id }, "No users found for metric calculation");
        return null;
    }

    // Get unique user_ids and members_ids from deliveries
    const allUsersIdsByDeliveries = new Set(deliveries.map((delivery) => delivery.user_id));
    const allMembersIdsByDeliveries = new Set(deliveries.map((delivery) => delivery.members_id).flat());

    let deliveredCount = 0;

    if (project.project_type === "mini_project") {
        deliveredCount = users.filter((user) => allUsersIdsByDeliveries.has(user.id)).length;
    } else if (project.project_type === "end_module_english_project" || project.project_type === "end_module_project") {
        deliveredCount =
            users.filter((user) => allUsersIdsByDeliveries.has(user.id)).length +
            users.filter((user) => allMembersIdsByDeliveries.has(user.id)).length;
    } else {
        log.warn({ projectId: project.id, projectType: project.project_type }, "Unknown project type");
        return null;
    }

    return (deliveredCount / users.length) * 100;
};

/**
 * Calculates the distribution of notes for a project as percentages.
 *
 * @param corrections - List of project corrections.
 * @param users - List of users to calculate metrics for.
 * @param project - The classroom project.
 * @returns Array of note averages (empty array if no corrections found).
 */
export const calculatingNotesAverageByNote = ({
    corrections,
    users,
    project,
}: {
    corrections: ClassroomProjectCorrection[];
    users: Profile[];
    project: ClassroomProject;
}): NoteAverage[] => {
    // Early return validations
    if (corrections.length === 0) {
        log.info({ projectId: project.id }, "No corrections found for project");
        return [];
    }

    if (users.length === 0) {
        log.warn({ projectId: project.id }, "No users found for metric calculation");
        return [];
    }

    const totalCorrections = corrections.length;
    const allUniqueNotesByProjectCorrections = new Set(corrections.map((correction) => correction.final_note));
    const averageByNotes: NoteAverage[] = [];

    allUniqueNotesByProjectCorrections.forEach((note) => {
        const count = corrections.filter((correction) => correction.final_note === note).length;

        averageByNotes.push({
            note,
            average: Math.round((count / totalCorrections) * 100),
        });
    });

    if (averageByNotes.length === 0) {
        log.info({ projectId: project.id }, "No valid notes found for average calculation");
        return [];
    }

    return averageByNotes;
};

/**
 * Calculates KPIs for a single project.
 *
 * @param project - The classroom project.
 * @param deliveriesByProject - Deliveries filtered for this project.
 * @param correctionsByProject - Corrections filtered for this project.
 * @param allAggregateInMetricUsers - Users to calculate metrics for.
 * @returns Project KPIs or null if calculation fails.
 */
export const calculateProjectKPIs = (
    project: ClassroomProject,
    deliveriesByProject: ClassroomProjectDelivery[],
    correctionsByProject: ClassroomProjectCorrection[],
    allAggregateInMetricUsers: Profile[],
): ProjectKpis | null => {
    const projectDeliveredPercentage = calculatingProjectDeliveredPercentageByClassroomUsers({
        deliveries: deliveriesByProject,
        users: allAggregateInMetricUsers,
        project,
    });

    if (projectDeliveredPercentage === null) {
        log.warn({ projectId: project.id }, "Could not calculate delivered percentage for project");
        return null;
    }

    const projectNotDeliveredPercentage = Math.round(100 - projectDeliveredPercentage);

    const projectAverageByNotes = calculatingNotesAverageByNote({
        corrections: correctionsByProject,
        users: allAggregateInMetricUsers,
        project,
    });

    if (projectAverageByNotes === null) {
        log.warn({ projectId: project.id }, "Could not calculate average by notes for project");
        return null;
    }

    const projectMaxRuleAverage = projectAverageByNotes.find((noteAvg) => noteAvg.note === "10")?.average || 0;
    const projectOKRuleAverage =
        projectAverageByNotes
            .filter((noteAvg) => noteAvg.note <= "9" && noteAvg.note >= "7")
            .reduce((acc, curr) => acc + curr.average, 0) || 0;
    const projectMinRuleAverage =
        projectAverageByNotes
            .filter((noteAvg) => noteAvg.note <= "6" && noteAvg.note >= "1")
            .reduce((acc, curr) => acc + curr.average, 0) || 0;
    const projectBelowMinRuleAverage = projectAverageByNotes.find((noteAvg) => noteAvg.note === "0")?.average || 0;

    return {
        project: {
            id: project.id,
            type: PROJECT_TYPE_LABELS[project.project_type] || project.project_type,
            title: project.title,
        },
        kpis: {
            delivered: projectDeliveredPercentage,
            not_delivered: projectNotDeliveredPercentage,
            averageByRules: {
                max: projectMaxRuleAverage,
                ok: projectOKRuleAverage,
                min: projectMinRuleAverage,
                below_min: projectBelowMinRuleAverage,
            },
            averageByNotes: projectAverageByNotes,
        },
    };
};

export const PROJECTS_KPIS_RULES_LABELS = [
    { rule: "max", label: "Máximo (10)" },
    { rule: "ok", label: "OK (7 a 9)" },
    { rule: "min", label: "Mínimo (1 a 6)" },
    { rule: "below_min", label: "Impossível ser Avaliado (0)" },
    ...Array.from({ length: 11 }, (_, index) => ({
        rule: `${index}`,
        label: `${index}`,
    })).sort((a, b) => Number(b.rule) - Number(a.rule)),
];
