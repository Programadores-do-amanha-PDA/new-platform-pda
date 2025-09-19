"use client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DynamicLucideIcon } from "@/components/shared/icons/dynamic-lucide-icon";
import { ClassroomT, ClassroomStatusT } from "@/types";
import { safeIconName } from "@/utils/lucide-safe";

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
      className="min-w-64 max-h-[112px]! h-max group bg-card flex flex-row gap-6 p-4 items-start justify-between rounded-xl border shadow-xs cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:shadow-md transition-shadow"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`classrooms/${classroom.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`classrooms/${classroom.id}`);
        }
      }}
      aria-label={`Acessar turma ${classroom.name} - Status: ${classroomStatusLabels[classroom.status]}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold group-hover:underline">{classroom.name}</h3>
        </div>
        <div className="flex flex-row gap-1">
          <Badge
            variant={cardBadgeVariantByStatus[classroom.status]}
            className="w-max font-semibold"
            aria-label={`Status da turma: ${classroomStatusLabels[classroom.status]}`}
          >
            {classroomStatusLabels[classroom.status]}
          </Badge>
        </div>
      </div>
      <DynamicLucideIcon
        name={safeIconName(classroom.icon)}
        className="w-6 h-6"
        aria-hidden="true"
      />
    </li>
  );
};

export default ClassroomCard;
