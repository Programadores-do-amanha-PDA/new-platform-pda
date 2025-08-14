"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClassroomOverviewTable } from "./components/classroom-overview-table";
import {
  ClassroomOverviewData,
  StudentOverview,
} from "@/types/classroom-overview";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useCoodeshAssessmentStore } from "../classroom-coodesh/stores/assessments";
import {
  calculatePresenceByType,
  calculateCoodeshScores,
  calculateProjectNotes,
  calculateGeneralPresence,
} from "./utils";

export default function ClassroomAttendancePage() {
  const params = useParams();
  const classroomId = params.classroom_id as string;

  const [data, setData] = useState<ClassroomOverviewData>({
    students: [],
    coodeshTests: [],
    projects: [],
  });

  const { users } = useUsersStore();
  const { activities } = useClassroomActivityStore();
  const { assessments } = useCoodeshAssessmentStore();
  const { projects } = useProjectStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();
  const { meetings } = useZoomMeetingStore();

  useEffect(() => {
    // Filtrar estudantes que pertencem à turma atual
    const classroomStudents = users.filter((user) =>
      user.profile?.classrooms?.some(
        (classroom) => classroom.classroom_id === classroomId
      )
    );

    // Criar dados dos estudantes com indicadores
    const studentsData: StudentOverview[] = classroomStudents.map(
      (user, index) => {
        const studentEmail = user.email || "";

        // Calcular presenças por tipo usando zoom past instances e meetings passados
        const presenceIndicators = calculatePresenceByType(
          user.id || "",
          pastInstances.filter((p) => p.is_visible_on_schedule === true),
          meetings.filter((m) => m.is_visible_on_schedule === true),
          studentEmail
        );

        // Calcular scores dos testes Coodesh
        const coodeshIndicators = calculateCoodeshScores(
          studentEmail,
          assessments.filter((a) => a.is_visible_on_schedule === true)
        );

        // Calcular notas dos projetos
        const projectIndicators = calculateProjectNotes(studentEmail, projects);

        // Calcular presença geral das atividades
        const activitiesPresence = calculateGeneralPresence(
          studentEmail,
          activities.filter(a => a.is_visible_on_schedule)
        );

        return {
          id: user.id || "",
          name: user.profile?.full_name || "",
          email: studentEmail,
          number: index + 1,
          presence: presenceIndicators,
          activities: activitiesPresence,
          coodesh: coodeshIndicators,
          projects: projectIndicators,
        };
      }
    );

    // Preparar dados dos testes Coodesh
    const coodeshTests = assessments.filter((a) => a.is_visible_on_schedule === true).map((assessment) => ({
      id: assessment.assessment_id,
      name: `Teste ${assessment.name}`,
    }));

    // Preparar dados dos projetos
    const projectsData = projects.map((project) => ({
      id: project.id,
      name: project.title,
    }));

    setData({
      students: studentsData,
      coodeshTests,
      projects: projectsData,
    });
  }, [
    classroomId,
    users,
    activities,
    assessments,
    projects,
    pastInstances,
    meetings,
  ]);

  return (
    <div className="flex flex-col w-full h-full gap-4 p-4 overflow-hidden">
      <ClassroomOverviewTable data={data} />
    </div>
  );
}
