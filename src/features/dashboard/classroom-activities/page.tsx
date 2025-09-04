"use client";
import { useParams } from "next/navigation";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useUsersStore } from "@/stores/modules/users/users-store";
import ActivitiesTable from "./components/activities-table";

export default function ClassroomActivitiesPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { users } = useUsersStore();
  const { activities } = useClassroomActivityStore();

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const classroomUsers = users.filter(
    (user) =>
      user.profile?.classrooms
        ?.map((c) => c.classroom_id)
        ?.includes(classroom_id) &&
      user.profile?.user_roles?.map((r) => r.role).includes("student")
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
