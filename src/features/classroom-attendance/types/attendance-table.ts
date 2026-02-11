import { ZoomMeeting } from "@/features/classroom-zoom/types/meetings";
import { ZoomMeetingPastInstance } from "@/features/classroom-zoom/types/past-instances";
import { Profile } from "@/features/users/profile/types/profile";

export interface AttendanceTableProps {
    allVisibleUsers: Profile[];
    allAggregateInMetricUsers: Profile[];
    meetings: ZoomPastMeetingAndPastInstanciesAttendance[];
    classroomId: string;
}

export type ZoomPastMeetingAndPastInstanciesAttendance = ZoomPastMeetingAttendance | ZoomMeetingPastInstanceAttendance;

export type ZoomPastMeetingAttendance = ZoomMeeting & { meeting_type: "meeting" };

export type ZoomMeetingPastInstanceAttendance = ZoomMeetingPastInstance & { meeting_type: "pastInstance" };
