import { TeamsIconWithModulesChart } from "@/components/teams/teams-icon-with-modules-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TeamPage = () => {
  return (
    <div className="relative w-full h-max flex flex-col p-6 gap-10 xl:p-8">
      <header className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4 xl:gap-6">
          <h1 className="text-left font-bold text-3xl">Turmas</h1>
          <Button className="font-semibold">Nova Turma</Button>
        </div>
        <div className="w-full h-px border-b border-sidebar-accent" />
        <div className="w-full h-9 flex gap-4 border-b border-card">
          <Button variant="ghost" size="sm">
            <p className="text-primary text-sm font-semibold">Todas</p>
            <Badge variant="default">12</Badge>
          </Button>
          <div className="h-full w-px border-l border-sidebar-accent" />

          <Button variant="ghost" size="sm">
            <p className="text-sm font-semibold">Em curso</p>
            <Badge variant="outline">12</Badge>
          </Button>
          <div className="h-full w-px border-l border-sidebar-accent" />

          <Button variant="ghost" size="sm">
            <p className="text-sm font-semibold">Finalizadas</p>
            <Badge variant="outline">12</Badge>
          </Button>
        </div>
      </header>

      <ul className="w-full">
        <TeamsIconWithModulesChart />
      </ul>
    </div>
  );
};

export default TeamPage;
