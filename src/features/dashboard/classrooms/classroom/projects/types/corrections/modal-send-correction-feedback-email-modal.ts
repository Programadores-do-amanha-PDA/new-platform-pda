import {
  ClassroomProjectCorrection,
  ClassroomProjectDelivery,
  ClassroomProject,
} from "..";

export interface ModalSendCorrectionFeedbackEmailModalPropsT {
  open: boolean;
  deliveries: ClassroomProjectDelivery[];
  corrections: ClassroomProjectCorrection[];
  project: ClassroomProject;
  setClose: () => void;
}
