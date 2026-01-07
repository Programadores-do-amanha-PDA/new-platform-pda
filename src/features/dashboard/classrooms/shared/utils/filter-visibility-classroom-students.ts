import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/stack-provider/roles/admin/sidebar-config";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { UserMode, UserModeFeatureRule } from "../../classroom/settings";

/**
 * Filters users by classroom ID and user mode presence requirement
 *
 * This function returns users who:
 * - Belong to the specified classroom
 * - Have a user mode that is marked as "must be present"
 *
 * @param users - Array of User objects to filter (partial allowed for flexibility)
 * @param classroomId - The specific classroom ID to filter by
 * @param userModes - Array of user mode configurations from classroom settings
 * @returns Filtered array of complete User objects that meet the criteria
 *
 * @example
 * ```typescript
 * const activeStudents = filterVisibilityClassroomStudents(
 *   allUsers,
 *   'classroom-123',
 *   userModesConfig
 * );
 * ```
 *
 * @remarks
 * This function is useful for attendance systems, classroom management,
 * and scenarios where certain user modes require physical/online presence
 */
export function filterVisibilityClassroomStudents(
  users: Partial<AuthUserWithProfile>[],
  classroomId: string,
  userModes: UserMode[],
  ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number]
): AuthUserWithProfile[] {
  const mustBeVisibleModeIds = new Set(
    userModes
      .filter((mode) => {
        const modeFeatureRules = mode.featuresRules?.find(
          (rule: UserModeFeatureRule) => rule.id === ruleId
        );
        return modeFeatureRules?.isVisible ?? false;
      })
      .map((mode) => mode.id)
  );

  return users.filter((user): user is AuthUserWithProfile =>
    Boolean(
      user.profile?.enrollments?.some(
        (enrollment) =>
          enrollment.classroom_id === classroomId &&
          // enrollment mode should not exist and be in the presence-required set
          (enrollment.mode === null || mustBeVisibleModeIds.has(enrollment.mode))
      )
    )
  ) as AuthUserWithProfile[];
}
