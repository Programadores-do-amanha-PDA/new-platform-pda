"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";
import AssessmentsClassroomListCard from "./assessments-classroom-list-card";

const AssessmentsClassroomList = ({ classroom_id }: { classroom_id: string }) => {
  const {
    classroomsStack: {
      classrooms,
      coodesh: { handleUpdateCoodeshAssessment },
    },
  } = useAdminStackContext();

  const attachedAssessments = classrooms.find(
    (team) => team.id === classroom_id
  )?.classroom_coodesh_assessments;

  return (
    <ul className="p-2 py-4 h-full w-full flex flex-col md:flex-row md:flex-wrap gap-4 xl:gap-6">
      {attachedAssessments
        ?.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
  );
};
export default AssessmentsClassroomList;
