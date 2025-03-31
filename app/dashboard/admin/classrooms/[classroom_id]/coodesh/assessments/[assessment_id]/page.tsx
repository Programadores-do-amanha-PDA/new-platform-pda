import AssessmentPage from "@/modules/coodesh/assessment-page";

export default async function Page({
  params,
}: {
  params: Promise<{ classroom_id: string; assessment_id: string }>;
}) {
  const { classroom_id, assessment_id } = await params;
  return (
    <AssessmentPage assessment_id={assessment_id} classroom_id={classroom_id} />
  );
}
