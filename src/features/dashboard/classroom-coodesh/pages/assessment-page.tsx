"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, FileSearch, Languages, Timer} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttemptsDataTable } from "../components/attempts-data-table";
import { AssessmentQuestionsTable } from "../components/assessment-questions-table";
import { useCoodeshAssessmentStore } from "../stores/assessments";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationButton } from "@/components/shared/delete-confirmation-dialog";
import Link from "next/link";

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
  const { assessment_id, classroom_id } = useParams();
  const { assessments, updateAssessment, deleteAssessment } =
    useCoodeshAssessmentStore();

  const assessment = assessments.find(
    (assessment) => assessment.id === assessment_id
  );

  if (!assessment || !assessment_id) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 py-6 overflow-hidden">
        <h2 className="font-bold text-2xl text-foreground">
          Avaliação não encontrada.
        </h2>
        <p className="text-muted-foreground">
          Verifique se o ID da Avaliação está correto ou se a Avaliação esta
          cadastrada na turma.
        </p>
        <Button variant="outline" asChild>
          <Link
            href={`/dashboard/classrooms/${classroom_id}/coodesh/assessments`}
            className="hover:underline font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4 rotate-2" />
            Ver toda as Avaliações
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 py-6 overflow-hidden">
      <header className="w-full flex justify-baseline gap-4">
        <div className="w-full flex flex-col gap-1">
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
        </div>
        <DeleteConfirmationButton
          onConfirm={() => assessment.id && deleteAssessment(assessment.id)}
          buttonText="Deletar Avaliação"
          dialogTitle="Deletar Avaliação"
          description={`Tem certeza que deseja deletar a avaliação "${assessment.name}"? Esta ação não pode ser desfeita e todas as entregas, dados de integridades e planos de ações associados serão permanentemente removidos.`}
          confirmText="Deletar Avaliação"
        />
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
