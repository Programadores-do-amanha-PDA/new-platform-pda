"use client";
import { useParams } from "next/navigation";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useUsersStore } from "@/stores/modules/users/users-store";
import ActivitiesTable from "./components/activities-table";
import { filterVisibilityClassroomStudents } from "../utils/filter-visibility-classroom-students";
import { useClassroomConfigStore } from "@/features/dashboard/classroom-configs/stores";
import { filterMetricClassroomStudents } from "../utils/filter-metric-classroom-students";

export default function ClassroomActivitiesPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();

  const { users } = useUsersStore();
  const { configsByClassroom } = useClassroomConfigStore();
  const { activities } = useClassroomActivityStore();
  const currentClassroomConfig = configsByClassroom[classroom_id];
  const classroomConfigUserModes = currentClassroomConfig?.user_modes || [];

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const allVisibleUsers = filterVisibilityClassroomStudents(
    users,
    classroom_id,
    classroomConfigUserModes,
    "activities"
  );

  const allAggregateInMetricUsers = filterMetricClassroomStudents(
    users,
    classroom_id,
    classroomConfigUserModes,
    "activities"
  );

  const sortedActivities = activities
    .filter((activity) => activity.classroom_id === classroom_id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div className="w-full h-full p-6">
      <ActivitiesTable
        allVisibleUsers={allVisibleUsers}
        allAggregateInMetricUsers={allAggregateInMetricUsers}
        activities={sortedActivities}
        classroomId={classroom_id}
      />
    </div>
  );
}
