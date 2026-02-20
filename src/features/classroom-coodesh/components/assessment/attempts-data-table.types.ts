import { CoodeshAssessment } from "../../types";

export type UpdateAssessmentFn = (
    assessment: CoodeshAssessment,
    assessmentData: Partial<CoodeshAssessment>,
) => Promise<boolean>;

export interface AttemptsDataTableProps {
    readonly assessment: CoodeshAssessment | undefined;
    readonly updateAssessment: UpdateAssessmentFn;
}
