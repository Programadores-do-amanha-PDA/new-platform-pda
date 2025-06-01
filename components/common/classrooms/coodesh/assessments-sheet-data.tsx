"use client";
import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { useAdminStackContext } from "@/context/admin/stack-context";

import { AssessmentPayloadType } from "@/types/coodesh/assessments";

const AssessmentsSheetData = ({ classroom_id }: { classroom_id: string }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [assessmentsSearch, setAssessmentsSearch] = useState<string>("");
  const {
    classroomsStack: {
      classrooms,
      coodesh: {
        handleCreateCoodeshAssessment,
        api: { coodeshAPIAssessments, handleGetCoodeshAPIAssessments },
      },
    },
  } = useAdminStackContext();

  const attachedAssessments = classrooms.find(
    (team) => team.id === classroom_id
  )?.classroom_coodesh_assessments;

  const handleOpen = async (open: boolean) => {
    setOpenModal(open);
    if (open === true && coodeshAPIAssessments.length === 0) {
      setLoading(true);
      await handleGetCoodeshAPIAssessments();
      setLoading(false);
    }
  };

  const filteredAssessments = coodeshAPIAssessments.filter((assessment) => {
    if (assessmentsSearch) {
      if (!attachedAssessments?.length) {
        return assessment.name
          .toLowerCase()
          .includes(assessmentsSearch.toLowerCase());
      } else if (attachedAssessments.length) {
        return (
          !attachedAssessments
            .map((att) => att.assessment_id)
            .includes(assessment.assessment_id) &&
          assessment.name
            .toLowerCase()
            .includes(assessmentsSearch.toLowerCase())
        );
      }
    } else {
      if (!attachedAssessments?.length) {
        return assessment;
      } else if (attachedAssessments) {
        return !attachedAssessments
          .map((att) => att.assessment_id)
          .includes(assessment.assessment_id);
      }
    }
  });

  return (
    <Sheet onOpenChange={handleOpen} open={openModal}>
      <SheetTrigger asChild>
        <Button className="px-4! w-max items-start justify-start font-semibold">
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
            <Input
              placeholder="Procurando por algo?"
              onChange={(e) => setAssessmentsSearch(e.target.value)}
              value={assessmentsSearch}
            />
          </div>
          {!loading ? (
            <ul className="p-2 h-full flex flex-col gap-4 xl:gap-6 py-2 overflow-y-auto">
              {filteredAssessments.map(
                (assessmentPayload: AssessmentPayloadType) => (
                  <li
                    key={assessmentPayload.assessment_id}
                    className="p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 justify-between">
                      <div className="flex flex-col gap-1 truncate">
                        <h2
                          className="font-semibold text-sm truncate"
                          title={assessmentPayload.name}
                        >
                          {assessmentPayload.name}
                        </h2>
                        <p className="text-xs text-gray-500 truncate">
                          {assessmentPayload.description}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          handleCreateCoodeshAssessment({
                            ...assessmentPayload,
                            classroom_id: classroom_id,
                          })
                        }
                        className="font-semibold min-w-9 min-h-9"
                        size={"icon"}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </li>
                )
              )}

              {coodeshAPIAssessments.filter(
                (p) =>
                  !(
                    attachedAssessments &&
                    attachedAssessments
                      .map((att) => att.assessment_id)
                      .includes(p.assessment_id)
                  )
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

              {filteredAssessments.filter(
                (p) =>
                  !(
                    attachedAssessments &&
                    attachedAssessments
                      .map((att) => att.assessment_id)
                      .includes(p.assessment_id)
                  )
              ).length === 0 && (
                <div className="flex flex-col gap-2 h-full items-center justify-center">
                  <h2 className="text-sm font-bold text-gray-800">
                    Não ha avaliações com esse título
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
