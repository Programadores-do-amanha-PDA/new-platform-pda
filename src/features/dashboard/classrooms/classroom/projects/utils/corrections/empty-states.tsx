import {
  CheckCircle2,
  Clock,
  Folders,
  ListChecks,
  ListTodo,
} from "lucide-react";
import { isProjectActive, isProjectFuture } from "../projects/project-status";
import {
  ClassroomProjectCorrection,
  ClassroomProjectDelivery,
  ClassroomProject,
} from "../../types";

/**
 * Determines the appropriate empty state configuration based on project deliveries and corrections status.
 * 
 * This function analyzes the current state of project deliveries and corrections to return
 * the most relevant empty state message and icon for the UI.
 * 
 * @param allProjectDeliveries - Array of all project deliveries submitted by students
 * @param allProjectCorrections - Array of all corrections made for the project deliveries
 * @param currentProject - The current classroom project being evaluated
 * 
 * @returns An object containing:
 * - `icon`: A React component representing the visual icon for the empty state
 * - `title`: A string with the main title describing the current state
 * - `description`: A detailed string explaining the current situation and possible actions
 * 
 * @remarks
 * The function handles five distinct states:
 * 1. No deliveries and project is active or future - Shows waiting message
 * 2. Has deliveries but no corrections - Prompts to start correcting
 * 3. Has some corrections but not all - Shows progress and encourages completion
 * 4. All corrections completed - Congratulates and suggests sending emails
 * 5. Fallback - No deliveries and project period ended
 */
export const getEmptyStateConfig = (
  allProjectDeliveries: ClassroomProjectDelivery[],
  allProjectCorrections: ClassroomProjectCorrection[],
  currentProject: ClassroomProject
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
