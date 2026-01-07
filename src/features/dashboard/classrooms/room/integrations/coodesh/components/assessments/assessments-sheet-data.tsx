"use client";
import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoodeshAssessmentStore } from "../../stores/assessments";
import { useCoodeshAPIAssessmentStore } from "../../stores/api";
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
import { CoodeshAssessmentPayload } from "../../types";

const AssessmentsSheetData = ({ classroom_id }: { classroom_id: string }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [assessmentsSearch, setAssessmentsSearch] = useState<string>("");

  const { apiAssessments, getApiAssessments } = useCoodeshAPIAssessmentStore();
  const { assessments, createAssessment } = useCoodeshAssessmentStore();

  const handleOpen = async (open: boolean) => {
    setOpenModal(open);
    if (open === true && apiAssessments.length === 0) {
      setLoading(true);
      await getApiAssessments();
      setLoading(false);
    }
  };

  const filteredAssessments = apiAssessments.filter((assessment) => {
    if (assessmentsSearch) {
      if (!assessments?.length) {
        return assessment.name
          .toLowerCase()
          .includes(assessmentsSearch.toLowerCase());
      } else if (assessments.length) {
        return (
          !assessments
            .map((att) => att.assessment_id)
            .includes(assessment.assessment_id) &&
          assessment.name
            .toLowerCase()
            .includes(assessmentsSearch.toLowerCase())
        );
      }
    } else {
      if (!assessments?.length) {
        return assessment;
      } else if (assessments) {
        return !assessments
          .map((att) => att.assessment_id)
          .includes(assessment.assessment_id);
      }
    }
  });

  return (
    <Sheet onOpenChange={handleOpen} open={openModal}>
      <SheetTrigger asChild>
        <Button className="justify-start items-start px-4! w-max font-semibold">
          Anexar Avaliação
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Anexar Avaliação</SheetTitle>
          <SheetDescription>
            Anexe abaixo as avaliações da Coodesh que fazem parte desta turma
          </SheetDescription>
        </SheetHeader>
        <main className="flex flex-col gap-4 xl:gap-6 p-2 h-full overflow-hidden">
          <div>
            <Input
              placeholder="Procurando por algo?"
              onChange={(e) => setAssessmentsSearch(e.target.value)}
              value={assessmentsSearch}
            />
          </div>
          {!loading ? (
            <ul className="flex flex-col gap-4 xl:gap-6 p-2 py-2 h-full overflow-y-auto">
              {filteredAssessments.map(
                (assessmentPayload: CoodeshAssessmentPayload) => (
                  <li
                    key={assessmentPayload.assessment_id}
                    className="p-2 border rounded-lg w-full h-max"
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <h2
                          className="w-full font-semibold text-sm"
                          title={assessmentPayload.name}
                        >
                          {assessmentPayload.name}
                        </h2>
                        {assessmentPayload.description.length > 0 && (
                          <p className="text-xs">
                            {assessmentPayload.description}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() =>
                          createAssessment({
                            ...assessmentPayload,
                            classroom_id: classroom_id,
                          })
                        }
                        className="min-w-9 min-h-9 font-semibold"
                        size={"icon"}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </li>
                )
              )}

              {apiAssessments.filter(
                (p) =>
                  !(
                    assessments &&
                    assessments
                      .map((att) => att.assessment_id)
                      .includes(p.assessment_id)
                  )
              ).length === 0 && (
                <div className="flex flex-col justify-center items-center gap-2 h-full">
                  <h2 className="font-bold text-gray-800 text-sm">
                    Não ha avaliações disponíveis
                  </h2>
                  <i className="px-2 text-muted-foreground text-xs text-center">
                    (Avaliações que ja estão anexadas a esta turma não aparecem
                    aqui.)
                  </i>
                </div>
              )}

              {filteredAssessments.filter(
                (p) =>
                  !(
                    assessments &&
                    assessments
                      .map((att) => att.assessment_id)
                      .includes(p.assessment_id)
                  )
              ).length === 0 && (
                <div className="flex flex-col justify-center items-center gap-2 h-full">
                  <h2 className="font-bold text-gray-800 text-sm">
                    Não ha avaliações com esse título
                  </h2>
                  <i className="px-2 text-muted-foreground text-xs text-center">
                    (Avaliações que ja estão anexadas a esta turma não aparecem
                    aqui.)
                  </i>
                </div>
              )}
            </ul>
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <LoaderCircle className="stroke-primary size-6 animate-spin" />
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
