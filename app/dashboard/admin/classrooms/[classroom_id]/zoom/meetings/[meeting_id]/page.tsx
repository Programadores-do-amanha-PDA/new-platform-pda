const MeetingPage = async ({
  params,
}: {
  params: Promise<{ classroom_id: string; meeting_id: string }>;
}) => {
  const { classroom_id, meeting_id } = await params;
  return;
};
export default MeetingPage;
