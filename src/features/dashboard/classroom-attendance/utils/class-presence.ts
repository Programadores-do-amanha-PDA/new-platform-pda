import {
  AuthUserWithProfileT,
} from "@/types";
import { calculateUserAttendance } from "@/utils/attendance-calculator";
import { ZoomMeetingPastInstanceT, ZoomMeetingT } from "../../classroom-zoom/types";

export function calculateClassPresence(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  users: Partial<AuthUserWithProfileT>[]
): number {
  if (!meeting.participants || meeting.participants.length === 0) {
    return 0;
  }

  const attendances = users.filter((user) => {
    const attendance = calculateUserAttendance(meeting, user.email || "");
    return attendance.justification?.is_presence || attendance.limit?.is_presence;
  });

  const presencePercentage = (attendances.length / users.length) * 100;
  return Math.round((presencePercentage * 100) / 100);
}
