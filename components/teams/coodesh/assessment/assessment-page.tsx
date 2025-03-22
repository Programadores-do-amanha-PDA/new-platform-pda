"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ChevronsUpDown, FileSearch, Languages, Timer } from "lucide-react";
import { useState } from "react";
import InsertAssessmentAttempts from "./insert-assessment-attemts";
import {
  calculateAccuracyByChallenge,
  calculateAverageDurationByChallenge,
  calculateMetrics,
  calculateOverallAccuracy,
  calculateOverallAverageDuration,
} from "@/utils/coodesh/calculate-metric";

type DefaultLocations = {
  pt: string;
  en: string;
  es: string;
};

const AssessmentPage = ({
  teamId,
  assessmentId,
}: {
  teamId: string;
  assessmentId: string;
}) => {
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);

  const {
    teamsStack: {
      teams,
      coodesh: { handleUpdateTeamAssessment },
    },
  } = useAdminStackContext();

  const defaultLocations = {
    pt: "Português",
    en: "English",
    es: "Español",
  };

  const assessment = teams
    .find((team) => team.id === teamId)
    ?.team_coodesh_assessments?.find(
      (assessment) => assessment.id === assessmentId
    );

  const overallAccuracy = calculateOverallAccuracy(
    assessment?.participants_data || []
  );
  const accuracyByChallenge = calculateAccuracyByChallenge(
    assessment?.participants_data || []
  );
  const overallDuration = calculateOverallAverageDuration(
    assessment?.participants_data || []
  );
  const durationByChallenge = calculateAverageDurationByChallenge(
    assessment?.participants_data || []
  );

  return (
    <div className="w-full h-full flex flex-col gap-8">
      <header className="w-full flex flex-col gap-2">
        <div>
          <h2 className="font-bold text-2xl text-foreground">
            {assessment?.name}
          </h2>
          <p className="text-muted-foreground font-semibold">
            {assessment?.description}
          </p>
        </div>
        <div className="flex gap-2">
          <p className="text-muted-foreground font-semibold">Testes:</p>
          <div className="flex gap-1" title="Duração do teste">
            <Timer className="size-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {assessment?.duration}{" "}
              {assessment?.duration_unit === "hour" ? "horas" : "minutos"}
            </span>
          </div>
          {assessment?.default_locale && (
            <div className="flex gap-1" title="Idioma">
              <Languages className="size-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {
                  defaultLocations[
                    assessment.default_locale as keyof DefaultLocations
                  ]
                }
              </span>
            </div>
          )}
          {
            <div className="flex gap-1" title="Questões">
              <FileSearch className="size-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {assessment?.questions.length}
              </span>
            </div>
          }
        </div>
      </header>

      <Collapsible
        open={isQuestionsExpanded}
        onOpenChange={setIsQuestionsExpanded}
        className="space-y-2"
      >
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex gap-6">
            <p className="text-lg font-semibold  truncate">Questões</p>
          </div>

          <div className="w-max h-6 items-center flex gap-4">
            {assessment?.participants_data &&
              assessment?.participants_data?.length > 0 && (
                <div className="flex gap-1 h-full">
                  <Badge variant="default" className="text-xs truncate">
                    Entregas: {assessment.participants_data.length}
                  </Badge>
                  <Badge variant="default" className="text-xs truncate">
                    Media geral de acertos:{overallAccuracy.toFixed(1)}%
                  </Badge>
                  <Badge variant="default" className="text-xs truncate">
                    Media geral de duração: {overallDuration.toFixed(1)}
                    minutos
                  </Badge>
                </div>
              )}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Alternar questões</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          {assessment?.questions.map((question) => (
            <div
              key={question.name}
              className="rounded-md border px-4 py-2 text-sm shadow-sm"
            >
              <h3 className="font-semibold">{question.name}</h3>
              <p className="text-gray-600 mt-1">{question.description}</p>

              <div className="w-full h-6 flex gap-4 mt-3">
                <div className="flex gap-1 h-full">
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground truncate"
                  >
                    {question.type_formatted}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground truncate"
                  >
                    {question.level_formatted}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground truncate"
                  >
                    {question.duration}{" "}
                    {question.duration_unit === "hour" ? "horas" : "minutos"}
                  </Badge>
                </div>
                {assessment.participants_data &&
                  assessment?.participants_data?.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-full" />
                      <div className="flex gap-1 h-full">
                        <Badge variant="default" className="text-xs truncate">
                          Media de acertos: 20%
                        </Badge>
                        <Badge variant="default" className="text-xs truncate">
                          Media de duração: 17m
                        </Badge>
                      </div>
                    </>
                  )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex gap-6">
          <p className="text-lg font-semibold  truncate">Questões</p>
        </div>

        <div className="w-max h-6 items-center flex gap-4">
          <div className="flex gap-1 h-full">
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground truncate"
            >
              QTD. {assessment?.questions.length}
            </Badge>
          </div>

          {assessment?.participants_data &&
            assessment?.participants_data?.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-full" />
                <div className="flex gap-1 h-full">
                  <Badge variant="default" className="text-xs truncate">
                    Media geral de acertos: 20%
                  </Badge>
                  <Badge variant="default" className="text-xs truncate">
                    Media geral de duração: 17m
                  </Badge>
                </div>
              </>
            )}
        </div>

        <InsertAssessmentAttempts
          assessment={assessment}
          handleUpdateTeamAssessment={handleUpdateTeamAssessment}
        />
      </div>
      <div></div>
    </div>
  );
};

export default AssessmentPage;
