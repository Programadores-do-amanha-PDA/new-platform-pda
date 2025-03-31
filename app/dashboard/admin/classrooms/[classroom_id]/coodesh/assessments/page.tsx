"use server";
import AssessmentsPage from "@/modules/coodesh/assessments-page";

export default async function Page({
  params,
}: {
  params: Promise<{ classroom_id: string }>;
}) {
  const { classroom_id } = await params;

  return <AssessmentsPage classroom_id={classroom_id} />;
}
