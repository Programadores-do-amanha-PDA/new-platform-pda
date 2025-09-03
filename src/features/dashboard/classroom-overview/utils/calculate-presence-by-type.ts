import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "@/types";
import { calculateUserAttendance } from "@/utils/attendance-calculator";

export function calculatePresenceByType(
  zoomPastInstances: ZoomMeetingPastInstanceT[],
  zoomMeetings: ZoomMeetingT[],
  studentEmail: string
) {
  const presenceData = {
    general: 0,
    programming: 0,
    english: 0,
    softSkills: 0,
    community: 0,
    employability: 0,
  };

  // Filtrar meetings que já passaram e não são recorrentes
  const pastMeetings = zoomMeetings.filter((meeting) => {
    if (!meeting.start_time) return false;

    const meetingStartTime = new Date(meeting.start_time);
    const now = new Date();

    // Verificar se o meeting já passou e não é recorrente (type 1 = instant, 2 = scheduled, 3 = recurring with no fixed time, 8 = recurring with fixed time)
    const isPast = meetingStartTime < now;
    const isNotRecurring = meeting.type === 1 || meeting.type === 2;

    return isPast && isNotRecurring;
  });

  // Combinar past instances com meetings que já passaram
  const allPastEvents: Array<ZoomMeetingPastInstanceT | ZoomMeetingT> = [
    ...zoomPastInstances,
    ...pastMeetings,
  ];

  // agrupando eventos por tipo de aula
  const eventsByType = allPastEvents.reduce((acc, event) => {
    const classType = event.class_type || "";
    if (!acc[classType]) {
      acc[classType] = [];
    }
    acc[classType].push(event);
    return acc;
  }, {} as Record<string, Array<ZoomMeetingPastInstanceT | ZoomMeetingT>>);

  // calculando presença para cada tipo
  Object.keys(eventsByType).forEach((classType) => {
    const events = eventsByType[classType];
    const totalEvents = events.length;

    if (totalEvents === 0) return;

    const attendedEvents = events.filter((event) => {
      if (!event.participants || event.participants.length === 0) {
        return false; //nenhum participante encontrado
      }

      const attendance = calculateUserAttendance(event, studentEmail || "");
      return attendance.status === "P" || attendance.status === "FJ";
    }).length;

    const presencePercentage = Math.round((attendedEvents / totalEvents) * 100);

    switch (classType) {
      case "programming":
        presenceData.programming = presencePercentage;
        break;
      case "english":
        presenceData.english = presencePercentage;
        break;
      case "soft-skills":
        presenceData.softSkills = presencePercentage;
        break;
      case "community":
        presenceData.community = presencePercentage;
        break;
      case "employability":
        presenceData.employability = presencePercentage;
        break;
    }
  });

  // Calcular "general" como média dos outros tipos de aula
  const typeValues = [
    presenceData.programming,
    presenceData.english,
    presenceData.softSkills,
    presenceData.community,
    presenceData.employability,
  ].filter((value) => value > 0); // Apenas tipos que têm dados

  if (typeValues.length > 0) {
    presenceData.general = Math.round(
      typeValues.reduce((sum, value) => sum + value, 0) / typeValues.length
    );
  }

  return presenceData;
}
