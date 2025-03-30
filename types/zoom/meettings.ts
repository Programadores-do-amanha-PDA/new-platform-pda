export type ZoomMeetingT = {
  agenda: string;
  created_at: string;
  duration: number;
  host_id: string;
  id: number;
  join_url: string;
  pmi: string;
  start_time: string;
  timezone: string;
  topic: string;
  type: number;
  uuid: string;
  participants?: ZoomMeetingParticipantT[];
};

export type ZoomMeetingParticipantT = {
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
