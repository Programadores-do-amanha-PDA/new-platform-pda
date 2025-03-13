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
import { Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { AssessmentType } from "@/types/assessments";

const AssessmentsSheetData = ({
  teamId,
  assessments,
}: {
  teamId: string;
  assessments: AssessmentType[];
}) => {
  const {
    teamsStack: {
      teams,
      coodesh: { handleCreateTeamAssessment },
    },
  } = useAdminStackContext();

  const attachedAssessments = teams.find(
    (team) => team.id === teamId
  )?.team_coodesh_assessments;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="!px-4 w-max items-start justify-start font-semibold">
          Anexar Avaliação
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Anexar Avaliação</SheetTitle>
          <SheetDescription>
            Anexe abaixo as avaliações da Coodesh que fazem parte desta turma
          </SheetDescription>
        </SheetHeader>
        <main className="h-full flex flex-col gap-4 xl:gap-6 py-2">
          <div>
            <Input placeholder="Procurando por algo?" />
          </div>
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
                .map((assessmentPayload) => (
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
                          handleCreateTeamAssessment(
                            teamId,
                            assessmentPayload.assessment_id
                          )
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
