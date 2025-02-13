import { AppBar } from "@/components/app-bar";
import CurriculumFormData from "@/components/curriculum/form-data";

export default function Page() {
  return (
    <main className="w-full h-full relative flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="w-full max-w-3xl h-max rounded-xl flex flex-col items-center justify-center gap-4">
        <CurriculumFormData />
      </div>
    </main>
  );
}
