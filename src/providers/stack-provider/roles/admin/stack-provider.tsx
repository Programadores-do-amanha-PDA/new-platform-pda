"use client";

import { useEnrollmentsStore } from "@/features/dashboard/shared/enrollments";
import { useUsersStore } from "@/features/dashboard/shared/users";
import { useZoomMeetingStore } from "@/features/dashboard/classrooms/room/integrations/zoom/stores";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classrooms/room/integrations/coodesh/stores/assessments";
import { useClassroomProjectStore } from "@/features/dashboard/classrooms/room/projects/stores";
import { useClassroomStore } from "@/features/dashboard/classrooms/classrooms-homepage/store";
import { BaseStackProvider } from "../../shared/base-stack-provider";

interface AdminStackProviderProps {
    children: React.ReactNode;
    loadInitialData?: boolean;
}

export const AdminStackProvider = ({ children, loadInitialData = true }: AdminStackProviderProps) => {
    const classroomStore = useClassroomStore();
    const projectStore = useClassroomProjectStore();
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const usersStore = useUsersStore();
    const enrollmentsStore = useEnrollmentsStore();

    const handleLoadData = async () => {
        await Promise.all([
            classroomStore.getAllClassrooms(),
            usersStore.fetchAllUsersWithProfiles({}),
            enrollmentsStore.fetchAllEnrollments(),
        ]);
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
            allowedRoles={["admin"]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
            classrooms={classroomStore.classrooms}
        >
            {children}
        </BaseStackProvider>
    );
};
