import { getCoodeshAPIAssessments } from "@/utils/apis/coodesh/assessments";

export async function GET() {
  try {
    const response = await getCoodeshAPIAssessments();
    if (!response) throw "no assessments fetched successfully";
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return Response.json({}, { status: 500 });
  }
}
