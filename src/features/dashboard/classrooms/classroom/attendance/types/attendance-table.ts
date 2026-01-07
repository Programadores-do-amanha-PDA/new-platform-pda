import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { ZoomMeetingPastInstance, ZoomMeeting } from "../../integrations/zoom/types";

export interface AttendanceTableProps {
    allVisibleUsers: Partial<AuthUserWithProfile>[];
    allAggregateInMetricUsers: Partial<AuthUserWithProfile>[];
    meetings: ZoomPastMeetingAndPastInstanciesAttendance[];
    classroomId: string;
}

export type ZoomPastMeetingAndPastInstanciesAttendance = ZoomPastMeetingAttendance | ZoomMeetingPastInstanceAttendance;

export type ZoomPastMeetingAttendance = ZoomMeeting & { meeting_type: "meeting" };

export type ZoomMeetingPastInstanceAttendance = ZoomMeetingPastInstance & { meeting_type: "pastInstance" };
