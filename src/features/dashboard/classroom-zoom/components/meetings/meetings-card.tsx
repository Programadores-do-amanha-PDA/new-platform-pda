"use client";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ZoomMeetingT } from "@/types/classroom-zoom/meetings";
import { useMeetingCard } from "../../hooks/use-meeting-card";
import { RECURRING_MEETING_TYPES, isFutureMeeting } from "../../utils/meeting-utils";
import {
  MeetingHeader,
  MeetingInfo,
  MeetingStats,
  RefreshButton,
  CalendarButton,
} from "./meeting-card-components";

interface ZoomMeetingsCardProps {
  meeting: ZoomMeetingT;
  allMeetingLoading: boolean;
  setAllMeetingLoading: (v: boolean) => void;
  expansive: boolean;
}

export default function ZoomMeetingsCard({
  meeting,
  allMeetingLoading,
  setAllMeetingLoading,
  expansive,
}: ZoomMeetingsCardProps) {
  const { classroom_id } = useParams();
  
  const {
    loading,
    meetingPastInstances,
    upcomingOccurrences,
    handleRefreshMeeting,
  } = useMeetingCard(meeting, setAllMeetingLoading);

  const isRecurringMeeting = RECURRING_MEETING_TYPES.includes(meeting.type as 3 | 8);
  const classroomId = classroom_id as string;

  return (
    <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-4">
      <MeetingHeader meeting={meeting} classroomId={classroomId} />
      
      <div className="flex flex-col gap-1">
        <MeetingInfo meeting={meeting} />
      </div>

      {expansive && (
        <>
          {isRecurringMeeting || !isFutureMeeting(meeting.start_time) ? (
            <>
              <Separator />
              <div className="w-full flex justify-between items-start">
                <MeetingStats
                  meeting={meeting}
                  pastInstancesCount={meetingPastInstances.length}
                  upcomingOccurrencesCount={upcomingOccurrences?.length}
                />
                <RefreshButton
                  loading={loading}
                  allMeetingLoading={allMeetingLoading}
                  onRefresh={handleRefreshMeeting}
                />
              </div>
            </>
          ) : (
            <CalendarButton meeting={meeting} loading={loading} />
          )}
        </>
      )}
    </li>
  );
}
