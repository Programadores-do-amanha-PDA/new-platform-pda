import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "@/types";

export function calculatePresenceByType(
  studentId: string,
  zoomPastInstances: ZoomMeetingPastInstanceT[],
  zoomMeetings: ZoomMeetingT[],
  studentEmail: string
) {
  const presenceData = {
    general: 0,
    programming: 0,
    english: 0,
    softSkills: 0,
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
  const allPastEvents: Array<{
    class_type: string;
    participants?: Array<{ user_email: string; user_id: string }>;
  }> = [
    ...zoomPastInstances,
    ...pastMeetings.map((meeting) => ({
      class_type: meeting.class_type || "general",
      participants: meeting.participants?.map((p) => ({
        user_email: p.user_email,
        user_id: p.user_id,
      })),
    })),
  ];

  // agrupando eventos por tipo de aula
  const eventsByType = allPastEvents.reduce((acc, event) => {
    const classType = event.class_type || "general";
    if (!acc[classType]) {
      acc[classType] = [];
    }
    acc[classType].push(event);
    return acc;
  }, {} as Record<string, Array<{ class_type: string; participants?: Array<{ user_email: string; user_id: string }> }>>);

  // calculando presença para cada tipo
  Object.keys(eventsByType).forEach((classType) => {
    const events = eventsByType[classType];
    const totalEvents = events.length;

    if (totalEvents === 0) return;

    const attendedEvents = events.filter((event) => {
      if (!event.participants || event.participants.length === 0) {
        return false; //nenhum participante encontrado
      }

      const hasParticipant = event.participants.some((participant) => {
        const emailMatch = participant.user_email === studentEmail;
        const userIdMatch = participant.user_id === studentId;

        return emailMatch || userIdMatch;
      });

      return hasParticipant;
    }).length;

    const presencePercentage = Math.round((attendedEvents / totalEvents) * 100);

    //TODO: melhorar caso haja outros tipos
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
      case "general":
        presenceData.general = presencePercentage;
        break;
      default:
        presenceData.general = presencePercentage;
    }
  });

  // fazendo o cálculo com base em TODOS os eventos (independente do tipo)
  if (allPastEvents.length > 0) {
    const totalAttendedAcrossAllTypes = allPastEvents.filter((event) => {
      return event.participants?.some((participant) => {
        const emailMatch = participant.user_email === studentEmail;
        const userIdMatch = participant.user_id === studentId;
        return emailMatch || userIdMatch;
      });
    }).length;

    const generalPresenceFromAll = Math.round(
      (totalAttendedAcrossAllTypes / allPastEvents.length) * 100
    );

    // se não houver presença geral específica, usar o cálculo baseado em todos os eventos
    if (presenceData.general === 0) {
      presenceData.general = generalPresenceFromAll;
    }

    console.log(`presença-final calculada:`, presenceData);
    return presenceData;
  }

  return presenceData;
}
