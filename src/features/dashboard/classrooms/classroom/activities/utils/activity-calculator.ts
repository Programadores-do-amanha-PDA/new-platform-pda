import { ClassActivity } from "../types";

/**
 * Represents the activity participation result for a user
 */
export interface ActivityParticipationResult {
    status: "E" | "F" | "PJ" | "--";
    label: string;
    color: string;
    allowJustification: boolean;
}

/**
 * Calculates user participation status for an activity
 *
 * This function determines participation based on:
 * - User participation in the activity
 * - Available justifications (if user provided one)
 * - Whether user should be aggregated in metrics
 *
 * @param activity - The classroom activity to analyze
 * @param userEmail - Email of the user to calculate participation for
 * @param shouldAggregateInMetric - Whether this user should be counted in metrics (default: true)
 * @returns ClassActivity participation result with status, label, color, and justification access
 *
 * @example
 * ```typescript
 * const result = calculateUserActivityParticipation(
 *   activity,
 *   'student@email.com',
 *   false // User not counted in metrics
 * );
 *
 * console.log(result.status); // '--' (if not in metrics and no participation/justification)
 * console.log(result.label); // 'Não contabilizado na métrica'
 * ```
 *
 * @remarks
 * - Justifications take precedence over participation status
 * - Returns "--" status for users not in metrics without participation/justification
 * - Users with participation or justification show normal status even if not in metrics
 */
export function calculateUserActivityParticipation(
    activity: ClassActivity,
    userEmail: string,
    shouldAggregateInMetric: boolean = true,
): ActivityParticipationResult {
    const hasUserParticipated = activity.participants_email?.includes(userEmail) || false;

    const hasJustificationForUser = activity.justifications?.some((j) => j.user_email === userEmail) || false;

    let status: "E" | "F" | "PJ" = "F";

    if (hasUserParticipated) {
        status = "E";
    } else if (hasJustificationForUser) {
        status = "PJ";
    }

    // Check if user shouldn't be in metrics and has no participation/justification
    if (!shouldAggregateInMetric && !hasUserParticipated && !hasJustificationForUser) {
        return {
            status: "--",
            label: "Não contabilizado na métrica",
            color: "text-muted-foreground",
            allowJustification: false,
        };
    }

    // Return normal status with appropriate styling and justification access
    return {
        status,
        label: getStatusLabel(status),
        color: getStatusColor(status),
        allowJustification: true,
    };
}

/**
 * Gets the display label for a participation status
 *
 * @param status - The participation status
 * @returns Human-readable label
 */
function getStatusLabel(status: "E" | "F" | "PJ"): string {
    const labels = {
        E: "Participou",
        F: "Não Participou",
        PJ: "Participação Justificada",
    };

    return labels[status];
}

/**
 * Gets the CSS color class for a participation status
 *
 * @param status - The participation status
 * @returns CSS color class
 */
function getStatusColor(status: "E" | "F" | "PJ"): string {
    const colors = {
        E: "text-green-500",
        F: "text-red-500",
        PJ: "text-orange-500",
    };

    return colors[status];
}
