import { ClassroomProjectDeliveryT } from ".";
import { ClassroomProjectCorrectionT } from "..";

export interface DeliveryStatusResultT {
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