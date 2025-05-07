export type AIMatchScoresT = {
  area: number; // 0 ou 1 (conforme sua lógica original)
  skills: number; // 0-3 (substituindo 'language', mais abrangente)
  studies: number; // 0 ou 1
  locale: number; // 0 ou 0.5
  justification?: string; // Explicação da IA para a pontuação
};

export type MatchResultT = {
  area: number;
  language: number; // Mapeado do 'skills' da IA para manter consistência com seu output
  studies: number;
  local: number;
  total: number; // Porcentagem final
  justification?: string;
};
