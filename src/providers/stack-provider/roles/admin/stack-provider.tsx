"use client";

import { useClassroomStore } from "@/features/dashboard/roles/admin/classrooms/classroom-list/stores/classrooms";
import { useProjectStore } from "@/features/dashboard/roles/admin/classrooms/room/classroom-projects/stores";
import { useZoomMeetingStore } from "@/features/dashboard/roles/admin/classrooms/room/integrations/classroom-zoom/stores";
import { useCoodeshAssessmentStore } from "@/features/dashboard/roles/admin/classrooms/room/integrations/coodesh/stores/assessments";
import { useEnrollmentsStore } from "@/features/dashboard/shared/enrollments";
import { useUsersStore } from "@/features/dashboard/shared/users";
import { BaseStackProvider } from "../../shared/base-stack-provider";
import { useRolesStore } from "@/features/dashboard/roles/admin/users/stores/user-role";

interface AdminStackProviderProps {
    children: React.ReactNode;
    loadInitialData?: boolean;
}

export const AdminStackProvider = ({ children, loadInitialData = true }: AdminStackProviderProps) => {
    const classroomStore = useClassroomStore();
    const projectStore = useProjectStore();
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
        classrooms: new Map(
            classroomStore.classrooms.map((classroom) => [classroom.id, classroom.name])
        ),
        projects: new Map(
            projectStore.projects.map((project) => [project.id, project.title])
        ),
        coodeshAssessments: new Map(
            coodeshAssessmentStore.assessments.map((assessment) => [
                assessment.assessment_id,
                assessment.name,
            ])
        ),
        zoomMeetings: new Map(
            zoomMeetingStore.meetings.map((meeting) => [meeting.id, meeting.topic])
        ),
        enrollments: new Map(
            Array.from(enrollmentsStore.enrollments.entries()).flatMap(([, enrollments]) =>
                enrollments.map((enrollment) => [enrollment.short_id, enrollment.short_id])
            )
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
