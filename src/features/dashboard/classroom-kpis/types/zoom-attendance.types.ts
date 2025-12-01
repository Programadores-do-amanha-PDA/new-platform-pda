import { AuthUserWithProfileT } from "@/types";
import { AttendanceAllPastMeetingT, MeetingAttendanceT } from "../../classroom-attendance/types";
import { ClassroomConfigClassTypesT } from "../../classroom-configs/types";

export type AttendanceAccumulatorT = {
    totalPresencePercentage: number;
    count: number;
};

export interface GetMeetingsByTypeColumnsP {
    meetingsByType: Record<string, MeetingAttendanceT[]>;
    allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
    classroomClassTypes: ClassroomConfigClassTypesT[];
}

export type meetingsByClassTypeT = Record<string, AttendanceAllPastMeetingT>;

export interface GetAttendanceAccumulatorProps {
    meetings: AttendanceAllPastMeetingT[];
    allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
    classroomClassTypes: ClassroomConfigClassTypesT[];
}

export interface GetAllWeeklyMeetingsGroupedByMonthProps {
    allMeetings: AttendanceAllPastMeetingT[];
}
