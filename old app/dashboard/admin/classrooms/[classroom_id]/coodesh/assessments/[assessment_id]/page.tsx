import AssessmentPage from "@/modules/coodesh/assessment-page";

const CoodeshAssessmentPage = async ({
  params,
}: {
  params: Promise<{ assessment_id: string }>;
}) => {
  const { assessment_id } = await params;
  return <AssessmentPage assessment_id={assessment_id} />;
};

export default CoodeshAssessmentPage; 
