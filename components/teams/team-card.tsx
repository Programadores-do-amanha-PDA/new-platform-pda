import { Book } from "lucide-react";
import { Badge } from "../ui/badge";
import { TeamType, TeamTypeStatus } from "@/types/teams";
import { useRouter } from "next/navigation";

const teamPeriodLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const cardBadgeVariantByStatus: Record<
  TeamTypeStatus,
  "outline" | "default" | "secondary" | "destructive"
> = {
  created: "outline",
  active: "default",
  finished: "secondary",
};

const TeamCard = ({
  team,
  teamStatusLabels,
}: {
  team: TeamType;
  teamStatusLabels: { [key: string]: string };
}) => {
  const router = useRouter();
  return (
    <li
      className="group bg-card flex flex-row gap-6 max-w-xs p-4 items-start rounded-xl border shadow-sm cursor-pointer"
      onClick={() => router.push(`teams/${team.id}`)}
    >
      <div className="mt-1">
        <Book />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-bold group-hover:underline">{team.name}</p>
              <p className="text-xs text-gray-600">
                {teamPeriodLabels[team.period]}
              </p>
            </div>
            <Badge
              variant={cardBadgeVariantByStatus[team.status]}
              className="w-max"
            >
              {teamStatusLabels[team.status]}
            </Badge>
          </div>
          {/* <div className="gap-1">
            <p className="text-xs text-gray-600">36 alunos ativos</p>
            <p className="text-xs text-gray-600">5 notificações</p>
          </div> */}
        </div>
      </div>
    </li>
  );
};

export default TeamCard;
