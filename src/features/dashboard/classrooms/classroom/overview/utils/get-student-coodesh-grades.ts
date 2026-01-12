import { CoodeshAssessment } from "../../integrations/coodesh/types";

export function getStudentCoodeshGrades(
  studentId: string,
  assessments: CoodeshAssessment[],
  studentEmail: string
) {
  const coodeshGrades: { [key: string]: number } = {};

  assessments.forEach((assessment) => {
    if (
      assessment.participants_data &&
      Array.isArray(assessment.participants_data)
    ) {
      const participant = assessment.participants_data.find((p) => {
        return p.email === studentEmail;
      });

      if (participant) {
        if (
          participant.results &&
          Array.isArray(participant.results) &&
          participant.results.length > 0
        ) {
          const assessmentScore = participant.results[0].assessmentScore;
          if (assessmentScore && assessment.id) {
            coodeshGrades[assessment.id] = assessmentScore;
          }
        }
      }
    }
  });

  return coodeshGrades;
}
