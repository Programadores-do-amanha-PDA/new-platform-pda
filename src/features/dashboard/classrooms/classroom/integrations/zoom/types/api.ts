import {
  ZoomAccountMeT,
  ZoomAccountT,
  ZoomMeetingActionsAccountPickT,
  ZoomMeetingParticipantT,
  ZoomMeetingPastInstance,
  ZoomMeetingPollResultsT,
  ZoomMeeting,
  ZoomMeetingWithPastInstancies,
} from ".";

export interface ZoomAPIStateT {
  meetingsByAPI: ZoomMeeting[];
  loading: boolean;
}

export interface ZoomAPIActionsT {
  setMeetingsByAPI: (meetings: ZoomMeeting[]) => void;
  getZoomMeAccountDataByAPI: (
    account: ZoomMeetingActionsAccountPickT,
    forceRefresh?: boolean
  ) => Promise<false | Partial<ZoomAccountMeT>>;
  getAllMeetingsByAPI: (account: ZoomMeetingActionsAccountPickT) => Promise<boolean>;
  getMeetingByAPI: (
    account: ZoomMeetingActionsAccountPickT,
    meeting: Partial<ZoomMeeting>
  ) => Promise<
    | ZoomMeeting
    | Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">
    | null
  >;
  getAllParticipantsByMeetingIdFromAPI: (
    account: ZoomMeetingActionsAccountPickT,
    meetingId: number | string
  ) => Promise<ZoomMeetingParticipantT[]>;
  getAllPollResultsByMeetingIdFromAPI: (
    account: ZoomMeetingActionsAccountPickT,
    meetingId: number | string
  ) => Promise<ZoomMeetingPollResultsT[]>;
  getAllPastInstanciesByMeetingIdFromAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number
  ) => Promise<ZoomMeetingPastInstance[]>;
  reset: () => void;
}

export type TokenData = {
  access_token: string;
  expires_at: number;
  expires_in: number;
  account_id: string;
  client_id: string;
};

export type ClientTokenCache = {
  [client_id: string]: TokenData[];
};
