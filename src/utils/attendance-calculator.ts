import { ZoomMeetingT, ZoomMeetingPastInstanceT } from "@/types";
import {
  ClassroomConfigClassTypesT,
  ClassroomConfigClassTypesLimitT,
} from "@/types/classroom-configs";

export interface AttendanceResult {
  minutesAttended: number;
  limit?: ClassroomConfigClassTypesLimitT;
  isJustification: boolean;
}

/**
 * Calcula o status de presença e minutos de participação de um usuário em uma reunião
 *
 * @param meeting - A reunião (ZoomMeetingT ou ZoomMeetingPastInstanceT)
 * @param userEmail - Email do usuário
 * @param currentClassType - Configuração do tipo de aula atual
 * @returns Objeto com status de presença, minutos participados e limite aplicado
 */
export function calculateUserAttendance(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  userEmail: string,
  currentClassType: ClassroomConfigClassTypesT
): AttendanceResult {
  // Verifica se existe justificativa para o usuário
  const hasJustification = meeting.justifications?.some(
    (justification) => justification.user_email === userEmail
  );

  if (hasJustification) {
    return {
      minutesAttended: 0,
      isJustification: true,
    };
  }

  // Busca participações do usuário na reunião
  const userParticipations =
    meeting.participants?.filter(
      (participant) => participant.user_email === userEmail
    ) || [];

  // Calcula total de minutos participados
  const totalMinutesAttended = Math.round(
    userParticipations.reduce(
      (accumulator, participation) => accumulator + participation.duration,
      0
    ) / 60
  );

  // Encontra o limite mais adequado baseado nos minutos participados
  const bestLimit = findBestLimit(
    totalMinutesAttended,
    currentClassType.limits
  );

  return {
    minutesAttended: totalMinutesAttended,
    limit: bestLimit,
    isJustification: false,
  };
}

/**
 * Encontra o limite mais adequado baseado nos minutos participados
 *
 * @param minutesAttended - Minutos que o usuário participou
 * @param limits - Array de limites configurados para o tipo de aula
 * @returns O limite que melhor se encaixa ou undefined se nenhum for encontrado
 */
function findBestLimit(
  minutesAttended: number,
  limits: ClassroomConfigClassTypesLimitT[]
): ClassroomConfigClassTypesLimitT | undefined {
  // Ordena os limites por valor mínimo (do menor para o maior)
  const sortedLimits = [...limits].sort((a, b) => a.min - b.min);

  // Encontra o limite mais adequado
  for (let i = sortedLimits.length - 1; i >= 0; i--) {
    const limit = sortedLimits[i];

    // Verifica se os minutos atendem ao critério mínimo
    if (minutesAttended >= limit.min) {
      // Se tem máximo definido, verifica se não excede
      if (limit.max !== undefined && minutesAttended > limit.max) {
        continue;
      }

      // Se chegou aqui, este é o limite adequado
      return limit;
    }
  }

  // Se não encontrou nenhum limite adequado, retorna undefined
  return undefined;
}
