"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AttemptsChallengeScoreChart } from "../components/homepage/attempts-challenge-score-chart";
import AssessmentsClassroomListCard from "../components/assessments/assessments-classroom-list-card";
import { useCoodeshAssessmentStore } from "../stores/assessments";

const CoodeshHomePage = () => {
  const { assessments } = useCoodeshAssessmentStore();

  const path = usePathname();

  return (
    <div className="w-full h-full flex flex-col gap-8 p-6 overflow-y-scroll">
      <AttemptsChallengeScoreChart
        participants={assessments
          .map((assessment) => assessment.participants_data || [])
          .flat()}
      />

      <div className="w-full min-h-[200px] flex flex-col justify-start items-start gap-4 px-6">
        <header className="w-full h-12 flex justify-between gap-4">
          <p className="text-lg font-bold mb-4">Avaliações da turma</p>
          <Link href={`${path}/assessments`}>
            <Button
              variant="link"
              className="text-sm font-bold text-primary-foreground"
            >
              Ver todas as avaliações
              <ArrowRight className="-rotate-6" />
            </Button>
          </Link>
        </header>

        {assessments.length > 0 && (
          <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto">
            {assessments
              ?.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
              .filter((_, i) => i < 5)
              .map((assessment) => (
                <AssessmentsClassroomListCard
                  key={assessment.assessment_id}
                  assessment={assessment}
                  expansive={false}
                />
              ))}
          </ul>
        )}
        {assessments.length === 0 && (
          <div className="w-full h-full flex justify-center items-center">
            <p className="font-semibold text-center text-muted-foreground">
              Nenhuma avaliação encontrada...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoodeshHomePage;
