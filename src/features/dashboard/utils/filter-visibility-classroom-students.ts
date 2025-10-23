import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/admin/sidebar-config";
import { AuthUserWithProfileT, ClassroomConfigUserMode } from "@/types";

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
  users: Partial<AuthUserWithProfileT>[],
  classroomId: string,
  userModes: ClassroomConfigUserMode[],
  ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number]
): AuthUserWithProfileT[] {
  // Pre-compute a Set of mode IDs that require user presence
  // Using Set for O(1) lookup performance during filtering
  const mustBeVisibleModeIds = new Set(
    userModes
      .filter((mode) => {
        // Check if the feature rule is configured to be visible
        const modeRules = mode.featuresRules?.find(
          (rule) => rule.id === ruleId
        );
        return modeRules?.isVisible ?? false;
      })
      .map((mode) => mode.id) // Extract only the ID for efficient lookup
  );

  // Filter users based on classroom membership and mode requirements
  // Using type assertion since we verify the structure meets AuthUserWithProfileT requirements
  return users.filter((user): user is AuthUserWithProfileT =>
    // Check if user has a profile and classrooms array (optional chaining for safety)
    Boolean(
      user.profile?.classrooms?.some(
        (classroom) =>
          // User must belong to the specified classroom
          classroom.classroom_id === classroomId &&
          // User's classroom mode should not exist and be in the presence-required set
          (classroom.mode === null || mustBeVisibleModeIds.has(classroom.mode))
      )
    )
  ) as AuthUserWithProfileT[];
}
