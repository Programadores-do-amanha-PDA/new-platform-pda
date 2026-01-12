import { useMemo } from "react";
import { ClassroomOverviewData, StudentOverview } from "@/types/classroom-overview";
import { calculatePresenceByType, calculateCoodeshScores, calculateProjectNotes, calculateGeneralPresence } from "../utils";
import { filterDataByDateRange } from "@/features/dashboard/shared/utils/filter-data-by-date-range";
import { filterVisibilityClassroomStudents } from "../../../shared/utils";
import { ClassActivity } from "../../activities";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { ClassroomSetting, UserMode } from "../../settings";
import { CoodeshAssessment } from "../../integrations/coodesh/types";
import { ZoomMeetingPastInstance, ZoomMeeting } from "../../integrations/zoom/types";
import { ClassroomProject, ClassroomProjectDelivery, ClassroomProjectCorrection } from "../../projects/types";

interface UseClassroomOverviewDataParams {
    readonly classroomId: string;
    readonly users: AuthUserWithProfile[];
    readonly currentSetting: ClassroomSetting;
    readonly currentSettingUserModes: UserMode[];
    readonly activities: ClassActivity[];
    readonly assessments: CoodeshAssessment[];
    readonly projects: ClassroomProject[];
    readonly classroomDeliveries: ClassroomProjectDelivery[];
    readonly classroomCorrections: ClassroomProjectCorrection[];
    readonly pastInstances: ZoomMeetingPastInstance[];
    readonly meetings: ZoomMeeting[];
    readonly dateRange: { from: Date; to: Date } | null;
}

/**
 * Custom hook to process classroom overview data including student indicators.
 * Manages the complex data transformation for classroom overview display.
 *
 * @param params - Configuration and data needed for processing
 * @returns Processed classroom overview data
 *
 * @example
 * const data = useClassroomOverviewData({
 *   classroomId: '123',
 *   users,
 *   currentSetting,
 *   // ... other params
 * });
 */
export const useClassroomOverviewData = (params: UseClassroomOverviewDataParams): ClassroomOverviewData => {
    const {
        classroomId,
        users,
        currentSetting,
        currentSettingUserModes,
        activities,
        assessments,
        projects,
        classroomDeliveries,
        classroomCorrections,
        pastInstances,
        meetings,
        dateRange,
    } = params;

    return useMemo(() => {
        // Filter classroom students
        const classroomStudents: AuthUserWithProfile[] = filterVisibilityClassroomStudents({
            users,
            classroomId,
            userModes: currentSettingUserModes,
            ruleId: "overview",
        });

        // Filter data by date range if provided
        const filteredPastInstances = dateRange
            ? filterDataByDateRange({
                  data: pastInstances.filter((p) => p.is_visible_on_schedule === true),
                  dateField: "start_time",
                  dateRange: dateRange,
              })
            : pastInstances.filter((p) => p.is_visible_on_schedule === true);

        const filteredMeetings = dateRange
            ? filterDataByDateRange({
                  data: meetings.filter((m) => m.is_visible_on_schedule === true),
                  dateField: "start_time",
                  dateRange: dateRange,
              })
            : meetings.filter((m) => m.is_visible_on_schedule === true);

        const filteredActivities: ClassActivity[] = dateRange
            ? filterDataByDateRange({
                  dateRange,
                  dateField: "created_at",
                  data: activities.filter((a) => a.is_visible_on_schedule),
              })
            : activities.filter((a) => a.is_visible_on_schedule);

        const filteredAssessments = dateRange
            ? filterDataByDateRange({
                  dateRange,
                  dateField: "created_at",
                  data: assessments.filter((a) => a.is_visible_on_schedule === true),
              })
            : assessments.filter((a) => a.is_visible_on_schedule === true);

        // Filter projects by classroom_id first, then by date if necessary
        const classroomProjects = projects.filter((project) => project.classroom_id === classroomId);
        const filteredProjects = dateRange
            ? filterDataByDateRange({ data: classroomProjects, dateField: "created_at", dateRange })
            : classroomProjects;

        // Create student data with indicators
        const studentsData: StudentOverview[] = classroomStudents.map((user, index) => {
            const studentEmail = user.email || "";
            const attendancesIndicators = calculatePresenceByType(
                filteredPastInstances,
                filteredMeetings,
                studentEmail,
                currentSetting?.class_types,
            );
            const coodeshIndicators = calculateCoodeshScores(studentEmail, filteredAssessments);
            const studentId = user.id || "";
            const projectIndicators = calculateProjectNotes(
                studentId,
                filteredProjects,
                classroomDeliveries,
                classroomCorrections,
            );
            const activitiesIndicators = calculateGeneralPresence(studentEmail, filteredActivities);
            const userEnrollments = user.profile?.enrollments?.find((enrollment) => enrollment.classroom_id === classroomId);

            return {
                id: user.id || "",
                shortId: userEnrollments?.short_id || "",
                name: user.profile?.full_name || "",
                email: studentEmail,
                number: index + 1,
                attendances: attendancesIndicators,
                activities: activitiesIndicators,
                coodesh: coodeshIndicators,
                projects: projectIndicators,
                userModeId: userEnrollments?.mode || "",
            };
        });

        // Prepare class types data
        const classTypes = Array.from(
            new Set([...filteredMeetings.map((m) => m.class_type), ...filteredPastInstances.map((p) => p.class_type)]),
        )
            .map((classType) => {
                const currentClassType = currentSetting?.class_types?.find((ct) => ct.id === classType);
                if (currentClassType) {
                    return {
                        id: currentClassType.id,
                        name: currentClassType.title,
                    };
                } else return null;
            })
            .filter(Boolean) as { id: string; name: string }[];

        if (classTypes.length > 0) {
            classTypes.unshift({
                id: "general",
                name: "Geral",
            });
        }

        // Prepare filtered Coodesh tests data
        const coodeshTests = filteredAssessments.map((assessment) => ({
            id: assessment.assessment_id,
            name: `Teste ${assessment.name}`,
        }));

        // Prepare filtered projects data
        const projectsData = filteredProjects.map((project) => ({
            id: project.id,
            name: project.title,
        }));

        // Prepare user modes data
        const userModes = (currentSetting?.user_modes || []).map((userMode) => ({
            ...userMode,
            featuresRules: userMode?.featuresRules?.map((rule) => ({
                ...rule,
                isVisible: rule.isVisible ?? true,
                aggregateInMetric: rule.aggregateInMetric ?? true,
            })),
        }));

        return {
            students: studentsData,
            classTypes,
            coodeshTests,
            projects: projectsData,
            userModes,
        };
    }, [
        classroomId,
        users,
        currentSetting,
        currentSettingUserModes,
        activities,
        assessments,
        projects,
        classroomDeliveries,
        classroomCorrections,
        pastInstances,
        meetings,
        dateRange,
    ]);
};
