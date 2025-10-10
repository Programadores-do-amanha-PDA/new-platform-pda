import {
  ZoomAccountMeT,
  ZoomAccountT,
  ZoomMeetingActionsAccountPickT,
  ZoomMeetingParticipantT,
  ZoomMeetingPastInstanceT,
  ZoomMeetingPollResultsT,
  ZoomMeetingT,
  ZoomMeetingWithPastInstancies,
} from "./";

export interface ZoomAPIStateT {
  meetingsByAPI: ZoomMeetingT[];
  loading: boolean;
}

export interface ZoomAPIActionsT {
  setMeetingsByAPI: (meetings: ZoomMeetingT[]) => void;
  getZoomMeAccountDataByAPI: (
    account: ZoomMeetingActionsAccountPickT,
    forceRefresh?: boolean
  ) => Promise<false | Partial<ZoomAccountMeT>>;
  getAllMeetingsByAPI: (account: ZoomMeetingActionsAccountPickT) => Promise<boolean>;
  getMeetingByAPI: (
    account: ZoomMeetingActionsAccountPickT,
    meeting: Partial<ZoomMeetingT>
  ) => Promise<
    | ZoomMeetingT
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
  ) => Promise<ZoomMeetingPastInstanceT[]>;
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
