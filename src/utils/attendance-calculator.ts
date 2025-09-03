import { ZoomMeetingT, ZoomMeetingPastInstanceT } from "@/types";

export type AttendanceStatus = "P" | "PP" | "FJ" | "F";

export interface AttendanceResult {
  status: AttendanceStatus;
  minutesAttended: number;
}

/**
 * Calcula o status de presença e minutos de participação de um usuário em uma reunião
 * 
 * @param meeting - A reunião (ZoomMeetingT ou ZoomMeetingPastInstanceT)
 * @param userEmail - Email do usuário
 * @returns Objeto com status de presença e minutos participados
 */
export function calculateUserAttendance(
  meeting: ZoomMeetingT | ZoomMeetingPastInstanceT,
  userEmail: string
): AttendanceResult {
  // Verifica se existe justificativa para o usuário
  const hasJustification = meeting.justifications?.some(
    (justification) => justification.user_email === userEmail
  );

  if (hasJustification) {
    return {
      status: "FJ",
      minutesAttended: 0
    };
  }

  // Busca participações do usuário na reunião
  const userParticipations = meeting.participants?.filter(
    (participant) => participant.user_email === userEmail
  ) || [];

  // Calcula total de minutos participados
  const totalMinutesAttended = Math.round(
    userParticipations.reduce(
      (accumulator, participation) => accumulator + participation.duration,
      0
    ) / 60
  );

  // Determina status baseado nos minutos participados
  let status: AttendanceStatus;
  if (totalMinutesAttended >= 60) {
    status = "P"; // Presente
  } else if (totalMinutesAttended >= 30) {
    status = "PP"; // Presença Parcial
  } else {
    status = "F"; // Falta
  }

  return {
    status,
    minutesAttended: totalMinutesAttended
  };
}