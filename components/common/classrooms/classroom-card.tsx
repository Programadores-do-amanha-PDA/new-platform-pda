import { Book } from "lucide-react";
import { Badge } from "../../ui/badge";
import { ClassroomType, ClassroomTypeStatus } from "@/types/classrooms";
import { useRouter } from "next/navigation";

const classroomPeriodLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const cardBadgeVariantByStatus: Record<
  ClassroomTypeStatus,
  "outline-solid" | "default" | "secondary" | "destructive"
> = {
  created: "outline-solid",
  active: "default",
  finished: "secondary",
};

const ClassroomCard = ({
  classroom,
  classroomStatusLabels,
}: {
  classroom: ClassroomType;
  classroomStatusLabels: { [key: string]: string };
}) => {
  const router = useRouter();
  return (
    <li
      className="min-w-64 h-[112px]! group bg-card flex flex-row gap-6 p-4 items-start rounded-xl border shadow-xs cursor-pointer"
      onClick={() => router.push(`classrooms/${classroom.id}`)}
    >
      <div className="mt-1">
        <Book />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-bold group-hover:underline">{classroom.name}</p>
              <p className="text-xs text-gray-600">
                {classroomPeriodLabels[classroom.period]}
              </p>
            </div>
            <Badge
              variant={cardBadgeVariantByStatus[classroom.status]}
              className="w-max"
            >
              {classroomStatusLabels[classroom.status]}
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

export default ClassroomCard;
