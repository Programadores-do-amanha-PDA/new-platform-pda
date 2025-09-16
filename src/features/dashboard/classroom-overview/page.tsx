"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ClassroomOverviewTable } from "./components/classroom-overview-table";
import {
  ClassroomOverviewData,
  StudentOverview,
} from "@/types/classroom-overview";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { useClassroomActivityStore } from "@/stores/modules/classrooms/activities";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useDeliveryStore } from "@/stores/modules/classrooms/projects/deliveries";
import { useCorrectionStore } from "@/stores/modules/classrooms/projects/corrections";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";
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
    classTypes: [],
    coodeshTests: [],
    projects: [],
  });

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );

  const { configsByClassroom } = useClassroomConfigStore();
  const { users } = useUsersStore();
  const { activities } = useClassroomActivityStore();
  const { assessments } = useCoodeshAssessmentStore();
  const { projects } = useProjectStore();
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();
  const { meetings } = useZoomMeetingStore();

  const currentConfig = configsByClassroom[classroomId];
  const modules = useMemo(
    () => currentConfig?.modules || [],
    [currentConfig?.modules]
  );

  // Função para filtrar dados por intervalo de datas
  const filterDataByDateRange = <T,>(
    data: T[],
    dateField: keyof T,
    dateRange: { from: Date; to: Date } | null
  ): T[] => {
    if (!dateRange) return data;

    return data.filter((item) => {
      const itemDate = item[dateField];
      if (!itemDate) return false;

      const date = new Date(itemDate as string);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return false;

      return date >= dateRange.from && date <= dateRange.to;
    });
  };

  useEffect(() => {
    // Filtrar estudantes que pertencem à turma atual
    const classroomStudents = users.filter((user) =>
      user.profile?.classrooms?.some(
        (classroom) => classroom.classroom_id === classroomId
      )
    );

    // Filtrar dados por intervalo de datas se selecionado
    const filteredPastInstances = dateRange
      ? filterDataByDateRange(
          pastInstances.filter((p) => p.is_visible_on_schedule === true),
          "start_time",
          dateRange
        )
      : pastInstances.filter((p) => p.is_visible_on_schedule === true);

    const filteredMeetings = dateRange
      ? filterDataByDateRange(
          meetings.filter((m) => m.is_visible_on_schedule === true),
          "start_time",
          dateRange
        )
      : meetings.filter((m) => m.is_visible_on_schedule === true);

    const filteredActivities = dateRange
      ? filterDataByDateRange(
          activities.filter((a) => a.is_visible_on_schedule),
          "created_at",
          dateRange
        )
      : activities.filter((a) => a.is_visible_on_schedule);

    const filteredAssessments = dateRange
      ? filterDataByDateRange(
          assessments.filter((a) => a.is_visible_on_schedule === true),
          "created_at",
          dateRange
        )
      : assessments.filter((a) => a.is_visible_on_schedule === true);

    const filteredProjects = dateRange
      ? filterDataByDateRange(projects, "created_at", dateRange)
      : projects;

    // Criar dados dos estudantes com indicadores
    const studentsData: StudentOverview[] = classroomStudents.map(
      (user, index) => {
        const studentEmail = user.email || "";

        // Calcular presenças por tipo usando dados filtrados
        const attendancesIndicators = calculatePresenceByType(
          filteredPastInstances,
          filteredMeetings,
          studentEmail
        );

        // Calcular scores dos testes Coodesh com dados filtrados
        const coodeshIndicators = calculateCoodeshScores(
          studentEmail,
          filteredAssessments
        );

        // Calcular notas dos projetos com dados filtrados
        const projectIndicators = calculateProjectNotes(
          studentEmail,
          filteredProjects,
          deliveries,
          corrections
        );

        // Calcular presença geral das atividades com dados filtrados
        const activitiesIndicators = calculateGeneralPresence(
          studentEmail,
          filteredActivities
        );

        return {
          id: user.id || "",
          name: user.profile?.full_name || "",
          email: studentEmail,
          number: index + 1,
          attendances: attendancesIndicators,
          activities: activitiesIndicators,
          coodesh: coodeshIndicators,
          projects: projectIndicators,
        };
      }
    );

    // Preparar dados dos tipos de atividade
    const classTypes = Array.from(
      new Set([
        ...filteredMeetings.map((m) => m.class_type),
        ...filteredPastInstances.map((p) => p.class_type),
      ])
    )
      .map((classType) => {
        const currentClassType = currentConfig?.class_types?.find(
          (ct) => ct.id === classType
        );
        if (currentClassType) {
          return {
            id: currentClassType.id,
            name: currentClassType.title,
          };
        } else return null;
      })
      .filter(Boolean) as { id: string; name: string }[];

    if (classTypes.length > 0) {
      classTypes.unshift({
        id: "general",
        name: "Geral",
      });
    }

    // Preparar dados dos testes Coodesh filtrados
    const coodeshTests = filteredAssessments.map((assessment) => ({
      id: assessment.assessment_id,
      name: `Teste ${assessment.name}`,
    }));

    // Preparar dados dos projetos filtrados
    const projectsData = filteredProjects.map((project) => ({
      id: project.id,
      name: project.title,
    }));

    setData({
      students: studentsData,
      classTypes,
      coodeshTests,
      projects: projectsData,
    });
  }, [
    classroomId,
    currentConfig,
    users,
    dateRange,
    meetings,
    pastInstances,
    activities,
    assessments,
    projects,
    deliveries,
    corrections,
  ]);

  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
  };

  return (
    <div className="flex flex-col w-full h-full gap-4 p-4 overflow-hidden">
      <ClassroomOverviewTable
        data={data}
        modules={modules}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
}
