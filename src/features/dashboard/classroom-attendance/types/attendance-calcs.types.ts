import {
  ClassroomConfigClassTypesLimitT,
  ClassroomConfigClassTypesT,
  ClassroomConfigJustificationT,
} from "../../classroom-configs/types";
import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../../classroom-zoom/types";

/**
 * Represents the attendance calculation result for a user in a meeting
 */
export interface AttendanceCalcResultT {
  /** Total minutes the user attended the meeting */
  minutesAttended: number;
  /** The class type limit that applies to this attendance */
  limit?: ClassroomConfigClassTypesLimitT;
  /** The justification applied (if any) */
  justification?: ClassroomConfigJustificationT;
}

export interface CalculateUserAttendancePropsT {
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT;
  userEmail: string;
  currentClassType?: ClassroomConfigClassTypesT;
  availableJustifications?: ClassroomConfigJustificationT[];
  shouldAggregateInMetric?: boolean;
}
