"use client";

import { useParams } from "next/navigation";

import { useUsersStore } from "@/features/users/management";


import { useActivityStore } from "./store";
import ActivitiesTable from "./components/table/activities-table";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useClassroomSettingStore } from "../classrooms/settings";
import { filterVisibilityClassroomStudents, filterMetricClassroomStudents } from "../classrooms/utils";

export default function ClassroomActivitiesPage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const { enrollmentsByUserId } = useEnrollmentsManagementStore();
    const { users } = useUsersStore();
    const { settingsByClassroom } = useClassroomSettingStore();
    const { activities } = useActivityStore();
    const currentClassroomConfig = settingsByClassroom[classroom_id];
    const classroomSettingUserModes = currentClassroomConfig?.user_modes || [];

    if (!classroom_id) {
        return <div>Turma não encontrada.</div>;
    }

    const allVisibleUsers = filterVisibilityClassroomStudents({
        users,
        classroomId: classroom_id,
        userModes: classroomSettingUserModes,
        ruleId: "activities",
        enrollmentsByUserId,
    });

    const allAggregateInMetricUsers = filterMetricClassroomStudents({
        users,
        classroomId: classroom_id,
        userModes: classroomSettingUserModes,
        ruleId: "activities",
        enrollmentsByUserId,
    });

    const sortedActivities = activities
        .filter((activity) => activity.classroom_id === classroom_id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="p-6 w-full h-full">
            <ActivitiesTable
                allVisibleUsers={allVisibleUsers}
                allAggregateInMetricUsers={allAggregateInMetricUsers}
                activities={sortedActivities}
                classroomId={classroom_id}
            />
        </div>
    );
}
