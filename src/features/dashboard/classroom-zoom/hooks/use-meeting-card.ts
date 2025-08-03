import { useState } from "react";
import { ZoomMeetingT } from "@/types/classroom-zoom/meetings";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";

export const useMeetingCard = (
  meeting: ZoomMeetingT,
  setAllMeetingLoading: (v: boolean) => void
) => {
  const [loading, setLoading] = useState(false);

  const { accounts } = useZoomAccountStore();
  const { refreshAndUpdateMeeting } = useZoomMeetingStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();

  const meetingPastInstances = pastInstances.filter(
    (instance) => instance.meeting_id === meeting.id
  );

  const upcomingOccurrences = meeting.occurrences?.filter(
    (occurrence) => new Date(occurrence.start_time).getTime() >= Date.now()
  );

  const handleRefreshMeeting = async () => {
    setAllMeetingLoading(true);
    setLoading(true);

    const account = accounts.find(
      (account) => account.id === meeting.account_id
    );
    
    if (account) {
      await refreshAndUpdateMeeting(meeting, account);
    }

    setAllMeetingLoading(false);
    setLoading(false);
  };

  return {
    loading,
    meetingPastInstances,
    upcomingOccurrences,
    handleRefreshMeeting,
  };
};