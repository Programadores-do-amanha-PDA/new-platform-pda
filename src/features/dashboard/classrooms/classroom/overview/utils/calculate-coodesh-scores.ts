import { CoodeshAssessment } from "../../integrations/coodesh/types";

export function calculateCoodeshScores(
  studentEmail: string,
  assessments: CoodeshAssessment[]
): { [testId: string]: number } {
  const scores: { [testId: string]: number } = {};

  assessments.forEach((assessment) => {
    // Inicializar com 0 por padrão
    scores[assessment.assessment_id] = 0;

    // Procurar pelos dados do participante
    const participantData = assessment.participants_data?.find(
      (participant) => participant.email === studentEmail
    );

    if (participantData && participantData.results.length > 0) {
      // Pegar o score do último resultado (mais recente)
      const latestResult = participantData.results[participantData.results.length - 1];
      scores[assessment.assessment_id] = latestResult.assessmentScore || 0;
    }
  });

  return scores;
}