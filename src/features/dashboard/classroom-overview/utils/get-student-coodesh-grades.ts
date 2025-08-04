import { ClassroomCoodeshAssessmentT } from "@/types";

export function getStudentCoodeshGrades(
  studentId: string,
  assessments: ClassroomCoodeshAssessmentT[],
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
            console.log(`Nota Coodesh: ${assessmentScore}`);
          } else {
            console.log(` assessmentScore não encontrado nos results`);
          }
        } else {
          console.log(`results array vazio ou inválido`);
        }
      } else {
        console.log(
          ` Estudante com email ${studentEmail} não encontrado nos participants_data`
        );
      }
    } else {
      console.log(
        `  participants_data vazio ou inválido para assessment ${assessment.name}`
      );
    }
  });

  return coodeshGrades;
}
