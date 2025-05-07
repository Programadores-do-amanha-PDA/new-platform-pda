import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResumeT } from "@/types/resume";
import { calculateResumeCompletion } from "@/utils/calculate-resume-completion";
import { ArrowRight, FileUser } from "lucide-react";
import { useRouter } from "next/navigation";

const AlumniPercentCompletedResumeCard = ({
  resumes,
}: {
  resumes: ResumeT[];
}) => {
  const router = useRouter();

  const completionPercent = calculateResumeCompletion(resumes[0]);
  return (
    <div className="w-full md:max-w-64 max-h-72 bg-card border shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <div className="flex flex-col items-center justify-start gap-4">
        <FileUser className="size-10 text-card-foreground" />
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className="text-lg font-bold text-card-foreground">
            {resumes[0].id
              ? `${completionPercent}% preenchido!`
              : "Crie seu currículo!"}
          </h1>
          {completionPercent === 100 ? (
            <p className="text-sm text-muted-foreground text-center">
              Mantenha seu currículo atualizado para ter uma melhor experiencia
              no match de vagas!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Termine de preencher seu currículo para obter uma melhor
              experiencia no match de vagas!
            </p>
          )}
        </div>
      </div>
      <Button
        variant={completionPercent === 100 ? "link" : "default"}
        className={cn(
          "font-semibold mt-2",
          completionPercent === 100 ? "text-muted-foreground" : ""
        )}
        onClick={() => router.push("/dashboard/alumni/resume")}
      >
        {completionPercent === 100
          ? "Atualizar Currículo"
          : "Preencher Currículo"}

        <ArrowRight className="size-4 -rotate-12" />
      </Button>
    </div>
  );
};
export default AlumniPercentCompletedResumeCard;
