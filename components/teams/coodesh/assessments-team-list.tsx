"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";
import AssessmentsTeamListCard from "./assessments-team-list-card";

const AssessmentsTeamList = ({ teamId }: { teamId: string }) => {
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
        <AssessmentsTeamListCard
          key={assessment.assessment_id}
          assessment={assessment}
        />
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
