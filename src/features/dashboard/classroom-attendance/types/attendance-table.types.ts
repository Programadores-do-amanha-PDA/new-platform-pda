import { AuthUserWithProfileT } from "@/types";
import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "../../classroom-zoom/types";

export interface AttendanceTableProps {
    allVisibleUsers: Partial<AuthUserWithProfileT>[];
    allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
    meetings: AttendanceAllPastMeetingT[];
    classroomId: string;
}

export type AttendanceAllPastMeetingT = MeetingAttendanceT | PastInstancieAttendanceT;

export type MeetingAttendanceT = ZoomMeetingT & { meeting_type: "meeting" | "pastInstance" };

export type PastInstancieAttendanceT = ZoomMeetingPastInstanceT & { meeting_type: "meeting" | "pastInstance" };
