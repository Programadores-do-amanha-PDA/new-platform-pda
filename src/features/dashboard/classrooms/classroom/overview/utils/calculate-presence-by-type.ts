import {
  calculateUserAttendance,
  calculateUserWeeklyPresence,
} from "../../attendance/utils";
import {
  ZoomMeetingPastInstance,
  ZoomMeeting,
} from "../../integrations/zoom/types";
import { ClassTypes } from "../../settings/types";
import { startOfWeek } from "date-fns";

export function calculatePresenceByType(
  zoomPastInstances: ZoomMeetingPastInstance[],
  zoomMeetings: ZoomMeeting[],
  studentEmail: string,
  classTypes?: ClassTypes[]
) {
  const presenceData = {} as Record<string, number>;

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
  const allPastEvents: Array<ZoomMeetingPastInstance | ZoomMeeting> = [
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
  }, {} as Record<string, Array<ZoomMeetingPastInstance | ZoomMeeting>>);

  // calculando presença para cada tipo
  Object.keys(eventsByType).forEach((classType) => {
    const events = eventsByType[classType];
    const totalEvents = events.length;

    if (totalEvents === 0) return;

    // Find the class type configuration to check presence_calc_type
    const currentClassType = classTypes?.find((ct) => ct.id === classType);

    let presencePercentage: number;

    if (
      currentClassType?.presence_calc_type === "byWeeklyMeetings" &&
      studentEmail
    ) {
      // For weekly calculation, calculate individual user's weekly presence
      presencePercentage = calculateIndividualWeeklyPresence(
        events,
        studentEmail,
        {
          includeJustifications: true,
        }
      );
    } else {
      // Default single meeting calculation
      const attendedEvents = events.filter((event) => {
        if (!event.participants || event.participants.length === 0) {
          return false; //nenhum participante encontrado
        }

        const attendance = calculateUserAttendance({
          meeting: event,
          userEmail: studentEmail || "",
        });
        return (
          attendance.justification?.is_presence || attendance.limit?.is_presence
        );
      }).length;

      presencePercentage = Math.round((attendedEvents / totalEvents) * 100);
    }

    if (classType) {
      presenceData[classType] = presencePercentage;
    }
  });

  // Calcular "general" como média dos outros tipos de aula
  const typeValues = Object.values(presenceData).filter(
    (value) => typeof value === "number"
  ) as number[];

  if (typeValues.length > 0) {
    presenceData["general"] = Math.round(
      typeValues.reduce((sum, value) => sum + value, 0) / typeValues.length
    );
  } else {
    presenceData["general"] = 0;
  }

  return presenceData;
}

/**
 * Calculates individual user's weekly presence percentage
 *
 * For weekly meetings, a user is considered present for a week if they
 * attended at least one meeting during that week.
 *
 * @param meetings - Array of meetings to analyze
 * @param userEmail - Email of the user to calculate presence for
 * @param options - Calculation options
 * @returns Presence percentage for the individual user
 */
function calculateIndividualWeeklyPresence(
  meetings: (ZoomMeeting | ZoomMeetingPastInstance)[],
  userEmail: string,
  options: {
    includeJustifications?: boolean;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  } = {}
): number {
  const { includeJustifications = true, weekStartsOn = 1 } = options;

  // Early return for empty inputs
  if (!meetings.length || !userEmail) {
    return 0;
  }

  // Group meetings by week
  const meetingsByWeek = new Map<
    string,
    (ZoomMeeting | ZoomMeetingPastInstance)[]
  >();

  meetings.forEach((meeting) => {
    if (!meeting.start_time) return;

    const meetingDate = new Date(meeting.start_time);
    const weekStart = startOfWeek(meetingDate, { weekStartsOn });
    const weekKey = weekStart.toISOString();

    if (!meetingsByWeek.has(weekKey)) {
      meetingsByWeek.set(weekKey, []);
    }

    meetingsByWeek.get(weekKey)!.push(meeting);
  });

  // Calculate presence for each week
  let weeksPresent = 0;
  const totalWeeks = meetingsByWeek.size;

  Array.from(meetingsByWeek.values()).forEach((weekMeetings) => {
    const wasPresent = calculateUserWeeklyPresence(
      userEmail,
      weekMeetings,
      includeJustifications
    );

    if (wasPresent) {
      weeksPresent++;
    }
  });

  // Calculate percentage
  if (totalWeeks === 0) return 0;

  return Math.round((weeksPresent / totalWeeks) * 100);
}
