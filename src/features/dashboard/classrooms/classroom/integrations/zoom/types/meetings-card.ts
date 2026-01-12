import { ZoomMeeting } from ".";


export interface ZoomMeetingsCardProps {
  meeting: ZoomMeeting;
  allMeetingLoading: boolean;
  setAllMeetingLoading: (v: boolean) => void;
  expansive: boolean;
}

export interface MeetingHeaderProps {
  meeting: ZoomMeeting;
  classroomId: string;
}

export interface MeetingInfoProps {
  meeting: ZoomMeeting;
}

export interface MeetingStatsProps {
  meeting: ZoomMeeting;
  pastInstancesCount?: number;
  upcomingOccurrencesCount?: number;
}

export interface RefreshButtonProps {
  loading: boolean;
  allMeetingLoading: boolean;
  onRefresh: () => void;
}

export interface CalendarButtonProps {
  meeting: ZoomMeeting;
  loading: boolean;
}
