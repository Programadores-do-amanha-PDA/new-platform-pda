import { ClassroomProjectCorrection } from "../corrections/corrections";
import { ClassroomProjectDelivery } from "../deliveries/delivery";
import { ClassroomProject } from "./project";

export interface ProjectAdminControlsProps {
  project: ClassroomProject;
  deliveries: ClassroomProjectDelivery[];
  corrections: ClassroomProjectCorrection[];
}