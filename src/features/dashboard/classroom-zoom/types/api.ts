import { ZoomMeetingT } from "./";

export interface ZoomAPIState {
  meetingsByAPI: ZoomMeetingT[];
  loading: boolean;
}