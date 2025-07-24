"use client";
import { FileSearch, Languages, Timer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttemptsDataTable } from "../components/attempts-data-table";
import { useCoodeshAssessmentStore } from "@/stores/modules/classrooms/coodesh/assessments";
import { AssessmentQuestionsTable } from "../components/assessment-questions-table";
import { useParams } from "next/navigation";

type DefaultLocationsT = {
  pt: string;
  en: string;
  es: string;
};

const defaultLocations: DefaultLocationsT = {
  pt: "Português",
  en: "English",
  es: "Español",
};

const AssessmentPage = () => {
  const { assessment_id } = useParams();
  const { assessments, updateAssessment } = useCoodeshAssessmentStore();

  const assessment = assessments.find(
    (assessment) => assessment.id === assessment_id
  );

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 py-6 overflow-hidden">
      <header className="w-full flex flex-col gap-2">
        <p className="text-muted-foreground font-semibold">
          {assessment?.description}
        </p>
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
                    assessment.default_locale as keyof DefaultLocationsT
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

      <Tabs defaultValue="attempts" className="w-full h-full overflow-hidden">
        <TabsList>
          <TabsTrigger value="attempts">Respostas</TabsTrigger>
          <TabsTrigger value="questions">Questões</TabsTrigger>
        </TabsList>
        <TabsContent value="attempts" className="w-full h-full overflow-hidden">
          <AttemptsDataTable
            assessment={assessment}
            updateAssessment={updateAssessment}
          />
        </TabsContent>
        <TabsContent
          value="questions"
          className="w-full h-full overflow-hidden"
        >
          <AssessmentQuestionsTable assessment={assessment} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentPage;
