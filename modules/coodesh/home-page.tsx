"use client";
import AssessmentsClassroomListCard from "@/components/classrooms/coodesh/assessments-classroom-list-card";
import { AttemptsChallengeScoreChart } from "@/components/classrooms/coodesh/attempts-challenge-score-chart";
import { Button } from "@/components/ui/button";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CoodeshHomePage = () => {
  const {
    classroomsStack: {
      coodesh: { assessments },
    },
  } = useAdminStackContext();

  const path = usePathname();

  return (
    <div className="w-full h-full flex flex-col gap-8 p-6 overflow-hidden">
      <AttemptsChallengeScoreChart
        participants={assessments
          .map((assessment) => assessment.participants_data || [])
          .flat()}
      />
      <div className="w-full h-full flex flex-wrap items-start gap-4 px-6 overflow-hidden">
        <header className="w-full flex justify-between gap-4">
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
                  handleUpdateCoodeshAssessment={() => Promise.resolve(false)}
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
