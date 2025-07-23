import { Moon, Sun, Sunrise } from "lucide-react";
import { ClassroomT, ClassroomStatusT } from "@/types/classrooms";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const classroomPeriodLabels = {
  morning: <Sunrise className="size-5 " />,
  afternoon: <Sun className="size-5 text-muted-foreground" />,
  evening: <Moon className="size-5 text-muted-foreground" />,
};

const cardBadgeVariantByStatus: Record<
  ClassroomStatusT,
  "outline" | "default" | "secondary" | "destructive"
> = {
  created: "outline",
  active: "default",
  finished: "secondary",
};

const ClassroomCard = ({
  classroom,
  classroomStatusLabels,
}: {
  classroom: ClassroomT;
  classroomStatusLabels: { [key: string]: string };
}) => {
  const router = useRouter();
  return (
    <li
      className="min-w-64 max-h-[112px]! h-max group bg-card flex flex-row gap-6 p-4 items-start justify-between rounded-xl border shadow-xs cursor-pointer"
      onClick={() => router.push(`classrooms/${classroom.id}`)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-bold group-hover:underline">{classroom.name}</p>
        </div>
        <div className="flex flex-row gap-1">
          <p className="text-sm text-muted-foreground">Status:</p>
          <Badge
            variant={cardBadgeVariantByStatus[classroom.status]}
            className="w-max font-semibold"
          >
            {classroomStatusLabels[classroom.status]}
          </Badge>
        </div>
      </div>
      {classroom.period && classroomPeriodLabels[classroom.period]}
    </li>
  );
};

export default ClassroomCard;
