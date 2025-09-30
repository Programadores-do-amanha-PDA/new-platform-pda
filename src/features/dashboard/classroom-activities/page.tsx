"use client";
import { useParams } from "next/navigation";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useUsersStore } from "@/stores/modules/users/users-store";
import ActivitiesTable from "./components/activities-table";
import { filterClassroomStudents } from "../utils/filter-classroom-students";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";

export default function ClassroomActivitiesPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();

  const { users } = useUsersStore();
  const { configsByClassroom } = useClassroomConfigStore();
  const { activities } = useClassroomActivityStore();
  const currentClassroomConfig = configsByClassroom[classroom_id];

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const classroomUsers = filterClassroomStudents(
    users,
    classroom_id,
    currentClassroomConfig.user_modes
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
        users={classroomUsers}
        activities={sortedActivities}
        classroomId={classroom_id}
      />
    </div>
  );
}
