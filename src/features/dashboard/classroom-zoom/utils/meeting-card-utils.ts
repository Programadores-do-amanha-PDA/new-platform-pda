import { ZoomMeetingPastInstanceT, ZoomMeetingOccurrenceT } from "../types";

/**
 * Filters past instances for a specific meeting
 */
export const getMeetingPastInstances = (
  pastInstances: ZoomMeetingPastInstanceT[],
  meetingId: string
): ZoomMeetingPastInstanceT[] => {
  return pastInstances.filter((instance) => instance.meeting_id === meetingId);
};

/**
 * Filters upcoming occurrences from meeting occurrences
 */
export const getUpcomingOccurrences = (
  occurrences?: ZoomMeetingOccurrenceT[]
): ZoomMeetingOccurrenceT[] | undefined => {
  return occurrences?.filter(
    (occurrence) => new Date(occurrence.start_time).getTime() >= Date.now()
  );
};
