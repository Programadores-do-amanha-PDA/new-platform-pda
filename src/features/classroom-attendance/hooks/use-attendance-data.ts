import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUsersStore } from "@/features/users/management";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useClassroomSettingStore } from "@/features/classrooms/settings";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores/meetings";
import { useZoomMeetingPastInstanceStore } from "@/features/classroom-zoom/stores/past-instances";
import { filterVisibilityClassroomStudents, filterMetricClassroomStudents } from "@/features/classrooms/utils";
import { ZoomMeetingPastInstance } from "@/features/classroom-zoom/types/past-instances";
import { ZoomPastMeetingAndPastInstanciesAttendance } from "../types";
import { Profile } from "@/features/users/profile/types/profile";
import { UserMode } from "@/features/classrooms/settings/types";

interface UseAttendanceDataParams {
    readonly classroomId: string;
}

interface UseAttendanceDataReturn {
    readonly allPastsMeetings: ZoomPastMeetingAndPastInstanciesAttendance[];
    readonly allVisibleUsers: Profile[];
    readonly allAggregateInMetricUsers: Profile[];
    readonly userModes: UserMode[];
}

/**
 * Hook for managing and computing attendance data for a classroom.
 *
 * This hook orchestrates data fetching from multiple stores and performs memoized calculations
 * for the classroom attendance dashboard. It handles:
 * - Fetching and organizing past Zoom meetings and instances
 * - Filtering users based on visibility and metric aggregation rules
 * - Managing user modes configuration from classroom settings
 *
 * @param params - The hook parameters
 * @param params.classroomId - The ID of the classroom to fetch attendance data for
 *
 * @returns Object containing:
 * @returns allPastsMeetings - Array of past Zoom meetings and instances sorted by date
 * @returns allVisibleUsers - Users visible in attendance based on enrollment mode rules
 * @returns allAggregateInMetricUsers - Users included in metric calculations
 * @returns userModes - User modes configuration for the classroom
 *
 * @example
 * ```typescript
 * const {
 *   allPastsMeetings,
 *   allVisibleUsers,
 *   allAggregateInMetricUsers,
 *   userModes,
 * } = useAttendanceData({ classroomId: '123' });
 * ```
 */
export const useAttendanceData = ({ classroomId }: UseAttendanceDataParams): UseAttendanceDataReturn => {
    const users = useUsersStore(useShallow((state) => state.users));
    const { enrollmentsByUserId } = useEnrollmentsManagementStore();
    const meetings = useZoomMeetingStore(useShallow((state) => state.meetings));
    const pastInstances = useZoomMeetingPastInstanceStore(useShallow((state) => state.pastInstances));
    const classroomSettings = useClassroomSettingStore(
        useShallow((state) => state.settingsByClassroom[classroomId]),
    );

    /**
     * Memoize user modes from classroom settings.
     */
    const userModes = useMemo(() => classroomSettings?.user_modes || [], [classroomSettings?.user_modes]);

    /**
     * Memoize classroom-specific users.
     * Filters all users to only those enrolled in this classroom.
     */
    const classroomUsers = useMemo(() => {
        if (!users.length) return [];
        return users.filter((user) =>
            enrollmentsByUserId[user.id]?.some((enrollment) => enrollment.classroom_id === classroomId),
        );
    }, [users, classroomId, enrollmentsByUserId]);

    /**
     * Calculate all past meetings and instances, sorted by date.
     * Filters out future meetings and those not visible on schedule.
     */
    const allPastsMeetings = useMemo(() => {
        const now = new Date().getTime();

        const pastsMeetings: ZoomMeetingPastInstance[] = pastInstances
            ?.map((pastInstance) => ({
                ...pastInstance,
                meeting_type: "pastInstance",
            }))
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());

        return [
            ...pastsMeetings,
            ...meetings
                .filter((meeting) => meeting.type !== 8 && new Date(meeting.start_time || 0).getTime() < now)
                .flatMap((meeting) => ({ ...meeting, meeting_type: "meeting" })),
        ]
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime())
            .filter((m) => m.is_visible_on_schedule === true) as ZoomPastMeetingAndPastInstanciesAttendance[];
    }, [meetings, pastInstances]);

    /**
     * Filter users that should be visible in the attendance table.
     * Based on enrollment mode visibility rules.
     */
    const allVisibleUsers = useMemo(
        () =>
            filterVisibilityClassroomStudents({
                users: classroomUsers,
                classroomId,
                userModes,
                ruleId: "attendance",
                enrollmentsByUserId,
            }),
        [classroomUsers, classroomId, userModes, enrollmentsByUserId],
    );

    /**
     * Filter users that should be included in metric calculations.
     * Based on enrollment mode aggregation rules.
     */
    const allAggregateInMetricUsers = useMemo(
        () =>
            filterMetricClassroomStudents({
                users: classroomUsers,
                classroomId,
                userModes,
                ruleId: "attendance",
                enrollmentsByUserId,
            }),
        [classroomUsers, classroomId, userModes, enrollmentsByUserId],
    );

    return {
        allPastsMeetings,
        allVisibleUsers,
        allAggregateInMetricUsers,
        userModes,
    };
};
