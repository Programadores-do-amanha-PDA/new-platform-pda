import {
  ClassroomProjectCorrectionT,
  ClassroomProjectDeliveryT,
  ClassroomProjectT,
} from "..";

export interface ModalSendCorrectionFeedbackEmailModalPropsT {
  open: boolean;
  deliveries: ClassroomProjectDeliveryT[];
  corrections: ClassroomProjectCorrectionT[];
  project: ClassroomProjectT;
  setClose: () => void;
}
