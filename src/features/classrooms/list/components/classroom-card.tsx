"use client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DynamicLucideIcon } from "@/components/shared/icons/dynamic-lucide-icon";
import { safeIconName } from "@/utils/lucide-safe";
import { ClassroomStatusT, Classroom } from "../../types";

const cardBadgeVariantByStatus: Record<ClassroomStatusT, "outline" | "default" | "secondary" | "destructive"> = {
    created: "outline",
    active: "default",
    finished: "secondary",
};

const ClassroomCard = ({
    classroom,
    classroomStatusLabels,
}: {
    classroom: Classroom;
    classroomStatusLabels: { [key: string]: string };
}) => {
    const router = useRouter();
    return (
        <button
            className="min-w-64 max-h-[112px]! h-max group bg-card flex flex-row gap-6 p-4 items-start justify-between rounded-xl border shadow-xs cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:shadow-md transition-shadow"
            onClick={() => router.push(`/dashboard/classrooms/${classroom.id}`)}
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
            <DynamicLucideIcon name={safeIconName(classroom.icon)} className="w-6 h-6" aria-hidden="true" />
        </button>
    );
};

export default ClassroomCard;
