import {
  ClassTypesLimit,
  ClassTypes,
  SettingJustification,
} from "../../settings/types";
import {
  ZoomMeetingPastInstance,
  ZoomMeeting,
} from "../../integrations/zoom/types";

/**
 * Represents the attendance calculation result for a user in a meeting
 */
export interface AttendanceCalcResultT {
  minutesAttended: number;
  limit?: ClassTypesLimit;
  justification?: SettingJustification;
}

export interface CalculateUserAttendancePropsT {
  meeting: ZoomMeeting | ZoomMeetingPastInstance;
  userEmail: string;
  currentClassType?: ClassTypes;
  availableJustifications?: SettingJustification[];
  shouldAggregateInMetric?: boolean;
}
