import { ZoomMeeting } from "@/features/classroom-zoom/types/meetings";
import { ZoomMeetingPastInstance } from "@/features/classroom-zoom/types/past-instances";
import { ClassTypesLimit, SettingJustification, ClassTypes } from "@/features/classrooms/settings";

export interface CalculateUserAttendanceResult {
  minutesAttended: number;
  limit?: ClassTypesLimit;
  justification?: SettingJustification;
}

export interface CalculateUserAttendanceParams {
  meeting: ZoomMeeting | ZoomMeetingPastInstance;
  userEmail: string;
  currentClassType?: ClassTypes;
  availableJustifications?: SettingJustification[];
  shouldAggregateInMetric?: boolean;
}
