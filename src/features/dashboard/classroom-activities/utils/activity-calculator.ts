import { ClassroomActivityT } from "../types";

/**
 * Represents the activity participation result for a user
 */
export interface ActivityParticipationResult {
  /** The participation status key */
  status: "E" | "F" | "PJ" | "--";
  /** The display label for the status */
  label: string;
  /** The CSS color class for the status */
  color: string;
  /** Whether the user should have access to justification dropdown */
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
 * @returns Activity participation result with status, label, color, and justification access
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
  activity: ClassroomActivityT,
  userEmail: string,
  shouldAggregateInMetric: boolean = true
): ActivityParticipationResult {
  // Check if user has participated in the activity
  const hasParticipated = activity.participants_email?.includes(userEmail) || false;
  
  // Check if user has provided a justification for this activity
  const hasJustification = activity.justifications?.some(
    (j) => j.user_email === userEmail
  ) || false;

  // Determine base status
  let status: "E" | "F" | "PJ" = "F";
  
  if (hasParticipated) {
    status = "E";
  } else if (hasJustification) {
    status = "PJ";
  }

  // Check if user shouldn't be in metrics and has no participation/justification
  if (!shouldAggregateInMetric && !hasParticipated && !hasJustification) {
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