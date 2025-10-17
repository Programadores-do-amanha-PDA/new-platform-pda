"use client";

// Global imports
import React from "react";
import Link from "next/link";
import { FileClock } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Local imports
import { ProjectStatusRendererPropsT } from "../../types";
import { Separator } from "@/components/ui/separator";
import { analyzeDeliveryStatus, formatDateRangePeriod} from "../../utils";
import useAuth from "@/hooks/use-auth";

/**
 * Renders the appropriate project status UI based on delivery status
 */
export const ProjectStatusRenderer: React.FC<ProjectStatusRendererPropsT> = ({
  project,
  classroomId,
  classroomDeliveries,
  classroomCorrections,
}) => {
  const PROJECTS_PAGES_PATH = `/dashboard/classrooms/${classroomId}/projects`;
  const { user } = useAuth();

  if (!user?.id || !classroomId) return null;

  const deliveryStatus = analyzeDeliveryStatus(
    project,
    user.id,
    classroomDeliveries,
    classroomCorrections
  );

  switch (deliveryStatus.status) {
    case "can-deliver":
      return (
        <>
          <Separator />
          <div className="w-full flex flex-col gap-2">
            <p
              className="text-sm font-semibold"
              id={`delivery-period-${project.id}`}
            >
              Período de entrega:
            </p>
            <Badge
              variant="outline"
              className="text-xs gap-2 h-8"
              aria-labelledby={`delivery-period-${project.id}`}
            >
              <FileClock aria-hidden="true" className="size-4!" />
              {formatDateRangePeriod(project.schedule_date)}
            </Badge>
          </div>
          <div className="flex flex-col items-end gap-4 rounded-xl">
            <Button variant="link" asChild>
              <Link
                href={`${PROJECTS_PAGES_PATH}/${project.id}/delivery`}
                aria-label={`Entregar projeto ${project.title}`}
              >
                Entregar projeto
              </Link>
            </Button>
          </div>
        </>
      );

    case "future":
      return (
        <div className="flex flex-col items-center gap-4">
          <p
            className="text-sm font-semibold text-primary-foreground"
            role="status"
            aria-live="polite"
          >
            Entrega disponível em breve
          </p>
        </div>
      );

    case "not-delivered":
      return (
        <div className="flex flex-col items-center gap-4">
          <p
            className="text-sm font-semibold text-destructive"
            role="status"
            aria-live="polite"
          >
            Não entregue
          </p>
        </div>
      );

    case "pending-correction":
      return (
        <div className="flex flex-col items-center gap-4">
          <p
            className="text-sm font-semibold text-primary-foreground"
            role="status"
            aria-live="polite"
          >
            Correção pendente
          </p>
        </div>
      );

    case "can-recover":
      return (
        <>
          <Separator orientation="vertical" />
          <div className="w-full flex flex-col gap-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Período de recuperação:
            </p>
            <Badge
              variant="outline"
              className="text-xs bg-background border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 gap-2 h-8"
              aria-labelledby={`recovery-period-${project.id}`}
            >
              <FileClock aria-hidden="true" className="size-3!" />
              {formatDateRangePeriod(project.recovery_schedule)}
            </Badge>
          </div>
          <div className="flex flex-col items-start gap-4 p-4 rounded-xl border border-amber-400 dark:border-amber-800">
            <div className="flex flex-col gap-2">
              <p
                className="text-sm font-semibold text-amber-700 dark:text-amber-300"
                role="status"
                aria-live="polite"
              >
                Recuperação disponível
              </p>
              <Badge
                variant="secondary"
                className="w-fit"
                aria-label={`Nota atual: ${
                  deliveryStatus.correction?.final_note || "Não informada"
                }`}
              >
                Nota atual: {deliveryStatus.correction?.final_note || "N/A"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              aria-label={`Entregar recuperação do projeto ${project.title}`}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30 font-bold"
              asChild
            >
              <Button variant="link" asChild>
                <Link
                  href={`${PROJECTS_PAGES_PATH}/${project.id}/delivery`}
                  aria-label={`Entregar projeto ${project.title}`}
                >
                  Realizar entrega de recuperação
                </Link>
              </Button>
            </Button>
          </div>
        </>
      );

    case "recovery-delivered":
      return (
        <div className="flex flex-col items-start gap-4 dark:bg-blue-950/20 p-4 rounded-xl border border-amber-500 dark:border-amber-800">
          <div className="flex flex-col gap-2">
            <Badge
              variant="secondary"
              className="w-fit"
              aria-label={`Nota anterior: ${
                deliveryStatus.originalCorrection?.final_note || "Não informada"
              }`}
            >
              Nota anterior:{" "}
              {deliveryStatus.originalCorrection?.final_note || "N/A"}
            </Badge>
            <p
              className="text-sm font-semibold text-amber-700 dark:text-amber-300"
              role="status"
              aria-live="polite"
            >
              Recuperação entregue
            </p>
          </div>
        </div>
      );

    case "corrected":
      return (
        <div className="flex flex-col items-start gap-4 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex flex-col gap-2">
            <p
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
              role="status"
              aria-live="polite"
            >
              Projeto corrigido
            </p>
            <Badge
              variant="secondary"
              className="w-fit"
              aria-label={`Nota final: ${
                deliveryStatus.correction?.final_note || "Não informada"
              }`}
            >
              Nota: {deliveryStatus.correction?.final_note || "N/A"}
            </Badge>
          </div>
        </div>
      );

    default:
      return null;
  }
};
