import { ClassTypes, SettingJustification } from "../../settings/types";
import { ZoomMeetingPastInstance, ZoomMeeting } from "../../integrations/zoom/types";

export interface WeeklyPresenceDataT {
    weekStart: Date;
    meetings: (ZoomMeeting | ZoomMeetingPastInstance)[];
    presencePercentage: number;
    presentUsers: string[];
}

export interface WeeklyClassPresenceResultT {
    weeklyPresence: Record<string, WeeklyPresenceDataT>;
    overallPresence: number;
}

export interface AttendanceCalculationOptionsT {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
    roundPrecision?: number;
}

export interface CalculateUserWeeklyAttendancePropsT {
    userEmail: string;
    currentMeeting: ZoomMeeting | ZoomMeetingPastInstance;
    weekMeetings: (ZoomMeeting | ZoomMeetingPastInstance)[];
    currentClassType?: ClassTypes;
    availableJustifications?: SettingJustification[];
    shouldAggregateInMetric?: boolean;
}
