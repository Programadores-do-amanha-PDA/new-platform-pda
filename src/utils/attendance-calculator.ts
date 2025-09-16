import { ZoomMeetingT, ZoomMeetingPastInstanceT } from "@/types";
import {
  ClassroomConfigClassTypesT,
  ClassroomConfigClassTypesLimitT,
  ClassroomConfigJustificationT,
} from "@/types/classroom-configs";

export interface AttendanceResult {
  minutesAttended: number;
  limit?: ClassroomConfigClassTypesLimitT;
  justification?: ClassroomConfigJustificationT;
}

/**
 * Calcula o status de presença e minutos de participação de um usuário em uma reunião
 *
 * @param meeting - A reunião (ZoomMeetingT ou ZoomMeetingPastInstanceT)
 * @param userEmail - Email do usuário
 * @param currentClassType - Configuração do tipo de aula atual (opcional)
 * @param availableJustifications - Array de justificativas disponíveis (opcional)
 * @returns Objeto com status de presença, minutos participados, limite e justificativa aplicados
 */
export function calculateUserAttendance(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  userEmail: string,
  currentClassType?: ClassroomConfigClassTypesT,
  availableJustifications?: ClassroomConfigJustificationT[]
): AttendanceResult {
  // Verifica se existe justificativa para o usuário
  const userJustification = meeting.justifications?.find(
    (justification) => justification.user_email === userEmail
  );

  if (userJustification) {
    // Se não há justificativas disponíveis, usa justificativa padrão
    if (!availableJustifications || availableJustifications.length === 0) {
      const defaultJustification = getDefaultJustification();
      return {
        minutesAttended: 0,
        justification: defaultJustification,
      };
    }

    // Encontra a melhor justificativa baseada na mensagem do usuário
    const bestJustification = findBestJustification(availableJustifications);

    return {
      minutesAttended: 0,
      justification: bestJustification,
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

  // Se não há class_type na meeting ou currentClassType não foi fornecido, usa limites padrão
  if (!meeting.class_type || !currentClassType) {
    const defaultLimit = getDefaultLimit(totalMinutesAttended);
    return {
      minutesAttended: totalMinutesAttended,
      limit: defaultLimit,
    };
  }

  // Encontra o limite mais adequado baseado nos minutos participados
  const bestLimit = findBestLimit(
    totalMinutesAttended,
    currentClassType.limits
  );

  return {
    minutesAttended: totalMinutesAttended,
    limit: bestLimit,
  };
}

/**
 * Retorna uma justificativa padrão quando não há justificativas configuradas
 *
 * @returns Justificativa padrão
 */
function getDefaultJustification(): ClassroomConfigJustificationT {
  return {
    id: "default-justified",
    key: "FJ",
    title: "Falta Justificada",
    color: "#0066cc",
    isPresence: true,
  };
}

/**
 * Encontra a melhor justificativa baseada na mensagem do usuário
 *
 * @param message - Mensagem da justificativa do usuário
 * @param justifications - Array de justificativas configuradas
 * @returns A justificativa que melhor se encaixa ou a primeira disponível
 */
function findBestJustification(
  justifications: ClassroomConfigJustificationT[]
): ClassroomConfigJustificationT {
  if (justifications.length === 0) {
    return getDefaultJustification();
  }

  // Por enquanto, retorna a primeira justificativa disponível
  // Futuramente pode implementar lógica mais sofisticada baseada na mensagem
  return justifications[0];
}

/**
 * Retorna um limite padrão baseado no código antigo quando não há class_type
 * Baseado na lógica: >= 60min = P, >= 30min = PP, < 30min = F
 *
 * @param minutesAttended - Minutos que o usuário participou
 * @returns Limite padrão baseado nos minutos participados
 */
function getDefaultLimit(
  minutesAttended: number
): ClassroomConfigClassTypesLimitT {
  if (minutesAttended >= 60) {
    return {
      id: "default-present",
      min: 60,
      key: "P",
      title: "Presente",
      color: "#00ff00",
      allowJustification: false,
      isPresence: true,
    };
  } else if (minutesAttended >= 30) {
    return {
      id: "default-partial",
      min: 30,
      max: 59,
      key: "PP",
      title: "Presença Parcial",
      color: "#ffff00",
      allowJustification: true,
      isPresence: false,
    };
  } else {
    return {
      id: "default-absent",
      min: 0,
      max: 29,
      key: "F",
      title: "Falta",
      color: "#ff0000",
      allowJustification: true,
      isPresence: false,
    };
  }
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
