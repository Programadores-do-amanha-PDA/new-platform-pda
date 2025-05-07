"use client";
import CurriculumFormData from "@/components/common/curriculum/form-data";
import { useAlumniStack } from "@/context/alumni/stack-context";

export default function Page() {
  const {
    resumeStack: { resumes, handleCreateResume, handleUpdateResume },
  } = useAlumniStack();
  return (
    <main className="w-full h-max relative flex flex-col p-6 gap-10 xl:p-8">
      <div className="w-full max-w-3xl h-max rounded-xl flex flex-col items-center justify-center gap-4">
        <CurriculumFormData
          currentResume={
            resumes.sort(
              (a, b) =>
                new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime()
            )[0]
          }
          handleCreateResume={handleCreateResume}
          handleUpdateResume={handleUpdateResume}
        />
      </div>
    </main>
  );
}
