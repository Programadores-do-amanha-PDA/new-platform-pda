"use client";

import { useParams } from "next/navigation";

import { useUsersStore } from "@/features/dashboard/shared/users/store";

import { useClassroomSettingStore } from "../settings";
import { filterVisibilityClassroomStudents, filterMetricClassroomStudents } from "../../shared/utils";

import { useActivityStore } from "./store";
import ActivitiesTable from "./components/table/activities-table";

export default function ClassroomActivitiesPage() {
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const { users } = useUsersStore();
    const { settingsByClassroom } = useClassroomSettingStore();
    const { activities } = useActivityStore();
    const currentClassroomConfig = settingsByClassroom[classroom_id];
    const classroomConfigUserModes = currentClassroomConfig?.user_modes || [];

    if (!classroom_id) {
        return <div>Turma não encontrada.</div>;
    }

    const allVisibleUsers = filterVisibilityClassroomStudents(users, classroom_id, classroomConfigUserModes, "activities");

    const allAggregateInMetricUsers = filterMetricClassroomStudents(
        users,
        classroom_id,
        classroomConfigUserModes,
        "activities",
    );

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
