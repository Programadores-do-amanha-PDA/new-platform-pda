import { getProjectStatus } from "..";
import {
  ClassProjectCorrection,
  ClassroomProjectDelivery,
  ClassroomProject,
  DeliveryStatusResultT,
} from "../../types";

/**
 * Checks if recovery delivery is available for a user
 * @param project - The project to check
 * @param correction - The user's correction (if any)
 * @returns True if recovery is available, false otherwise
 */
export const isRecoveryAvailable = (
  project: ClassroomProject,
  correction?: ClassProjectCorrection
): boolean => {
  // Recovery is only available if:
  // 1. User has a correction with final_note
  // 2. final_note is <= cut_off_grade
  // 3. Current date is within recovery_schedule period

  if (!correction?.final_note || !project.recovery_schedule) {
    return false;
  }

  // Check if final note is below or equal to cut-off grade
  if (Number(correction.final_note) > project.cut_off_grade) {
    return false;
  }

  // Check if current date is within recovery schedule
  const now = new Date();
  const recoveryStart = project.recovery_schedule.from;
  const recoveryEnd = project.recovery_schedule.to;

  if (!recoveryStart || !recoveryEnd) {
    return false;
  }

  // Convert string dates to Date objects if needed
  const startDate =
    recoveryStart instanceof Date ? recoveryStart : new Date(recoveryStart);
  const endDate =
    recoveryEnd instanceof Date ? recoveryEnd : new Date(recoveryEnd);

  return now >= startDate && now <= endDate;
};

/**
 * Checks if a delivery was made during the recovery period
 * @param project - The project to check
 * @param delivery - The delivery to check
 * @returns True if delivery was made during recovery period, false otherwise
 */
export const isDeliveryDuringRecovery = (
  project: ClassroomProject,
  delivery: ClassroomProjectDelivery
): boolean => {
  if (!project.recovery_schedule) {
    return false;
  }

  const recoveryStart = project.recovery_schedule.from;
  const recoveryEnd = project.recovery_schedule.to;

  if (!recoveryStart || !recoveryEnd) {
    return false;
  }

  // Convert string dates to Date objects if needed
  const startDate =
    recoveryStart instanceof Date ? recoveryStart : new Date(recoveryStart);
  const endDate =
    recoveryEnd instanceof Date ? recoveryEnd : new Date(recoveryEnd);
  const deliveryDate = new Date(delivery.created_at);

  return deliveryDate >= startDate && deliveryDate <= endDate;
};

/**
 * Checks if recovery period has ended
 * @param project - The project to check
 * @returns True if recovery period has ended, false otherwise
 */
export const isRecoveryPeriodEnded = (project: ClassroomProject): boolean => {
  if (!project.recovery_schedule) {
    return true; // No recovery schedule means recovery is not available
  }

  const recoveryEnd = project.recovery_schedule.to;
  if (!recoveryEnd) {
    return true;
  }

  const now = new Date();
  const endDate =
    recoveryEnd instanceof Date ? recoveryEnd : new Date(recoveryEnd);

  return now > endDate;
};

/**
 * Analyzes the delivery status for a specific user and project
 * @param project - The project to analyze
 * @param userId - The user ID to check deliveries for
 * @param deliveries - All project deliveries
 * @param corrections - All project corrections
 * @returns Delivery status analysis
 */
export const analyzeDeliveryStatus = (
  project: ClassroomProject,
  userId: string,
  deliveries: ClassroomProjectDelivery[],
  corrections: ClassProjectCorrection[]
): DeliveryStatusResultT => {
  const projectDeliveries = deliveries?.filter(
    (delivery) => delivery.project_id === project.id
  );

  // Get all user deliveries for this project, sorted by creation date
  const userDeliveries = projectDeliveries
    ?.filter((delivery) => delivery.user_id === userId)
    ?.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const projectStatus = getProjectStatus(project);

  // User has not delivered
  if (!userDeliveries || userDeliveries.length === 0) {
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

  // Separate original and recovery deliveries
  const originalDelivery = userDeliveries.find(
    (delivery) => !isDeliveryDuringRecovery(project, delivery)
  );
  const recoveryDelivery = userDeliveries.find((delivery) =>
    isDeliveryDuringRecovery(project, delivery)
  );

  // Get the most recent delivery (could be original or recovery)
  const latestDelivery = userDeliveries[userDeliveries.length - 1];

  // Get corrections for both deliveries
  const originalCorrection = originalDelivery
    ? corrections?.find(
        (correction) => correction.delivery_id === originalDelivery.id
      )
    : undefined;

  const recoveryCorrection = recoveryDelivery
    ? corrections?.find(
        (correction) => correction.delivery_id === recoveryDelivery.id
      )
    : undefined;

  // If user has a recovery delivery, prioritize that status
  if (recoveryDelivery) {
    // Check if recovery delivery can still be edited (no correction yet and still within recovery period)
    if (!recoveryCorrection && isRecoveryAvailable(project, originalCorrection)) {
      return {
        hasDelivery: true,
        hasCorrection: false,
        delivery: recoveryDelivery,
        originalCorrection: originalCorrection, // Include original correction for "previous grade"
        status: "recovery-delivered-editable",
      };
    }

    return {
      hasDelivery: true,
      hasCorrection: !!recoveryCorrection,
      delivery: recoveryDelivery,
      correction: recoveryCorrection,
      originalCorrection: originalCorrection, // Include original correction for "previous grade"
      status: "recovery-delivered",
    };
  }

  // Handle original delivery cases
  if (originalDelivery) {
    // No correction yet
    if (!originalCorrection) {
      // Check if delivery was made within the project schedule and project is still active
      // This allows editing the delivery while still within the delivery period
      if (projectStatus === "active") {
        return {
          hasDelivery: true,
          hasCorrection: false,
          delivery: originalDelivery,
          status: "delivered-editable",
        };
      }
      
      return {
        hasDelivery: true,
        hasCorrection: false,
        delivery: originalDelivery,
        status: "pending-correction",
      };
    }

    // Has correction - check if recovery is available
    if (isRecoveryAvailable(project, originalCorrection)) {
      return {
        hasDelivery: true,
        hasCorrection: true,
        delivery: originalDelivery,
        correction: originalCorrection,
        originalCorrection: originalCorrection, // For consistency
        status: "can-recover",
      };
    }

    // Corrected and no recovery available (or recovery period ended)
    return {
      hasDelivery: true,
      hasCorrection: true,
      delivery: originalDelivery,
      correction: originalCorrection,
      status: "corrected",
    };
  }

  // Fallback to latest delivery (shouldn't reach here normally)
  const latestCorrection = corrections?.find(
    (correction) => correction.delivery_id === latestDelivery.id
  );

  if (!latestCorrection) {
    return {
      hasDelivery: true,
      hasCorrection: false,
      delivery: latestDelivery,
      status: "pending-correction",
    };
  }

  return {
    hasDelivery: true,
    hasCorrection: true,
    delivery: latestDelivery,
    correction: latestCorrection,
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
  project: ClassroomProject,
  deliveries: ClassroomProjectDelivery[],
  corrections: ClassProjectCorrection[]
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
