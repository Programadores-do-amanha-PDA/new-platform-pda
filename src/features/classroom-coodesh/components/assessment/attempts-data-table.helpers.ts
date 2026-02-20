import { CoodeshAttemptParticipantData } from "../../types";

export const getAssessmentScore = (participant: CoodeshAttemptParticipantData): number => {
    return participant.results[0]?.assessmentScore ?? 0;
};
