import { ZoomPastMeetingAttendance } from "../../classroom-attendance/types";
import { ClassTypes } from "../../settings/types";

export interface IGetSatisfactionAccumulatorProps {
    meetings: ZoomPastMeetingAttendance[];
    classroomClassTypes: ClassTypes[];
}

export interface IGetSatisfactionAccumulatorResult {
    totalSatisfaction: number;
    indicators: {
        totalContent: number;
        totalFacilitation: number;
        totalSelfDev: number;
    };
    count: number;
}

export interface IGetSatisfactionByWeeklyMeetingsGroupedByMonthProps {
    allMeetings: ZoomPastMeetingAttendance[];
    classroomClassTypes: ClassTypes[];
}

export interface IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults {
    month: { date: Date; satisfaction: IGetSatisfactionAccumulatorResult | null };
    weeks: { date: Date; satisfaction: IGetSatisfactionAccumulatorResult | null }[];
}

export interface ISatisfactionByTypesGroupedByMonthType {
    classType: ClassTypes | null | undefined;
    satisfaction: IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults[] | null | undefined;
}
