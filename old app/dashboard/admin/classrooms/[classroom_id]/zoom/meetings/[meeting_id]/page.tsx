import ZoomMeetingPage from "@/modules/zoom/meeting-page";

const MeetingPage = async ({
  params,
}: {
  params: Promise<{ meeting_id: string }>;
}) => {
  const { meeting_id } = await params;
  return <ZoomMeetingPage meeting_id={meeting_id} />;
};
export default MeetingPage;
