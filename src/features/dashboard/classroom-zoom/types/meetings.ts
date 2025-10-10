import { ZoomAccountT, ZoomMeetingPastInstanceT } from "./";

export interface ZoomMeetingT {
  id: string;
  meeting_id: number;
  agenda?: string;
  created_at: string;
  duration: number;
  host_id: string;
  join_url: string;
  pmi: string;
  start_time?: string;
  timezone?: string;
  topic: string;
  type: ZoomMeetingTypeT;
  uuid: string;
  supportGoLive: boolean;
  assistant_id: string;
  host_email: string;
  encrypted_password?: string;
  pstn_password?: string;
  h323_password?: string;
  chat_join_url: string;
  occurrences?: ZoomMeetingOccurrenceT[];
  password?: string;
  pre_schedule: boolean;
  recurrence?: ZoomMeetingRecurrenceT;
  settings: ZoomMeetingSettingsT;
  start_url: string;
  status: string;
  tracking_fields?: ZoomMeetingTrackingFieldT[];
  dynamic_host_key: string;
  creation_source: string;
  registration_url: string;
  participants?: ZoomMeetingParticipantT[];
  justifications?: ZoomMeetingJustificationT[];
  polls?: ZoomMeetingPollT[];
  poll_results?: ZoomMeetingPollResultsT[];
  account_id: string;
  classroom_id: string;
  is_visible_on_schedule?: boolean;
  synchronized_at?: string;
  class_type?: ZoomClassT;
}

export type ZoomMeetingTypeT = 1 | 2 | 3 | 4 | 8 | 10;

export interface ZoomMeetingOccurrenceT {
  occurrence_id: string;
  start_time: string;
  duration: number;
  status?: string;
  is_visible_on_schedule: boolean | undefined;
}

export interface ZoomMeetingRecurrenceT {
  type: 1 | 2 | 3;
  repeat_interval: number;
  end_date_time?: string;
  end_times?: number;
  weekly_days?: string;
  monthly_day?: number;
  monthly_week?: number;
  monthly_week_day?: number;
}
export interface ZoomMeetingSettingsT {
  host_video?: boolean;
  participant_video?: boolean;
  cn_meeting?: boolean;
  in_meeting?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  watermark?: boolean;
  use_pmi?: boolean;
  approval_type?: 0 | 1 | 2;
  registration_type?: 1 | 2 | 3;
  audio?: "both" | "telephony" | "voip";
  auto_recording?: "local" | "cloud" | "none";
  alternative_hosts?: string;
  close_registration?: boolean;
  waiting_room?: boolean;
  global_dial_in_countries?: string[];
  contact_name?: string;
  contact_email?: string;
  registrants_confirmation_email?: boolean;
  meeting_authentication?: boolean;
  registrants_email_notification?: boolean;
  polling?: boolean;
}

export interface ZoomMeetingJustificationT {
  id?: string;
  user_email: string;
  message: string;
}

export type ZoomClassT =
  | "programming"
  | "english"
  | "soft-skills"
  | "community"
  | "employability";

export interface ZoomMeetingTrackingFieldT {
  field: string;
  value: string;
}

export interface ZoomMeetingParticipantT {
  id: string;
  name: string;
  user_id: string;
  registrant_id: string;
  user_email: string;
  join_time: string;
  leave_time: string;
  duration: number;
  failover: boolean;
  status: string;
  internal_user: boolean;
}

export interface ZoomMeetingPollResultsT {
  email: string;
  name: string;
  question_details: {
    answer: string;
    date_time: string;
    polling_id: string;
    question: string;
  }[];
}

export interface ZoomMeetingPollT {
  id: string;
  status: "notstart" | "started" | "ended" | "sharing" | "deactivated";
  anonymous?: boolean;
  poll_type?: 1 | 2 | 3;
  questions?: ZoomMeetingPollQuestionT[];
  title?: string;
}

export interface ZoomMeetingPollQuestionT {
  answer_max_character?: number;
  answer_min_character?: number;
  answer_required?: boolean;
  answers?: string[];
  case_sensitive?: boolean;
  name?: string;
  prompts?: ZoomMeetingPollQuestionPromptT[];
  rating_max_label?: string;
  rating_max_value?: number;
  rating_min_label?: string;
  rating_min_value?: number;
  right_answers?: string[];
  show_as_dropdown?: boolean;
  type?:
    | "single"
    | "multiple"
    | "matching"
    | "rank_order"
    | "short_answer"
    | "long_answer"
    | "fill_in_the_blank"
    | "rating_scale";
}

export interface ZoomMeetingPollQuestionPromptT {
  prompt_question: string;
  prompt_right_answers: string[];
}

export type ZoomMeetingWithPastInstancies = ZoomMeetingT & {
  past_instances: ZoomMeetingPastInstanceT[];
};

export interface ZoomMeetingState {
  meetings: ZoomMeetingT[];
  loading: boolean;
}

export type ZoomMeetingActionsAccountPickT = Pick<
  ZoomAccountT,
  "account_id" | "id" | "client_id" | "client_secret" | "classroom_id"
>;

export type ZoomMeetingActionsMeetingPickT = Pick<
  ZoomMeetingT,
  "id" | "meeting_id" | "uuid"
>;

export type EnrichedInstance = ZoomMeetingOccurrenceT & {
  participants: ZoomMeetingParticipantT[];
  poll_results: ZoomMeetingPollResultsT[];
};
export interface ZoomMeetingActions {
  setMeetings: (meetings: ZoomMeetingT[]) => void;
  getAllMeetings: (classroomId: string) => Promise<boolean>;
  getMeetingById: (meetingId: string) => Promise<ZoomMeetingT | boolean>;
  createMeeting: (
    account: ZoomMeetingActionsAccountPickT,
    meetingData: Partial<ZoomMeetingT>
  ) => Promise<string | false>;
  updateMeeting: (
    meetingId: string,
    updates: Partial<ZoomMeetingT>
  ) => Promise<boolean>;
  refreshAllMeetingOccurrenceByMeetingId: (
    account: ZoomMeetingActionsAccountPickT,
    meeting: ZoomMeetingActionsMeetingPickT,
    currentOccurrencesUpdated?: ZoomMeetingOccurrenceT[]
  ) => Promise<boolean>;
  refreshAndUpdateMeeting: (
    meeting: Partial<ZoomMeetingT>,
    account: ZoomMeetingActionsAccountPickT
  ) => Promise<boolean>;
  handleRecurrentMeetingUpdate: (
    meeting: ZoomMeetingActionsMeetingPickT,
    account: ZoomMeetingActionsAccountPickT,
    updatedMeetingData: Omit<
      ZoomMeetingWithPastInstancies,
      "id" | "created_at"
    >,
    instanciesUpdateMode?: "new" | "existing" | "all"
  ) => Promise<boolean>;
  handleNonRecurrentMeetingUpdate: (
    meeting: ZoomMeetingActionsMeetingPickT,
    account: ZoomMeetingActionsAccountPickT,
    updatedMeetingData: Partial<ZoomMeetingT>
  ) => Promise<void>;
  processNewPastInstances: (
    meeting: ZoomMeetingActionsMeetingPickT,
    account: ZoomMeetingActionsAccountPickT,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[]
  ) => Promise<void>;
  updateExistingPastInstances: (
    meetingId: string,
    account: ZoomMeetingActionsAccountPickT,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[]
  ) => Promise<void>;
  fetchPastInstancesData: (
    account: ZoomMeetingActionsAccountPickT,
    pastInstances: Partial<ZoomMeetingPastInstanceT>[]
  ) => Promise<ZoomMeetingPastInstanceT[] | null>;
  refreshAllPastInstancesForMeeting: (
    meeting: ZoomMeetingActionsMeetingPickT,
    account: ZoomMeetingActionsAccountPickT
  ) => Promise<boolean>;
  refreshAndAddOnlyNewPastInstances: (
    meeting: ZoomMeetingActionsMeetingPickT,
    account: ZoomMeetingActionsAccountPickT
  ) => Promise<boolean>;
  deleteMeeting: (meetingId: string) => Promise<boolean>;
  reset: () => void;
}
