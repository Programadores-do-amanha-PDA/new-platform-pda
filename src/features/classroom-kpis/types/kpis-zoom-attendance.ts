import { ZoomPastMeetingAttendance } from "@/features/classroom-attendance/types";
import { ClassTypes } from "@/features/classrooms/settings";
import { Profile } from "@/features/users/profile/types/profile";

export type AttendanceAccumulatorT = {
    totalPresencePercentage: number;
    count: number;
};

export interface GetMeetingsByTypeColumnsP {
    meetingsByType: Record<string, ZoomPastMeetingAttendance[]>;
    meetingsTypes:  ClassTypes[];
}

export type meetingsByClassTypeT = Record<string, ZoomPastMeetingAttendance>;

export interface GetAttendanceAccumulatorProps {
    meetings: ZoomPastMeetingAttendance[];
    allAggregateInMetricUsers: Profile[];
    classroomClassTypes: ClassTypes[];
}

export interface GetAttendanceByWeeklyMeetingsGroupedByMonthProps {
    allMeetings: ZoomPastMeetingAttendance[];
    allAggregateInMetricUsers: Profile[];
    classroomClassTypes: ClassTypes[];
}

export interface GetAttendanceByWeeklyMeetingsGroupedByMonthResults {
    month: { date: Date; attendance: AttendanceAccumulatorT | null };
    weeks: { date: Date; attendance: AttendanceAccumulatorT | null }[];
}

export interface AttendancesByTypesGroupedByMonthTypes {
    classType: ClassTypes | null | undefined;
    attendances: GetAttendanceByWeeklyMeetingsGroupedByMonthResults[] | null | undefined;
}

export interface GetMonthsAndWeeksInMonthByMeetingsProps {
    meetings: ZoomPastMeetingAttendance[];
}

export interface GetMonthsAndWeeksInMonthByMeetingsResult {
    month: Date;
    weeks: Date[];
}
