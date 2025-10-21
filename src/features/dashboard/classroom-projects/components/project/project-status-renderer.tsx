"use client";

// Global imports
import React from "react";
import useAuth from "@/hooks/use-auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemActions } from "@/components/ui/item";

// Local imports
import { ProjectStatusRendererPropsT } from "../../types";
import { analyzeDeliveryStatus } from "../../utils";

/**
 * Renders the appropriate project status UI based on delivery status
 */
export const ProjectStatusRenderer: React.FC<ProjectStatusRendererPropsT> = ({
  project,
  classroomId,
  classroomDeliveries,
  classroomCorrections,
  onOpenDeliveryModal,
}) => {
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
        <ItemActions className="flex">
          <div className="flex flex-col items-end gap-4 rounded-xl">
            <Button
              variant="default"
              onClick={() => onOpenDeliveryModal?.(null)}
              aria-label={`Entregar projeto ${project.title}`}
              className="font-semibold"
            >
              Entregar projeto
            </Button>
          </div>
        </ItemActions>
      );

    case "delivered-editable":
      return (
        <div className="flex flex-col items-start gap-4 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col gap-2">
            <p
              className="text-sm font-semibold text-blue-700 dark:text-blue-300"
              role="status"
              aria-live="polite"
            >
              Projeto entregue
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Você ainda pode editar sua entrega enquanto estiver no prazo
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenDeliveryModal?.(deliveryStatus.delivery || null)
            }
            aria-label={`Editar entrega do projeto ${project.title}`}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/30 font-semibold"
          >
            Editar entrega
          </Button>
        </div>
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
            onClick={() => onOpenDeliveryModal?.(null)}
            aria-label={`Entregar recuperação do projeto ${project.title}`}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30 font-bold"
          >
            Realizar entrega de recuperação
          </Button>
        </div>
      );

    case "recovery-delivered-editable":
      return (
        <div className="flex flex-col items-start gap-4 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex flex-col gap-2">
            <p
              className="text-sm font-semibold text-amber-700 dark:text-amber-300"
              role="status"
              aria-live="polite"
            >
              Recuperação entregue
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Você ainda pode editar sua entrega de recuperação enquanto estiver
              no prazo
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenDeliveryModal?.(deliveryStatus.delivery || null)
            }
            aria-label={`Editar entrega de recuperação do projeto ${project.title}`}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30 font-semibold"
          >
            Editar entrega de recuperação
          </Button>
        </div>
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
