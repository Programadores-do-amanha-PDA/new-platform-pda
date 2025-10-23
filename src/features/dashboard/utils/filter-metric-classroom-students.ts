import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/admin/sidebar-config";
import { AuthUserWithProfileT, ClassroomConfigUserMode } from "@/types";

/**
 * Filters users by classroom ID and user mode metric aggregation requirement
 *
 * This function returns users who:
 * - Belong to the specified classroom
 * - Have a user mode that is marked as "aggregateInMetric" for the specified rule
 *
 * @param users - Array of User objects to filter (partial allowed for flexibility)
 * @param classroomId - The specific classroom ID to filter by
 * @param userModes - Array of user mode configurations from classroom settings
 * @param ruleId - The specific rule ID to check for metric aggregation
 * @returns Filtered array of complete User objects that should be counted in metrics
 *
 * @example
 * ```typescript
 * const metricStudents = filterMetricClassroomStudents(
 *   allUsers,
 *   'classroom-123',
 *   userModesConfig,
 *   'attendance'
 * );
 * ```
 *
 * @remarks
 * This function is useful for calculating metrics, statistics, and reports
 * where only certain user modes should be included in the calculations
 */
export function filterMetricClassroomStudents(
  users: Partial<AuthUserWithProfileT>[],
  classroomId: string,
  userModes: ClassroomConfigUserMode[],
  ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number]
): AuthUserWithProfileT[] {
  // Pre-compute a Set of mode IDs that should be aggregated in metrics
  // Using Set for O(1) lookup performance during filtering
  const aggregateInMetricModeIds = new Set(
    userModes
      .filter((mode) => {
        // Check if the feature rule is configured to aggregate in metrics
        const modeRules = mode.featuresRules?.find(
          (rule) => rule.id === ruleId
        );
        return modeRules?.aggregateInMetric ?? false;
      })
      .map((mode) => mode.id) // Extract only the ID for efficient lookup
  );

  // Filter users based on classroom membership and metric aggregation requirements
  // Using type assertion since we verify the structure meets AuthUserWithProfileT requirements
  return users.filter((user): user is AuthUserWithProfileT =>
    // Check if user has a profile and classrooms array (optional chaining for safety)
    Boolean(
      user.profile?.classrooms?.some(
        (classroom) =>
          // User must belong to the specified classroom
          classroom.classroom_id === classroomId &&
          // User's classroom mode should be null (default) or be in the metric aggregation set
          (classroom.mode === null ||
            aggregateInMetricModeIds.has(classroom.mode))
      )
    )
  ) as AuthUserWithProfileT[];
}
