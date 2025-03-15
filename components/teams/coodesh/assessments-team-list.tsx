"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

const AssessmentsTeamList = ({
  teamId,
}: {
  teamId: string;
}) => {
  const {
    teamsStack: {
      teams,
      coodesh: {},
    },
  } = useAdminStackContext();

  const attachedAssessments = teams.find(
    (team) => team.id === teamId
  )?.team_coodesh_assessments;

  return (
    <ul className="p-2 h-full flex flex-col gap-4 xl:gap-6 py-2">
      {attachedAssessments?.map((assessment) => (
        <li key={assessment.assessment_id} className="p-2 border rounded-lg">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex flex-col gap-1 truncate">
              <h2 className="font-semibold text-sm truncate">
                {assessment.name}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {assessment.description}
              </p>
            </div>
          </div>
        </li>
      ))}

      {attachedAssessments?.length === 0 && (
        <div className="flex flex-col gap-2 h-full items-center justify-center">
          <h2 className="text-sm font-bold text-gray-800">
            Não ha avaliações anexadas para essa turma.
          </h2>
          <i className="text-xs text-muted-foreground px-2 text-center">
            (Assim que você adicionar avaliações, elas aparecerão aqui.)
          </i>
        </div>
      )}
    </ul>
  );
};
export default AssessmentsTeamList;
