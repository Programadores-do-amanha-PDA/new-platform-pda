import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/features/classrooms/utils/constants";
import { Enrollment } from "@/features/enrollments";
import { UserMode, UserModeFeatureRule } from "../settings";
import { Profile } from "@/features/users/profile/types/profile";

interface FilterVisibilityClassroomStudentsParams {
    users: Profile[];
    classroomId: string;
    userModes: UserMode[];
    ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number];
    enrollmentsByUserId: Record<string, Enrollment[]>;
}


/**
 * Filters a list of users to determine which ones should be visible in a classroom
 * based on their enrollments, user modes, and feature rules.
 *
 * @param {Object} params - The parameters for filtering visibility.
 * @param {Profile[]} params.users - The list of user profiles to filter.
 * @param {string} params.classroomId - The ID of the classroom to check visibility for.
 * @param {UserMode[]} params.userModes - The list of user modes, each containing feature rules.
 * @param {string} params.ruleId - The ID of the rule to check for visibility.
 * @param {Record<string, Enrollment[]>} params.enrollmentsByUserId - A mapping of user IDs to their enrollments.
 *
 * @returns {Profile[]} - A filtered list of user profiles that are visible in the specified classroom.
 */
export function filterVisibilityClassroomStudents({
    users,
    classroomId,
    userModes,
    ruleId,
    enrollmentsByUserId,
}: FilterVisibilityClassroomStudentsParams): Profile[] {
    // Early return for empty/invalid data - these are valid states
    if (!users || users.length === 0) {
        return [];
    }

    if (!userModes || userModes.length === 0) {
        return [];
    }

    if (!enrollmentsByUserId || Object.keys(enrollmentsByUserId).length === 0) {
        return [];
    }

    if (!classroomId || !ruleId) {
        return [];
    }

    const mustBeVisibleModeIds = new Set(
        userModes
            .filter((mode) => {
                const modeFeatureRules = mode.featuresRules?.find((rule: UserModeFeatureRule) => rule.id === ruleId);
                return modeFeatureRules?.isVisible ?? false;
            })
            .map((mode) => mode.id),
    );

    return users.filter((user): user is Profile =>
        Boolean(
            enrollmentsByUserId[user.id]?.some(
                (enrollment) =>
                    enrollment.classroom_id === classroomId &&
                    // enrollment mode should not exist and be in the presence-required set
                    (enrollment.mode === null || mustBeVisibleModeIds.has(enrollment.mode)),
            ),
        ),
    ) as Profile[];
}
