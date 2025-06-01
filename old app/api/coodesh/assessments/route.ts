import { getCoodeshAPIAssessments } from "@/utils/apis/coodesh/assessments";

export async function GET() {
  try {
    const assessments = await getCoodeshAPIAssessments();
    if (!assessments) throw "no assessments fetched successfully";
    console.log(assessments);

    return Response.json(
      {
        success: true,
        assessments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return Response.json({}, { status: 500 });
  }
}