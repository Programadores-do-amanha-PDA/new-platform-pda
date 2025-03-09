"use server";
import AssessmentsSheetData from "@/components/teams/coodesh/assessments-sheet-data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const handleDetachJobAssessment = () => {
    "use server";
    return Promise.resolve(false);
  };

  return (
    <div className="relative w-full h-max flex flex-col p-6 gap-10 xl:p-8">
      <header className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4 xl:gap-6">
          <h1 className="text-left font-bold text-3xl">Coodesh</h1>
          <AssessmentsSheetData
            teamId={id}
            handleAttachAssessment={handleDetachJobAssessment}
            attachedAssessments={["6707e51d867d313ecdd5f456"]}
          />
        </div>
      </header>
    </div>
  );
}
