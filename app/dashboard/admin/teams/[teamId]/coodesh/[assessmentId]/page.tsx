import AssessmentPage from "@/components/teams/coodesh/assessment/assessment-page";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string; assessmentId: string }>;
}) {
  const { teamId, assessmentId } = await params;
  return (
    <div className="w-full h-full max-w-3xl relative flex flex-col p-6 gap-10 xl:p-8">
      <AssessmentPage assessmentId={assessmentId} teamId={teamId} />
    </div>
  );
}
