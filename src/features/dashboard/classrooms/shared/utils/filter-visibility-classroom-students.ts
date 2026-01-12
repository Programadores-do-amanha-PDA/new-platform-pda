import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/stack-provider/roles/admin/sidebar-config";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { UserMode, UserModeFeatureRule } from "../../classroom/settings";

/**
 * Filters classroom students based on their enrollment mode visibility rules.
 *
 * This function determines which users should be visible in a classroom context by checking
 * if their enrollment modes have the specified feature rule enabled. Users with null modes
 * or modes that have the feature rule marked as visible will be included in the result.
 *
 * @param params - The filtering parameters
 * @param params.users - Array of partial user objects with profiles to filter
 * @param params.classroomId - The ID of the classroom to filter enrollments for
 * @param params.userModes - Array of user modes containing feature rules for visibility determination
 * @param params.ruleId - The ID of the feature rule to check for visibility (from ADMIN_CLASSROOM_PAGES_KEYS)
 *
 * @returns An array of authenticated users with profiles that match the visibility criteria
 *
 * @example
 * ```ts
 * const visibleStudents = filterVisibilityClassroomStudents({
 *   users: allUsers,
 *   classroomId: 'classroom-123',
 *   userModes: availableModes,
 *   ruleId: 'activities',
 * });
 * ```
 */
export function filterVisibilityClassroomStudents({
    users,
    classroomId,
    userModes,
    ruleId,
}: {
    users: Partial<AuthUserWithProfile>[];
    classroomId: string;
    userModes: UserMode[];
    ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number];
}): AuthUserWithProfile[] {
    const mustBeVisibleModeIds = new Set(
        userModes
            .filter((mode) => {
                const modeFeatureRules = mode.featuresRules?.find((rule: UserModeFeatureRule) => rule.id === ruleId);
                return modeFeatureRules?.isVisible ?? false;
            })
            .map((mode) => mode.id),
    );

    return users.filter((user): user is AuthUserWithProfile =>
        Boolean(
            user.profile?.enrollments?.some(
                (enrollment) =>
                    enrollment.classroom_id === classroomId &&
                    // enrollment mode should not exist and be in the presence-required set
                    (enrollment.mode === null || mustBeVisibleModeIds.has(enrollment.mode)),
            ),
        ),
    ) as AuthUserWithProfile[];
}
