import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/stack-provider/roles/admin/sidebar-config";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { UserMode, UserModeFeatureRule } from "../../classroom/settings";


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
  users: Partial<AuthUserWithProfile>[],
  classroomId: string,
  userModes: UserMode[],
  ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number]
): AuthUserWithProfile[] {
  const aggregateInMetricModeIds = new Set(
    userModes
      .filter((mode) => {
        const modeFeaturesRules = mode.featuresRules?.find(
          (rule: UserModeFeatureRule) => rule.id === ruleId
        );
        return modeFeaturesRules?.aggregateInMetric ?? false;
      })
      .map((mode) => mode.id)
  );

  return users.filter((user): user is AuthUserWithProfile =>
    Boolean(
      user.profile?.enrollments?.some(
        (enrollment) =>
          enrollment.classroom_id === classroomId &&
          // Enrollment mode should be null (default) or be in the metric aggregation set
          (enrollment.mode === null ||
            aggregateInMetricModeIds.has(enrollment.mode))
      )
    )
  ) as AuthUserWithProfile[];
}
