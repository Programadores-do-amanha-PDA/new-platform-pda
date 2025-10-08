import { ClassroomProjectT } from "../types/project";
import { ClassroomProjectDeliveryT } from "../types/delivery";
import { ClassroomProjectCorrectionT } from "../types/corrections";
import { getProjectStatus } from "./project-status";

export interface DeliveryStatusResult {
  hasDelivery: boolean;
  hasCorrection: boolean;
  delivery?: ClassroomProjectDeliveryT;
  correction?: ClassroomProjectCorrectionT;
  status:
    | "can-deliver"
    | "future"
    | "not-delivered"
    | "pending-correction"
    | "corrected";
}

/**
 * Analyzes the delivery status for a specific user and project
 * @param project - The project to analyze
 * @param userId - The user ID to check deliveries for
 * @param deliveries - All project deliveries
 * @param corrections - All project corrections
 * @returns Delivery status analysis
 */
export const analyzeDeliveryStatus = (
  project: ClassroomProjectT,
  userId: string,
  deliveries: ClassroomProjectDeliveryT[],
  corrections: ClassroomProjectCorrectionT[]
): DeliveryStatusResult => {
  const projectDeliveries = deliveries?.filter(
    (delivery) => delivery.project_id === project.id
  );

  const userDelivery = projectDeliveries?.find(
    (delivery) => delivery.user_id === userId
  );

  const userCorrection = userDelivery
    ? corrections?.find(
        (correction) => correction.delivery_id === userDelivery.id
      )
    : undefined;

  const projectStatus = getProjectStatus(project);

  // User has not delivered
  if (!userDelivery) {
    switch (projectStatus) {
      case "active":
        return {
          hasDelivery: false,
          hasCorrection: false,
          status: "can-deliver",
        };
      case "future":
        return {
          hasDelivery: false,
          hasCorrection: false,
          status: "future",
        };
      case "expired":
      case "no-schedule":
        return {
          hasDelivery: false,
          hasCorrection: false,
          status: "not-delivered",
        };
    }
  }

  // User has delivered
  if (!userCorrection) {
    return {
      hasDelivery: true,
      hasCorrection: false,
      delivery: userDelivery,
      status: "pending-correction",
    };
  }

  // User has delivery and correction
  return {
    hasDelivery: true,
    hasCorrection: true,
    delivery: userDelivery,
    correction: userCorrection,
    status: "corrected",
  };
};

/**
 * Gets project statistics for admin/teacher view
 * @param project - The project to analyze
 * @param deliveries - All project deliveries
 * @param corrections - All project corrections
 * @returns Project statistics
 */
export const getProjectStatistics = (
  project: ClassroomProjectT,
  deliveries: ClassroomProjectDeliveryT[],
  corrections: ClassroomProjectCorrectionT[]
) => {
  const projectDeliveries = deliveries?.filter(
    (delivery) => delivery.project_id === project.id
  );

  const projectCorrections = corrections?.filter(
    (correction) => correction.project_id === project.id
  );

  return {
    totalDeliveries: projectDeliveries?.length,
    totalCorrections: projectCorrections?.length,
    pendingCorrections: projectDeliveries?.length - projectCorrections?.length,
  };
};
