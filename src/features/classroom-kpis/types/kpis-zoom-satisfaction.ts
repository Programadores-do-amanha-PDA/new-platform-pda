import { ZoomPastMeetingAttendance } from "@/features/classroom-attendance/types";
import { ClassTypes } from "@/features/classrooms/settings";

export interface GetSatisfactionAccumulatorProps {
    meetings: ZoomPastMeetingAttendance[];
    classroomClassTypes: ClassTypes[];
}

export interface GetSatisfactionAccumulatorResult {
    totalSatisfaction: number;
    indicators: {
        totalContent: number;
        totalFacilitation: number;
        totalSelfDev: number;
    };
    count: number;
}

export interface GetSatisfactionByWeeklyMeetingsGroupedByMonthProps {
    allMeetings: ZoomPastMeetingAttendance[];
    classroomClassTypes: ClassTypes[];
}

export interface GetSatisfactionByWeeklyMeetingsGroupedByMonthResults {
    month: { date: Date; satisfaction: GetSatisfactionAccumulatorResult | null };
    weeks: { date: Date; satisfaction: GetSatisfactionAccumulatorResult | null }[];
}

export interface SatisfactionByClassTypeGroupedByMonth {
    classType: ClassTypes | null | undefined;
    satisfaction: GetSatisfactionByWeeklyMeetingsGroupedByMonthResults[] | null | undefined;
}
