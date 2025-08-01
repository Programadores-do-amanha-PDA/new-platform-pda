import { ZoomMeetingParticipantT, ZoomMeetingPollResultsT, ZoomClassT, ZoomMeetingJustificationT } from "./meetings";

export interface ZoomMeetingPastInstanceT {
  id: string;
  classroom_id: string; 
  account_id: string;
  meeting_id: string;
  uuid: string; 
  start_time?: string; 
  class_type: ZoomClassT; 
  participants?: ZoomMeetingParticipantT[]; 
  poll_results?: ZoomMeetingPollResultsT[];
  synchronized_at?: string; 
  created_at: string; 
  is_visible_on_schedule?: boolean; 
  justifications?: ZoomMeetingJustificationT[];
}