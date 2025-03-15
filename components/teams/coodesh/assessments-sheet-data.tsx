"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LoaderCircle, Paperclip, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { AssessmentPayloadType } from "@/types/assessments";
import { useState } from "react";

const AssessmentsSheetData = ({ teamId }: { teamId: string }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const {
    teamsStack: {
      teams,
      coodesh: {
        handleCreateTeamAssessment,
        api: { assessments, handleGetAssessments },
      },
    },
  } = useAdminStackContext();

  const attachedAssessments = teams.find(
    (team) => team.id === teamId
  )?.team_coodesh_assessments;

  // [
  //   {
  //     offset: 0,
  //     total: 1,
  //     limit: 150,
  //     payload: [
  //       {
  //         assessment_id: "6807e51d867d313ecdd5f456",
  //         name: "AT - Integração",
  //         description: "Teste integração ATT",
  //         default_locale: "pt",
  //         duration: 5,
  //         duration_unit: "hour",
  //         questions: [
  //           {
  //             name: "Teste básico de lógica",
  //             description: "Crie uma classe que possa os métodos abaixo...",
  //             type: "freecoding",
  //             type_formatted: "Programação livre",
  //             level: "beginner",
  //             level_formatted: "Iniciante",
  //             duration: 30,
  //             duration_unit: "minute",
  //           },
  //           {
  //             name: "Infraestrutura Multiusuários e Multitenant",
  //             description:
  //               "Solicitar ao candidato que desenhe e explique uma arquitetura...",
  //             type: "whiteboard",
  //             type_formatted: "Quadro branco",
  //             level: "advanced",
  //             level_formatted: "Avançado",
  //             duration: 5,
  //             duration_unit: "hour",
  //           },
  //         ],
  //       },
  //       {
  //         assessment_id: "6707e51d867d313ecdd5f456",
  //         name: "AT - Integração",
  //         description: "Teste integração ATT",
  //         default_locale: "pt",
  //         duration: 5,
  //         duration_unit: "hour",
  //         questions: [
  //           {
  //             name: "Teste básico de lógica",
  //             description: "Crie uma classe que possa os métodos abaixo...",
  //             type: "freecoding",
  //             type_formatted: "Programação livre",
  //             level: "beginner",
  //             level_formatted: "Iniciante",
  //             duration: 30,
  //             duration_unit: "minute",
  //           },
  //           {
  //             name: "Infraestrutura Multiusuários e Multitenant",
  //             description:
  //               "Solicitar ao candidato que desenhe e explique uma arquitetura...",
  //             type: "whiteboard",
  //             type_formatted: "Quadro branco",
  //             level: "advanced",
  //             level_formatted: "Avançado",
  //             duration: 5,
  //             duration_unit: "hour",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ]

  const handleRefreshCoodeshAssessments = async () => {
    setLoading(true);
    await handleGetAssessments();
    setLoading(false);
  };

  const handleOpen = async (open: boolean) => {
    if (open === true && assessments.length === 0) {
      await handleRefreshCoodeshAssessments();
    }

    setOpenModal(open);
  };

  return (
    <Sheet onOpenChange={handleOpen} open={openModal}>
      <SheetTrigger asChild>
        <Button className="!px-4 w-max items-start justify-start font-semibold">
          Anexar Avaliação
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="gap-4 w-full justify-between">
            Anexar Avaliação
            <Button
              size="icon"
              variant="outline"
              onClick={handleRefreshCoodeshAssessments}
            >
              <RefreshCw className="size-5" />
            </Button>
          </SheetTitle>
          <SheetDescription>
            Anexe abaixo as avaliações da Coodesh que fazem parte desta turma
          </SheetDescription>
        </SheetHeader>
        <main className="h-full flex flex-col gap-4 xl:gap-6 py-2">
          <div>
            <Input placeholder="Procurando por algo?" />
          </div>
          {!loading ? (
            <ul className="p-2 h-full flex flex-col gap-4 xl:gap-6 py-2">
              {assessments.map((assessment) =>
                assessment.payload
                  .filter(
                    (p) =>
                      !(
                        attachedAssessments &&
                        attachedAssessments
                          .map((att) => att.assessment_id)
                          .includes(p.assessment_id)
                      )
                  )
                  .map((assessmentPayload: AssessmentPayloadType) => (
                    <li
                      key={assessmentPayload.assessment_id}
                      className="p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 justify-between">
                        <div className="flex flex-col gap-1 truncate">
                          <h2 className="font-semibold text-sm truncate">
                            {assessmentPayload.name}
                          </h2>
                          <p className="text-xs text-gray-500 truncate">
                            {assessmentPayload.description}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            handleCreateTeamAssessment({
                              ...assessmentPayload,
                              team_id: teamId,
                            })
                          }
                          className="font-semibold"
                          size={"icon"}
                        >
                          <Paperclip />
                        </Button>
                      </div>
                    </li>
                  ))
              )}

              {assessments.filter(
                (assessment) =>
                  assessment.payload.filter(
                    (p) =>
                      !(
                        attachedAssessments &&
                        attachedAssessments
                          .map((att) => att.assessment_id)
                          .includes(p.assessment_id)
                      )
                  ).length > 0
              ).length === 0 && (
                <div className="flex flex-col gap-2 h-full items-center justify-center">
                  <h2 className="text-sm font-bold text-gray-800">
                    Não ha avaliações disponíveis
                  </h2>
                  <i className="text-xs text-muted-foreground px-2 text-center">
                    (Avaliações que ja estão anexadas a esta turma não aparecem
                    aqui.)
                  </i>
                </div>
              )}
            </ul>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <LoaderCircle className="size-6 stroke-primary animate-spin" />
            </div>
          )}
        </main>

        <SheetFooter>
          <SheetClose asChild>
            <Button className="font-semibold">Finalizar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AssessmentsSheetData;
