import { ClassroomProjectDelivery } from "../deliveries/delivery";
import { ClassroomProject } from "../projects/project";
import { ClassroomProjectCorrection } from "./corrections";


export interface ModalSendCorrectionFeedbackEmailModalPropsT {
  open: boolean;
  deliveries: ClassroomProjectDelivery[];
  corrections: ClassroomProjectCorrection[];
  project: ClassroomProject;
  setClose: () => void;
}
