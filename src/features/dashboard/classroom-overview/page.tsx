"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ClassroomOverviewTable } from "./components/classroom-overview-table";
import {
  ClassroomOverviewData,
  StudentOverview,
} from "@/types/classroom-overview";
import { useUsersStore } from "@/stores/modules/users/users-store";
import { useUserClassroomsStore } from "@/stores/modules/users/user-classrooms-store";
import { useClassroomConfigStore } from "@/features/dashboard/classroom-configs/stores";
import { useCoodeshAssessmentStore } from "../classroom-coodesh/stores/assessments";
import {
  calculatePresenceByType,
  calculateCoodeshScores,
  calculateProjectNotes,
  calculateGeneralPresence,
} from "./utils";
import { useProjectStore } from "../classroom-projects/stores";
import { useDeliveryStore } from "../classroom-projects/stores/deliveries";
import { useCorrectionStore } from "../classroom-projects/stores/corrections";
import { filterVisibilityClassroomStudents } from "../utils/filter-visibility-classroom-students";
import { filterDataByDateRange } from "../utils/filter-data-by-date-range";
import {
  useZoomMeetingStore,
  useZoomMeetingPastInstanceStore,
} from "../classroom-zoom/stores";
import { useClassroomActivityStore } from "../classroom-activities/store";

export default function ClassroomAttendancePage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [data, setData] = useState<ClassroomOverviewData>({
    students: [],
    classTypes: [],
    coodeshTests: [],
    projects: [],
    userModes: [],
  });
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );

  const { configsByClassroom } = useClassroomConfigStore();
  const { users } = useUsersStore();
  const { updateUserMode } = useUserClassroomsStore();
  const { activities } = useClassroomActivityStore();
  const { assessments } = useCoodeshAssessmentStore();
  const { projects } = useProjectStore();
  const { deliveries } = useDeliveryStore();
  const { corrections } = useCorrectionStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();
  const { meetings } = useZoomMeetingStore();

  const currentConfig = configsByClassroom[classroom_id];
  const currentConfigUserModes = useMemo(
    () => currentConfig?.user_modes || [],
    [currentConfig]
  );
  const modules = useMemo(
    () => currentConfig?.modules || [],
    [currentConfig?.modules]
  );
  const classroomDeliveries = useMemo(
    () => deliveries[classroom_id] || [],
    [deliveries, classroom_id]
  );
  const classroomCorrections = useMemo(
    () => corrections[classroom_id] || [],
    [corrections, classroom_id]
  );

  useEffect(() => {
    // filter users by classroom id & by must be present on user mode
    const classroomStudents = filterVisibilityClassroomStudents(
      users,
      classroom_id,
      currentConfigUserModes,
      "overview"
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

    // Filtrar projetos por classroom_id primeiro, depois por data se necessário
    const classroomProjects = projects.filter(
      (project) => project.classroom_id === classroom_id
    );
    const filteredProjects = dateRange
      ? filterDataByDateRange(classroomProjects, "created_at", dateRange)
      : classroomProjects;

    // Criar dados dos estudantes com indicadores
    const studentsData: StudentOverview[] = classroomStudents.map(
      (user, index) => {
        const studentEmail = user.email || "";

        // Calcular presenças por tipo usando dados filtrados
        const attendancesIndicators = calculatePresenceByType(
          filteredPastInstances,
          filteredMeetings,
          studentEmail,
          currentConfig?.class_types,
        );

        // Calcular scores dos testes Coodesh com dados filtrados
        const coodeshIndicators = calculateCoodeshScores(
          studentEmail,
          filteredAssessments
        );

        // Calcular notas dos projetos com dados filtrados
        // Usar ID do usuário como identificador principal
        const studentId = user.id || "";
        const projectIndicators = calculateProjectNotes(
          studentId,
          filteredProjects,
          classroomDeliveries,
          classroomCorrections
        );

        // Calcular presença geral das atividades com dados filtrados
        const activitiesIndicators = calculateGeneralPresence(
          studentEmail,
          filteredActivities
        );

        // Obter o modo do usuário atual da relação user_classroom
        const userClassroom = user.profile?.classrooms?.find(
          (uc) => uc.classroom_id === classroom_id
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
          userModeId: userClassroom?.mode || "",
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
    // Preparar dados dos modos de usuário
    const userModes = (currentConfig?.user_modes || []).map((userMode) => ({
      ...userMode,
      featuresRules: userMode?.featuresRules?.map((rule) => ({
        ...rule,
        isVisible: rule.isVisible ?? true,
        aggregateInMetric: rule.aggregateInMetric ?? true,
      })),
    }));

    setData({
      students: studentsData,
      classTypes,
      coodeshTests,
      projects: projectsData,
      userModes,
    });
  }, [
    classroom_id,
    currentConfig,
    users,
    dateRange,
    meetings,
    pastInstances,
    activities,
    assessments,
    projects,
    classroomDeliveries,
    classroomCorrections,
    currentConfigUserModes,
  ]);

  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
  };

  const handleUserModeChange = async (
    studentId: string,
    userModeId: string
  ) => {
    // Atualizar no banco de dados
    const success = await updateUserMode(studentId, classroom_id, userModeId);

    if (success) {
      // Atualizar o estado local apenas se a atualização no banco foi bem-sucedida
      setData((prevData) => ({
        ...prevData,
        students: prevData.students.map((student) =>
          student.id === studentId ? { ...student, userModeId } : student
        ),
      }));
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-4 p-4 overflow-hidden">
      <ClassroomOverviewTable
        data={data}
        modules={modules}
        onDateRangeChange={handleDateRangeChange}
        onUserModeChange={handleUserModeChange}
      />
    </div>
  );
}
