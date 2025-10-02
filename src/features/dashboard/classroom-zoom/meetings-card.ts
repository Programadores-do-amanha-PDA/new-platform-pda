import { ZoomMeetingT } from "@/types";

export interface ZoomMeetingsCardProps {
  meeting: ZoomMeetingT;
  allMeetingLoading: boolean;
  setAllMeetingLoading: (v: boolean) => void;
  expansive: boolean;
}

export interface MeetingHeaderProps {
  meeting: ZoomMeetingT;
  classroomId: string;
}

export interface MeetingInfoProps {
  meeting: ZoomMeetingT;
}

export interface MeetingStatsProps {
  meeting: ZoomMeetingT;
  pastInstancesCount?: number;
  upcomingOccurrencesCount?: number;
}

export interface RefreshButtonProps {
  loading: boolean;
  allMeetingLoading: boolean;
  onRefresh: () => void;
}

export interface CalendarButtonProps {
  meeting: ZoomMeetingT;
  loading: boolean;
}
