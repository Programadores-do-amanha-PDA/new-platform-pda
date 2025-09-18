"use client";

// Global imports
import React from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Local imports
import { DeliveryStatusResult } from "../utils/project-delivery-status";

export interface ProjectStatusRendererProps {
  /** The delivery status analysis result */
  deliveryStatus: DeliveryStatusResult;
  /** The project title for accessibility labels */
  projectTitle: string;
  /** Function to open the delivery modal */
  onOpenDeliveryModal: () => void;
}

/**
 * Renders the appropriate project status UI based on delivery status
 */
export const ProjectStatusRenderer: React.FC<ProjectStatusRendererProps> = ({
  deliveryStatus,
  projectTitle,
  onOpenDeliveryModal,
}) => {
  switch (deliveryStatus.status) {
    case 'can-deliver':
      return (
        <div className="flex flex-col items-end gap-4 rounded-xl">
          <Button 
            onClick={onOpenDeliveryModal}
            aria-label={`Entregar projeto ${projectTitle}`}
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Entregar projeto
          </Button>
        </div>
      );
    
    case 'future':
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
    
    case 'not-delivered':
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
    
    case 'pending-correction':
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
    
    case 'corrected':
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
              aria-label={`Nota final: ${deliveryStatus.correction?.final_note || "Não informada"}`}
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