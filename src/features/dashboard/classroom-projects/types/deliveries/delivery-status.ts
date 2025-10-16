import { ClassroomProjectDeliveryT } from ".";
import { ClassroomProjectCorrectionT } from "..";

export interface DeliveryStatusResultT {
  hasDelivery: boolean;
  hasCorrection: boolean;
  delivery?: ClassroomProjectDeliveryT;
  correction?: ClassroomProjectCorrectionT;
  originalCorrection?: ClassroomProjectCorrectionT; // For recovery cases, stores the original correction
  status:
    | "can-deliver"
    | "future"
    | "not-delivered"
    | "pending-correction"
    | "corrected"
    | "can-recover"
    | "recovery-delivered";
}