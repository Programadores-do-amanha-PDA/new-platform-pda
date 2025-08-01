import { ClassroomProjectWithDeliveriesAndCorrectionsT } from "@/types/classroom-projects";

export function calculateProjectNotes(
  studentEmail: string,
  projects: ClassroomProjectWithDeliveriesAndCorrectionsT[]
): { [projectId: string]: number } {
  const notes: { [projectId: string]: number } = {};

  projects.forEach((project) => {
    // Inicializar com 0 por padrão
    notes[project.id] = 0;

    // Procurar por entregas do estudante
    const studentDeliveries = project.deliveries?.filter((delivery) =>
      delivery.members.includes(studentEmail)
    );

    if (studentDeliveries && studentDeliveries.length > 0) {
      // Para cada entrega, procurar pela correção mais recente
      let latestNote = 0;
      
      studentDeliveries.forEach((delivery) => {
        const corrections = project.corrections?.filter(
          (correction) => correction.delivery_id === delivery.id
        );

        if (corrections && corrections.length > 0) {
          // Pegar a correção mais recente
          const latestCorrection = corrections.sort(
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