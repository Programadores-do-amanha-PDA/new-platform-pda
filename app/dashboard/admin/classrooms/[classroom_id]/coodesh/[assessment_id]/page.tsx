import AssessmentPage from "@/components/classrooms/coodesh/assessment/assessment-page";

export default async function Page({
  params,
}: {
  params: Promise<{ classroom_id: string; assessment_id: string }>;
}) {
  const { classroom_id, assessment_id } = await params;
  return (
    <div className="w-full h-full relative flex flex-col p-6 gap-10 xl:p-8">
      <AssessmentPage assessment_id={assessment_id} classroom_id={classroom_id} />
    </div>
  );
}
