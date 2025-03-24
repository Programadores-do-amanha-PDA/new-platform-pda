"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { FileSearch, Languages, Timer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttemptsDataTable } from "./attempts-data-table";

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

      <Tabs defaultValue="attempts" className="w-full">
        <TabsList>
          <TabsTrigger value="attempts">Respostas</TabsTrigger>
          <TabsTrigger value="questions">Questões</TabsTrigger>
        </TabsList>
        <TabsContent value="attempts">
          <AttemptsDataTable
            assessment={assessment}
            handleUpdateTeamAssessment={handleUpdateTeamAssessment}
          />
        </TabsContent>
        <TabsContent value="questions">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentPage;
