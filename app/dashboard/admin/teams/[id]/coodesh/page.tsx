"use server";
import AssessmentsSheetData from "@/components/teams/coodesh/assessments-sheet-data";
import AssessmentsTeamList from "@/components/teams/coodesh/assessments-team-list";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="relative w-full h-max flex flex-col p-6 gap-10 xl:p-8">
      <header className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4 xl:gap-6">
          <h1 className="text-left font-bold text-3xl">Coodesh</h1>
          <AssessmentsSheetData teamId={id} />
        </div>
      </header>

      <main className="w-full h-full flex items-center justify-center">
        <AssessmentsTeamList teamId={id}/>
      </main>
    </div>
  );
}
