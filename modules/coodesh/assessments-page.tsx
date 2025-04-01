"use client";
import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import AssessmentsSheetData from "@/components/classrooms/coodesh/assessments-sheet-data";
import { useAdminStackContext } from "@/context/admin/stack-context";
import AssessmentsClassroomListCard from "@/components/classrooms/coodesh/assessments-classroom-list-card";

const AssessmentsPage = ({ classroom_id }: { classroom_id: string }) => {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const {
    classroomsStack: {
      classrooms,
      coodesh: { handleUpdateCoodeshAssessment },
    },
  } = useAdminStackContext();

  const attachedAssessments = classrooms.find(
    (team) => team.id === classroom_id
  )?.classroom_coodesh_assessments;

  const filteredAssessments = attachedAssessments?.filter((assessment) =>
    assessment.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="relative w-full h-max py-4 flex flex-col gap-6 overflow-hidden">
      <header className="w-full flex items-center justify-between flex-wrap p-4 gap-4">
        <div className="w-full max-w-xs min-w-72 flex gap-2 items-center shadow-sm rounded-md border px-2">
          <Input
            id="search"
            type="text"
            placeholder="Buscando algo?"
            className="max-w-xs !border-none !ring-0 shadow-none !rounded-none"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <Label htmlFor="search">
            <Search className="size-5 text-primary-foreground" />
          </Label>
        </div>
        <AssessmentsSheetData classroom_id={classroom_id} />
      </header>

        <ul className="p-2 py-4 h-full w-full flex flex-col sm:flex-row sm:flex-wrap gap-4 overflow-y-auto pr-4">
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
                handleUpdateCoodeshAssessment={handleUpdateCoodeshAssessment}
              />
            ))}

          {attachedAssessments?.length === 0 && (
            <div className="flex flex-col gap-2 h-full w-full bg-red-100 items-center justify-center">
              <h2 className="text-sm font-bold text-gray-800">
                Não ha avaliações anexadas para essa turma.
              </h2>
              <i className="text-xs text-muted-foreground px-2 text-center">
                (Assim que você anexar avaliações, elas aparecerão aqui.)
              </i>
            </div>
          )}
        </ul>
    </div>
  );
};

export default AssessmentsPage;
