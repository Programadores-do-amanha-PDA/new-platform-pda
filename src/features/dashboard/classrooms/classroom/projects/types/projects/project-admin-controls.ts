import { ClassroomProjectCorrection, ClassroomProjectDelivery, ClassroomProject } from "..";

export interface ProjectAdminControlsProps {
  project: ClassroomProject;
  deliveries: ClassroomProjectDelivery[];
  corrections: ClassroomProjectCorrection[];
}