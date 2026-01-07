import { ClassroomProject, ClassroomProjectDelivery, ClassProjectCorrection } from "../../projects/types";


export function calculateProjectNotes(
  studentIdentifier: string,
  projects: ClassroomProject[],
  deliveries: ClassroomProjectDelivery[],
  corrections: ClassProjectCorrection[]
): { [projectId: string]: number } {
  const notes: { [projectId: string]: number } = {};

  // Verificar se os arrays existem e não estão vazios
  if (!projects || projects.length === 0) {
    return notes;
  }

  // Inicializar todos os projetos com 0
  projects.forEach((project) => {
    notes[project.id] = 0;
  });

  if (!deliveries || deliveries.length === 0) {
    return notes;
  }

  if (!corrections || corrections.length === 0) {
    return notes;
  }

  projects.forEach((project) => {
    // Filtrar entregas baseado no tipo de projeto
    const studentDeliveries = deliveries.filter((delivery) => {
      if (delivery.project_id !== project.id) return false;

      if (project.project_type === "mini_project") {
        // Para mini_project: apenas entregas onde o estudante é o user_id
        return delivery.user_id === studentIdentifier;
      } else {
        // Para outros tipos: entregas onde o estudante está em user_id OU members_id
        if (delivery.user_id === studentIdentifier) {
          return true;
        }

        if (delivery.members_id && Array.isArray(delivery.members_id)) {
          return delivery.members_id.includes(studentIdentifier);
        }

        return false;
      }
    });

    if (studentDeliveries.length > 0) {
      // Para cada entrega, procurar pela correção mais recente
      let highestNote = 0;

      studentDeliveries.forEach((delivery) => {
        const deliveryCorrections = corrections.filter(
          (correction) => correction.delivery_id === delivery.id
        );

        if (deliveryCorrections.length > 0) {
          // Pegar a correção mais recente
          const latestCorrection = deliveryCorrections.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

          // A nota já está atribuída, apenas extrair o valor
          if (
            latestCorrection.final_note !== undefined &&
            latestCorrection.final_note !== null
          ) {
            const finalNote = parseFloat(String(latestCorrection.final_note));
            if (!isNaN(finalNote) && finalNote >= 0) {
              highestNote = Math.max(highestNote, finalNote);
            }
          }
        }
      });

      notes[project.id] = highestNote;
    }
  });

  return notes;
}
