"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";

import AssessmentsClassroomListCard from "../components/assessments-classroom-list-card";
import AssessmentsSheetData from "../components/assessments-sheet-data";
import { useCoodeshAssessmentStore } from "../stores/assessments";

export default function AssessmentsPage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { assessments } = useCoodeshAssessmentStore();

  const filteredAssessments = assessments?.filter((assessment) =>
    assessment.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="relative w-full h-full p-4 flex flex-col gap-6 overflow-hidden">
      <header className="w-full flex items-center justify-between flex-wrap p-2 gap-4">
        <Input
          id="search"
          type="text"
          placeholder="Buscando algo?"
          className="max-w-xs"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />

        <AssessmentsSheetData classroom_id={classroom_id} />
      </header>

      {assessments && assessments.length > 0 ? (
        <ul className="p-2 h-max w-full flex flex-col sm:flex-row sm:flex-wrap gap-4 overflow-y-auto pr-4">
          {filteredAssessments
            ?.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((assessment) => (
              <AssessmentsClassroomListCard
                key={assessment.assessment_id}
                assessment={assessment}
                expansive={true}
              />
            ))}
        </ul>
      ) : (
        <div className="w-full h-full flex flex-col gap-2 bg-primary/5 rounded-lg items-center justify-center">
          <h2 className="font-bold text-xl text-foreground">
            Não ha avaliações anexadas para essa turma.
          </h2>
          <i className="text-sm text-muted-foreground px-2 text-center">
            (Assim que você anexar avaliações, elas aparecerão aqui.)
          </i>
        </div>
      )}
    </div>
  );
}
