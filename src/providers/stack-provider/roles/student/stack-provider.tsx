"use client";

import { useUsersStore } from "@/features/users/management";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useZoomMeetingStore } from "@/features/dashboard/classrooms/classroom/integrations/zoom/stores";
import { useCoodeshAssessmentStore } from "@/features/dashboard/classrooms/classroom/integrations/coodesh/stores/assessments";
import { BaseStackProvider } from "../../shared/base-stack-provider";
import { useClassroomProjectStore } from "@/features/dashboard/classrooms/classroom/projects/stores";
import { useClassroomStore } from "@/features/dashboard/classrooms/home-page/store";
import { RolesLabels } from "@/features/auth/access-control/types";

interface StudentStackProviderProps {
    children: React.ReactNode;
    loadInitialData?: boolean;
}

export const StudentStackProvider = ({ children, loadInitialData = true }: StudentStackProviderProps) => {
    const usersStore = useUsersStore();
    const classroomStore = useClassroomStore();
    const projectStore = useClassroomProjectStore();
    const coodeshAssessmentStore = useCoodeshAssessmentStore();
    const zoomMeetingStore = useZoomMeetingStore();
    const enrollmentsStore = useEnrollmentsManagementStore();

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
            Object.values(enrollmentsStore.enrollmentsByUserId)
                .flat()
                .map((enrollment) => [enrollment.short_id, enrollment.short_id]),
        ),
    });

    return (
        <BaseStackProvider
            allowedRoles={[RolesLabels.STUDENT]}
            loadInitialData={loadInitialData}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
            classrooms={classroomStore.classrooms}
        >
            {children}
        </BaseStackProvider>
    );
};
