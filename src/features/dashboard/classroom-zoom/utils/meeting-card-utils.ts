import { ZoomMeetingT, ZoomMeetingOccurrenceT } from "@/types/classroom-zoom/meetings";
import { ZoomMeetingPastInstanceT } from "@/types/classroom-zoom/past-instances";
import { ZoomAccountT } from "@/types/classroom-zoom/accounts";

interface RefreshMeetingDataParams {
  meeting: ZoomMeetingT;
  accounts: ZoomAccountT[];
  refreshAndUpdateMeeting: (meeting: Partial<ZoomMeetingT>, account: Partial<ZoomAccountT>) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setAllMeetingLoading: (loading: boolean) => void;
}

/**
 * Filters past instances for a specific meeting
 */
export const getMeetingPastInstances = (
  pastInstances: ZoomMeetingPastInstanceT[],
  meetingId: string
): ZoomMeetingPastInstanceT[] => {
  return pastInstances.filter(
    (instance) => instance.meeting_id === meetingId
  );
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

/**
 * Handles meeting refresh logic
 */
export const refreshMeetingData = async ({
  meeting,
  accounts,
  refreshAndUpdateMeeting,
  setLoading,
  setAllMeetingLoading,
}: RefreshMeetingDataParams): Promise<void> => {
  setAllMeetingLoading(true);
  setLoading(true);

  const account = accounts.find(
    (account) => account.id === meeting.account_id
  );
  
  if (account) {
    await refreshAndUpdateMeeting(meeting, account);
  }

  setAllMeetingLoading(false);
  setLoading(false);
};