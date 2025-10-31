import { AuthUserWithProfileT } from "@/types";
import {
  ZoomMeetingPastInstanceT,
  ZoomMeetingT,
} from "../../classroom-zoom/types";

export interface AttendanceTableProps {
  allVisibleUsers: Partial<AuthUserWithProfileT>[];
  allAggregateInMetricUsers: Partial<AuthUserWithProfileT>[];
  meetings: (
    | (ZoomMeetingPastInstanceT & { meeting_type: "meeting" | "pastInstance" })
    | (ZoomMeetingT & { meeting_type: "meeting" | "pastInstance" })
  )[];
  classroomId: string;
}
