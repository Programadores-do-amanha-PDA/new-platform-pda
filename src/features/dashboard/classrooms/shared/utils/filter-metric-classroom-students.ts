import { logger } from "@/lib/logger";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/stack-provider/roles/admin/sidebar-config";
import { UserMode, UserModeFeatureRule } from "../../classroom/settings";

type FilterMetricClassroomStudentsProps = {
    users: Partial<AuthUserWithProfile>[];
    classroomId: string;
    userModes: UserMode[];
    ruleId: (typeof ADMIN_CLASSROOM_PAGES_KEYS)[number];
};

const log = logger.child({ module: "FilterMetricClassroomStudents" });

/**
 * Filters users to return only those enrolled in a specific classroom with modes that aggregate in metrics.
 *
 * @param {Object} params - The filtering parameters
 * @param {AuthUserWithProfile[]} params.users - The list of users to filter
 * @param {string} params.classroomId - The ID of the classroom to filter by
 * @param {UserMode[]} params.userModes - The list of user modes with feature rules
 * @param {string} params.ruleId - The ID of the feature rule to check for metric aggregation
 *
 * @returns {AuthUserWithProfile[]} An array of users enrolled in the specified classroom
 * whose enrollment mode is either null or has the metric aggregation flag enabled for the given rule.
 * Returns an empty array if an error occurs during filtering.
 *
 * @example
 * const filteredUsers = filterMetricClassroomStudents({
 *   users: allUsers,
 *   classroomId: "classroom-123",
 *   userModes: userModes,
 *   ruleId: "rule-456"
 * });
 */
export function filterMetricClassroomStudents({
    users,
    classroomId,
    userModes,
    ruleId,
}: FilterMetricClassroomStudentsProps): AuthUserWithProfile[] {
    try {
        if (!users) {
            throw new Error("users parameter is required.");
        }

        if (users.length === 0) {
            throw new Error("users array is empty.");
        }

        if (!userModes) {
            throw new Error("userModes parameter is required.");
        }

        if (userModes.length === 0) {
            throw new Error("userModes array is empty.");
        }

        if (!ruleId) {
            throw new Error("ruleId is required.");
        }

        if (!classroomId) {
            throw new Error("classroomId is required.");
        }
        const aggregateInMetricModeIds = new Set(
            userModes
                .filter((mode) => {
                    const modeFeaturesRules = mode.featuresRules?.find((rule: UserModeFeatureRule) => rule.id === ruleId);
                    return modeFeaturesRules?.aggregateInMetric ?? false;
                })
                .map((mode) => mode.id),
        );

        return users.filter((user): user is AuthUserWithProfile =>
            Boolean(
                user.profile?.enrollments?.some(
                    (enrollment) =>
                        enrollment.classroom_id === classroomId &&
                        // Enrollment mode should be null (default) or be in the metric aggregation set
                        (enrollment.mode === null || aggregateInMetricModeIds.has(enrollment.mode)),
                ),
            ),
        ) as AuthUserWithProfile[];
    } catch (error) {
        log.error({ err: error, operation: "filterMetricClassroomStudents" }, "Error filtering metric classroom students");
        return [];
    }
}
