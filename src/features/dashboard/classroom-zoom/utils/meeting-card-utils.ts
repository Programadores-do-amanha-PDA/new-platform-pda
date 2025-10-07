import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
  ZoomMeetingOccurrenceT,
  ZoomAccountT,
} from "../types";

interface RefreshMeetingDataParams {
  meeting: ZoomMeetingT;
  accounts: ZoomAccountT[];
  refreshAndAddOnlyNewPastInstances: (
    meeting: Partial<ZoomMeetingT>,
    account: Partial<ZoomAccountT>
  ) => Promise<boolean>;
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

/**
 * Handles meeting refresh logic - only adds new past instances without affecting existing ones
 */
export const refreshMeetingData = async ({
  meeting,
  accounts,
  refreshAndAddOnlyNewPastInstances,
  setLoading,
  setAllMeetingLoading,
}: RefreshMeetingDataParams): Promise<void> => {
  setAllMeetingLoading(true);
  setLoading(true);

  const account = accounts.find((account) => account.id === meeting.account_id);

  if (account) {
    await refreshAndAddOnlyNewPastInstances(meeting, account);
  }

  setAllMeetingLoading(false);
  setLoading(false);
};
