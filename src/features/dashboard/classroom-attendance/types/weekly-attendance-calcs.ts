import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../../classroom-zoom/types";

export interface WeeklyPresenceDataT {
  weekStart: Date;
  meetings: (ZoomMeetingT | ZoomMeetingPastInstanceT)[];
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
  includeJustifications?: boolean;
}
