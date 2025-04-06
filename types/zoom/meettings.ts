export type ZoomMeetingType = {
  _id: string;
  id: number;
  agenda: string;
  created_at: string;
  duration: number;
  host_id: string;
  join_url: string;
  pmi: string;
  start_time: string;
  timezone: string;
  topic: string;
  type: number;
  uuid: string;
  supportGoLive: boolean;
  participants?: ZoomMeetingParticipantType[];
  poll_results?: ZoomMeetingPollResults[];
  account_id?: string;
  classroom_id?: string;
  is_visible_on_schedule?: boolean;
};

export type ZoomMeetingParticipantType = {
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
};

export type ZoomMeetingPollResults = {
  id: number;
  questions: {
    email: string;
    name: string;
    question_details: {
      answer: string;
      date_time: string;
      polling_id: string;
      question: string;
    }[];
  }[];
  start_time: string;
  uuid: string;
};
