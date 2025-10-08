import { z } from "zod";
import { ClassroomProjectDeliveryT, ClassroomProjectT } from "..";
import { correctionFormSchema } from "../../utils/corrections/correction-form-schema";

export type CorrectionFormT = z.infer<typeof correctionFormSchema>;

export interface CorrectionFormPropsT {
  classroomId: string;
  selectedDelivery: ClassroomProjectDeliveryT;
  project: ClassroomProjectT;
  handleClose: () => void;
}
