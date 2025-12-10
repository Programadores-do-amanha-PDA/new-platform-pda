import { MeetingAttendanceT } from "../../classroom-attendance/types";
import { ClassroomConfigClassTypesT } from "../../classroom-configs/types";

export interface IGetSatisfactionAccumulatorProps {
    meetings: MeetingAttendanceT[];
    classroomClassTypes: ClassroomConfigClassTypesT[];
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
    allMeetings: MeetingAttendanceT[];
    classroomClassTypes: ClassroomConfigClassTypesT[];
}

export interface IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults {
    month: { date: Date; satisfaction: IGetSatisfactionAccumulatorResult | null };
    weeks: { date: Date; satisfaction: IGetSatisfactionAccumulatorResult | null }[];
}

export interface ISatisfactionByTypesGroupedByMonthType {
    classType: ClassroomConfigClassTypesT | null | undefined;
    satisfaction: IGetSatisfactionByWeeklyMeetingsGroupedByMonthResults[] | null | undefined;
}
