import {
  ClassProjectCorrection,
  ClassroomProjectDelivery,
  ClassroomProject,
} from "..";

export interface ModalSendCorrectionFeedbackEmailModalPropsT {
  open: boolean;
  deliveries: ClassroomProjectDelivery[];
  corrections: ClassProjectCorrection[];
  project: ClassroomProject;
  setClose: () => void;
}
