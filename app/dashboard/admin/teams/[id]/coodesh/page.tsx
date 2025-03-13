"use server";
import AssessmentsSheetData from "@/components/teams/coodesh/assessments-sheet-data";
import AssessmentsTeamList from "@/components/teams/coodesh/assessments-team-list";

import { AssessmentType } from "@/types/assessments";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; assessments: AssessmentType[] }>;
}) {
  const { id } = await params;
  const assessments: AssessmentType[] = [
    {
      offset: 0,
      total: 1,
      limit: 150,
      payload: [
        {
          assessment_id: "6807e51d867d313ecdd5f456",
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
  ];

  return (
    <div className="relative w-full h-max flex flex-col p-6 gap-10 xl:p-8">
      <header className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4 xl:gap-6">
          <h1 className="text-left font-bold text-3xl">Coodesh</h1>
          <AssessmentsSheetData teamId={id} assessments={assessments} />
        </div>
      </header>

      <main>
        <AssessmentsTeamList teamId={id} assessments={assessments} />
      </main>
    </div>
  );
}
