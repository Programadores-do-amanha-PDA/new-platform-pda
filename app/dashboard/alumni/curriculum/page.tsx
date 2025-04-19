"use client"
import { AppBar } from "@/components/common/app-bar";
import CurriculumFormData from "@/components/common/curriculum/form-data";
import { useAlumniStack } from "@/context/alumni/stack-context";

export default function Page() {
  const {
    curriculumStack: {
      curriculum,
      handleCreateCurriculum,
      handleUpdateCurriculum,
    },
  } = useAlumniStack();
  return (
    <main className="w-full h-max relative flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="w-full max-w-3xl h-max rounded-xl flex flex-col items-center justify-center gap-4">
        <CurriculumFormData
          currentCurriculum={curriculum}
          handleCreateCurriculum={handleCreateCurriculum}
          handleUpdateCurriculum={handleUpdateCurriculum}
        />
      </div>
    </main>
  );
}
