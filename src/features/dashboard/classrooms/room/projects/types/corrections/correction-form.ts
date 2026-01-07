import { z } from "zod";
import { ClassroomProjectDelivery, ClassroomProject } from "..";
import { correctionFormSchema } from "../../utils/corrections/correction-form-schema";

export type CorrectionFormT = z.infer<typeof correctionFormSchema>;

export interface CorrectionFormPropsT {
  classroomId: string;
  selectedDelivery: ClassroomProjectDelivery;
  project: ClassroomProject;
  handleClose: () => void;
}
