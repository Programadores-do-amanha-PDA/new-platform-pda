"use client";

import { useUsersStore } from "@/features/dashboard/shared/users";
import { useEnrollmentsStore } from "@/features/dashboard/shared/enrollments";
import { useClassroomStore } from "@/features/dashboard/classrooms/classroom-list/stores/classrooms";
import { useProjectStore } from "@/features/dashboard/classrooms/room/classroom-projects/stores";
import { useZoomMeetingStore } from "@/features/dashboard/classrooms/room/integrations/classroom-zoom/stores";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classrooms/room/integrations/coodesh/stores/assessments";
import { BaseStackProvider } from "../../shared/base-stack-provider";

interface StudentStackProviderProps {
    children: React.ReactNode;
    loadInitialData?: boolean;
}

export const StudentStackProvider = ({ children, loadInitialData = true }: StudentStackProviderProps) => {
    const usersStore = useUsersStore();
    const classroomStore = useClassroomStore();
    const projectStore = useProjectStore();
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const enrollmentsStore = useEnrollmentsStore();

    const handleLoadData = async () => {
        await Promise.all([usersStore.fetchAllUsersWithProfiles({})]);
    };

    const getFeaturesData = () => ({
        classrooms: new Map(classroomStore.classrooms.map((classroom) => [classroom.id, classroom.name])),
        projects: new Map(projectStore.projects.map((project) => [project.id, project.title])),
        coodeshAssessments: new Map(
            coodeshAssessmentStore.assessments.map((assessment) => [assessment.assessment_id, assessment.name]),
        ),
        zoomMeetings: new Map(zoomMeetingStore.meetings.map((meeting) => [meeting.id, meeting.topic])),
        enrollments: new Map(
            Array.from(enrollmentsStore.enrollments.entries()).flatMap(([, enrollments]) =>
                enrollments.map((enrollment) => [enrollment.short_id, enrollment.short_id]),
            ),
        ),
    });

    return (
        <BaseStackProvider
            allowedRoles={["student"]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
            classrooms={classroomStore.classrooms}
        >
            {children}
        </BaseStackProvider>
    );
};
