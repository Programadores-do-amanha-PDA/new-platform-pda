"use client";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import ZoomRecurrenceMeetingPage from "./recurrence-meeting-page";
import ZoomPastMeetingPage from "./past-meeting-page";
import { useParams } from "next/navigation";

export default function ZoomMeetingPage() {
  const { meeting_id } = useParams<{ meeting_id: string }>();
  const { meetings } = useZoomMeetingStore();

  console.log("meeting_id", meeting_id);

  const currentMeeting = meetings?.find((m) => m.id === meeting_id);

  if (!currentMeeting) {
    return <div>Meeting not found</div>;
  }

  if (currentMeeting.type === 8) {
    return <ZoomRecurrenceMeetingPage meeting_id={meeting_id} />;
  } else {
    return <ZoomPastMeetingPage meeting_id={meeting_id} />;
  }
}
