import { Button } from "@/components/ui/button";
import { CurriculumType } from "@/types/curriculum";
import { calculateCurriculumCompletion } from "@/utils/calculate-curriculum-completion";
import { ArrowRight, FileUser } from "lucide-react";
import { useRouter } from "next/navigation";

const AlumniPercentCompletedCurriculumCard = ({
  curriculum,
}: {
  curriculum: CurriculumType;
}) => {
  const router = useRouter();

  const completionPercent = calculateCurriculumCompletion(curriculum);
  return (
    <div className="w-full md:max-w-64 max-h-72 bg-card border shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <div className="flex flex-col items-center justify-start gap-4">
        <FileUser className="size-10 text-card-foreground" />
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className="text-lg font-bold text-card-foreground">
            {curriculum.id
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
        variant="secondary"
        className="text-card-foreground mt-2"
        onClick={() => router.push("/dashboard/alumni/curriculum")}
      >
        {completionPercent === 100
          ? "Atualizar Currículo"
          : "Preencher Currículo"}

        <ArrowRight className="size-4 text-muted-foreground -rotate-12" />
      </Button>
    </div>
  );
};
export default AlumniPercentCompletedCurriculumCard;
