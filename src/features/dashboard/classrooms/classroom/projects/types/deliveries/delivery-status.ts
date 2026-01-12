import { ClassroomProjectDelivery } from ".";
import { ClassroomProjectCorrection } from "..";

export interface DeliveryStatusResultT {
  hasDelivery: boolean;
  hasCorrection: boolean;
  delivery?: ClassroomProjectDelivery;
  correction?: ClassroomProjectCorrection;
  originalCorrection?: ClassroomProjectCorrection; // For recovery cases, stores the original correction
  status:
    | "can-deliver"
    | "future"
    | "not-delivered"
    | "delivered-editable"
    | "pending-correction"
    | "corrected"
    | "can-recover"
    | "recovery-delivered"
    | "recovery-delivered-editable";
}