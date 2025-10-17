import { ClassroomProjectCorrectionT, ClassroomProjectDeliveryT, ClassroomProjectT } from "..";

export interface ProjectAdminControlsProps {
  project: ClassroomProjectT;
  deliveries: ClassroomProjectDeliveryT[];
  corrections: ClassroomProjectCorrectionT[];
}