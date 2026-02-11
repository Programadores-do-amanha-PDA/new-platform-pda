import { z } from "zod";
import { correctionFormSchema } from "../../utils/corrections/correction-form-schema";
import { ClassroomProject } from "../projects/project";
import { ClassroomProjectDelivery } from "../deliveries/delivery";

export type CorrectionFormT = z.infer<typeof correctionFormSchema>;

export interface CorrectionFormPropsT {
    classroomId: string;
    selectedDelivery: ClassroomProjectDelivery;
    project: ClassroomProject;
    handleClose: () => void;
}
