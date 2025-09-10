import { ClassroomProjectT } from "@/types/classroom-projects/project";
import { ClassroomProjectDeliveryT } from "@/types/classroom-projects/delivery";
import { ClassroomProjectCorrectionT } from "@/types/classroom-projects/corrections";

export function calculateProjectNotes(
  student: string,
  projects: ClassroomProjectT[],
  deliveries: ClassroomProjectDeliveryT[],
  corrections: ClassroomProjectCorrectionT[]
): { [projectId: string]: number } {
  const notes: { [projectId: string]: number } = {};

  projects.forEach((project) => {
    // Inicializar com 0 por padrão
    notes[project.id] = 0;

    // Procurar por entregas do estudante neste projeto
    const studentDeliveries = deliveries.filter(
      (delivery) =>
        delivery.project_id === project.id &&
        delivery.members_id.includes(student)
    );

    if (studentDeliveries.length > 0) {
      // Para cada entrega, procurar pela correção mais recente
      let latestNote = 0;
      
      studentDeliveries.forEach((delivery) => {
        const deliveryCorrections = corrections.filter(
          (correction) => correction.delivery_id === delivery.id
        );

        if (deliveryCorrections.length > 0) {
          // Pegar a correção mais recente
          const latestCorrection = deliveryCorrections.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          const finalNote = parseFloat(latestCorrection.final_note) || 0;
          if (finalNote > latestNote) {
            latestNote = finalNote;
          }
        }
      });

      notes[project.id] = latestNote;
    }
  });

  return notes;
}