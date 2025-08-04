"use client"
import { useAdminStackContext } from "@/context/admin/stack-context";
import ZoomRecurrenceMeetingPage from "./recurrence-meeting-page";
import ZoomPastMeetingPage from "./past-meeting-page";

const ZoomMeetingPage = ({ meeting_id }: { meeting_id: string }) => {
  const {
    classroomsStack: {
      zoom: {
        meetings: { meetings },
      },
    },
  } = useAdminStackContext();

  const currentMeeting = meetings?.find((m) => m.id === meeting_id);

  if (!currentMeeting) {
    return <div>Meeting not found</div>;
  }

  if (currentMeeting.type === 8) {
    return <ZoomRecurrenceMeetingPage meeting_id={meeting_id} />;
  } else {
    return <ZoomPastMeetingPage meeting_id={meeting_id} />;
  }
};

export default ZoomMeetingPage;
