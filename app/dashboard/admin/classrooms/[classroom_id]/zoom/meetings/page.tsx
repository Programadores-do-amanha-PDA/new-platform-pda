import ZoomMeetingsPage from "@/modules/zoom/zoom-meetings";

const MeetingsPage = async ({
  params,
}: {
  params: Promise<{ classroom_id: string }>;
}) => {
  const { classroom_id } = await params;

  return <ZoomMeetingsPage classroom_id={classroom_id} />;
};

export default MeetingsPage;
