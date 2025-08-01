import {
  ClassroomActivityT,
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "@/types";

export function calculateGeneralPresence(
  studentEmail: string,
  activities: ClassroomActivityT[]
): number {
  if (activities.length === 0) return 0;

  const attendedActivities = activities.filter((activity) => {
    return activity.participants_email?.includes(studentEmail) || false;
  }).length;

  return Math.round((attendedActivities / activities.length) * 100);
}

export function calculateGeneralPresenceFromZoom(
  studentId: string,
  studentEmail: string,
  zoomPastInstances: ZoomMeetingPastInstanceT[],
  zoomMeetings: ZoomMeetingT[]
): number {
  // Filtrar meetings que já passaram e não são recorrentes
  const pastMeetings = zoomMeetings.filter((meeting) => {
    if (!meeting.start_time) return false;

    const meetingStartTime = new Date(meeting.start_time);
    const now = new Date();

    const isPast = meetingStartTime < now;
    const isNotRecurring = meeting.type === 1 || meeting.type === 2;

    return isPast && isNotRecurring;
  });

  // Combinar past instances com meetings que já passaram
  const allPastEvents = [
    ...zoomPastInstances,
    ...pastMeetings.map((meeting) => ({
      participants: meeting.participants?.map((p) => ({
        user_email: p.user_email,
        user_id: p.user_id,
      })),
    })),
  ];

  if (allPastEvents.length === 0) return 0;

  const attendedEvents = allPastEvents.filter((event) => {
    return event.participants?.some((participant) => {
      const emailMatch = participant.user_email === studentEmail;
      const userIdMatch = participant.user_id === studentId;
      return emailMatch || userIdMatch;
    });
  }).length;

  return Math.round((attendedEvents / allPastEvents.length) * 100);
}
