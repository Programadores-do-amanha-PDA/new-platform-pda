import { Button } from "@/components/ui/button";
import { ArrowRight, FileUser } from "lucide-react";
import { useRouter } from "next/navigation";

const AlumniPercentCompletedCurriculumCard = () => {
  const router = useRouter();
  return (
    <div className="w-full md:max-w-64 h-max bg-card border shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <FileUser className="size-10 text-card-foreground" />
      <div className="flex flex-col gap-1 items-center justify-center">
        <h1 className="text-lg font-bold text-card-foreground">
          60% preenchido!
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Mantenha seu currículo atualizado para ter uam melhor experiencia no
          match de vagas!
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Preencha seu currículo para obter uma melhor experiencia no match de
          vagas!
        </p>
      </div>
      <Button
        variant="secondary"
        className="text-card-foreground mt-2"
        onClick={() => router.push("/dashboard/alumni/curriculum")}
      >
        Atualizar Currículo
        <ArrowRight className="size-4 text-muted-foreground -rotate-12" />
      </Button>
    </div>
  );
};
export default AlumniPercentCompletedCurriculumCard;
