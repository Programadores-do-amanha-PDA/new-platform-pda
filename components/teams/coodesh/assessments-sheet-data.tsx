"use client";

import { useState } from "react";

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
import { AssessmentType } from "@/types/assessments";
import { Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";

const AssessmentsSheetData = ({
  handleAttachAssessment,
  attachedAssessments,
  teamId,
}: {
  teamId: string;
  handleAttachAssessment: (
    teamId: string,
    assessmentId: string
  ) => Promise<boolean>;
  attachedAssessments?: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [assessments, setAssessments] = useState<AssessmentType[]>([]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (true) {
      setAssessments([
        {
          offset: 0,
          total: 1,
          limit: 150,
          payload: [
            {
              assessment_id: "6707e51d867d313ecdd5f456",
              name: "AT - Integração",
              description: "Teste integração ATT",
              default_locale: "pt",
              duration: 5,
              duration_unit: "hour",
              questions: [
                {
                  name: "Teste básico de lógica",
                  description: "Crie uma classe que possa os métodos abaixo...",
                  type: "freecoding",
                  type_formatted: "Programação livre",
                  level: "beginner",
                  level_formatted: "Iniciante",
                  duration: 30,
                  duration_unit: "minute",
                },
                {
                  name: "Infraestrutura Multiusuários e Multitenant",
                  description:
                    "Solicitar ao candidato que desenhe e explique uma arquitetura...",
                  type: "whiteboard",
                  type_formatted: "Quadro branco",
                  level: "advanced",
                  level_formatted: "Avançado",
                  duration: 5,
                  duration_unit: "hour",
                },
              ],
            },
          ],
        },
      ]);
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={isOpen}>
      <SheetTrigger asChild>
        <Button className="!px-4 w-max items-start justify-start font-semibold">
          Anexar Teste
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Anexar Teste</SheetTitle>
          <SheetDescription>
            Anexe abaixo os testes da Coodesh que fazem parte desta turma
          </SheetDescription>
        </SheetHeader>
        <main className="h-full flex flex-col gap-4 xl:gap-6 py-2">
          <div>
            <Input placeholder="Procurando por algo?" />
          </div>
          <ul className="p-2 h-full">
            {assessments.map((assessment) =>
              assessment.payload
                .filter(
                  (p) =>
                    !(
                      attachedAssessments &&
                      attachedAssessments.includes(p.assessment_id)
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
                          handleAttachAssessment(
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
                      attachedAssessments.includes(p.assessment_id)
                    )
                ).length > 0
            ).length === 0 && (
              <div className="flex flex-col gap-2 h-full items-center justify-center">
                <h2 className="text-sm font-bold text-gray-800">
                  Não ha testes disponíveis
                </h2>
                <i className="text-xs text-muted-foreground px-2 text-center">
                  (Testes que ja estão anexados a esta turma não aparecem aqui.)
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
