import { AuthUserWithProfileT } from "@/types";
import { MeetingAttendanceT } from "../../classroom-attendance/types";
import { ClassroomConfigClassTypesT } from "../../classroom-configs/types";

export type AttendanceAccumulatorT = {
    totalPresencePercentage: number;
    count: number;
};

export interface GetMeetingsByTypeColumnsP {
    meetingsByType: Record<string, MeetingAttendanceT[]>;
}

export type meetingsByClassTypeT = Record<string, MeetingAttendanceT>;

export interface GetAttendanceAccumulatorProps {
    meetings: MeetingAttendanceT[];
    allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
    classroomClassTypes: ClassroomConfigClassTypesT[];
}

export interface GetAttendanceByWeeklyMeetingsGroupedByMonthProps {
    allMeetings: MeetingAttendanceT[];
    allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
    classroomClassTypes: ClassroomConfigClassTypesT[];
}

export interface GetAttendanceByWeeklyMeetingsGroupedByMonthResults {
    month: { date: Date; attendance: AttendanceAccumulatorT | null };
    weeks: { date: Date; attendance: AttendanceAccumulatorT | null }[];
}

export interface AttendancesByTypesGroupedByMonthTypes {
    classType: ClassroomConfigClassTypesT | null | undefined;
    attendances: GetAttendanceByWeeklyMeetingsGroupedByMonthResults[] | null | undefined;
}

export interface GetMonthsAndWeeksInMonthByMeetingsProps {
    meetings: MeetingAttendanceT[];
}

export interface GetMonthsAndWeeksInMonthByMeetingsResult {
    month: Date;
    weeks: Date[];
}
