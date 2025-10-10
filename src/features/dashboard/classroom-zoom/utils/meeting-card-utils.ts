import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
  ZoomMeetingOccurrenceT,
  ZoomAccountT,
  ZoomMeetingActionsMeetingPickT,
  ZoomMeetingActionsAccountPickT,
} from "../types";

interface RefreshMeetingDataParams {
  meeting: ZoomMeetingT;
  accounts: ZoomAccountT[];
  refreshAndAddOnlyNewPastInstances: (
    meeting: ZoomMeetingActionsMeetingPickT,
    account: ZoomMeetingActionsAccountPickT
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
    // Cast to the required types for the store function
    const meetingPick: ZoomMeetingActionsMeetingPickT = {
      id: meeting.id,
      meeting_id: meeting.meeting_id,
      uuid: meeting.uuid,
    };
    
    const accountPick: ZoomMeetingActionsAccountPickT = {
      account_id: account.account_id,
      id: account.id,
      client_id: account.client_id,
      client_secret: account.client_secret,
      classroom_id: account.classroom_id,
    };

    await refreshAndAddOnlyNewPastInstances(meetingPick, accountPick);
  }

  setAllMeetingLoading(false);
  setLoading(false);
};
