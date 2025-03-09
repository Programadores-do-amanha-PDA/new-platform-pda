"use client";
import TeamCard from "@/components/teams/team-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { TeamTypeStatus } from "@/types/teams";
import { useState } from "react";

const teamStatusLabels = {
  created: "Criado",
  active: "Em curso",
  finished: "Finalizado",
};

const TeamPage = () => {
  const [statusFilter, setStatusFilter] = useState<TeamTypeStatus | "all">(
    "all"
  );
  const {
    teamsStack: { teams },
  } = useAdminStackContext();

  const filteredTeams =
    statusFilter === "all"
      ? teams
      : teams.filter((t) => t.status === statusFilter);

  return (
    <div className="relative w-full h-max flex flex-col p-6 gap-10 xl:p-8">
      <header className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4 xl:gap-6">
          <h1 className="text-left font-bold text-3xl">Turmas</h1>
          <Button className="font-semibold">Nova Turma</Button>
        </div>
        <div className="w-full h-px border-b border-sidebar-accent" />
        <div className="w-full h-9 flex gap-4 border-b border-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            <p
              className={`text-sm font-semibold ${
                statusFilter === "all" && "text-primary"
              }`}
            >
              Todas
            </p>
            <Badge variant={statusFilter === "all" ? "default" : "outline"}>
              {teams.length}
            </Badge>
          </Button>
          <div className="h-full w-px border-l border-sidebar-accent" />

          {teams.length > 0 &&
            teams
              .map((t) => t.status)
              .map((teamStatus, i) => (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter(teamStatus)}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        statusFilter === teamStatus && "text-primary"
                      }`}
                    >
                      {teamStatusLabels[teamStatus]}
                    </p>
                    <Badge
                      variant={
                        statusFilter === teamStatus ? "default" : "outline"
                      }
                    >
                      {teams.filter((t) => t.status === teamStatus).length}
                    </Badge>
                  </Button>
                  {i < teams.length - 1 && (
                    <div className="h-full w-px border-l border-sidebar-accent" />
                  )}
                </>
              ))}
        </div>
      </header>

      <ul className="w-full">
        {filteredTeams.length === 0 && (
          <p className="text-center text-lg font-semibold">
            Nenhuma turma encontrada
          </p>
        )}

        {filteredTeams.map((team, i) => (
          <TeamCard key={i} team={team} teamStatusLabels={teamStatusLabels} />
        ))}
      </ul>
    </div>
  );
};

export default TeamPage;
