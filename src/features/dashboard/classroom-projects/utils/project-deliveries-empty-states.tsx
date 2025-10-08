import {
  CheckCircle2,
  Clock,
  Folders,
  ListChecks,
  ListTodo,
} from "lucide-react";
import { isProjectActive, isProjectFuture } from "./project-status";
import {
  ClassroomProjectCorrectionT,
  ClassroomProjectDeliveryT,
  ClassroomProjectT,
} from "../types";

// Determine the current state for empty state display
export const getEmptyStateConfig = (
  allProjectDeliveries: ClassroomProjectDeliveryT[],
  allProjectCorrections: ClassroomProjectCorrectionT[],
  currentProject: ClassroomProjectT
) => {
  const hasDeliveries = allProjectDeliveries?.length > 0;
  const hasCorrections = allProjectCorrections?.length > 0;
  const allCorrected =
    hasDeliveries &&
    allProjectCorrections?.length === allProjectDeliveries?.length;
  const isProjectStillActive = currentProject
    ? isProjectActive(currentProject)
    : false;
  const isProjectInFuture = currentProject
    ? isProjectFuture(currentProject)
    : false;

  // State 1: No deliveries and project is still within delivery period or in future
  if (!hasDeliveries && (isProjectStillActive || isProjectInFuture)) {
    return {
      icon: <Clock />,
      title: "Aguardando entregas",
      description: isProjectInFuture
        ? "O projeto ainda não iniciou o período de entregas"
        : "O projeto está no período de entregas, aguardando submissões dos alunos",
    };
  }

  // State 2: Has deliveries but no corrections
  if (hasDeliveries && !hasCorrections) {
    return {
      icon: <Folders />,
      title: "Entregas aguardando correção",
      description:
        "Há entregas disponíveis para correção. Selecione uma entrega para começar",
    };
  }

  // State 3: Has some corrections (ready to send emails)
  if (hasCorrections && !allCorrected) {
    return {
      icon: <ListTodo />,
      title: "Correções em andamento",
      description: `Foram feitas ${allProjectCorrections?.length} correções de ${allProjectDeliveries?.length} entregas. Finalize as correções ou envie o feedback das correções ja feitas por email!`,
    };
  }

  // State 4: All corrections completed
  if (allCorrected) {
    return {
      icon: <CheckCircle2 />,
      title: "Todas as entregas foram corrigidas",
      description:
        "Parabéns! Todas as entregas foram corrigidas. Você pode enviar as correções por email",
    };
  }

  // Fallback: No deliveries and project period ended
  return {
    icon: <ListChecks />,
    title: "Nenhuma entrega encontrada",
    description: "Não há entregas para serem corrigidas neste projeto",
  };
};
