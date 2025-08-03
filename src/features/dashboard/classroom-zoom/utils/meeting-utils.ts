export const MEETING_TYPES = {
  1: "Reunião instantânea",
  2: "Reunião agendada",
  3: "Reunião recorrente sem horário fixo",
  8: "Reunião recorrente com horário fixo",
} as const;

export const RECURRING_MEETING_TYPES = [3, 8] as const;

export const isFutureMeeting = (startTime?: string) => {
  return startTime && new Date(startTime).getTime() >= Date.now();
};

export const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

export const getMeetingType = (type: number) => {
  return MEETING_TYPES[type as keyof typeof MEETING_TYPES] || "Sem tipo";
};