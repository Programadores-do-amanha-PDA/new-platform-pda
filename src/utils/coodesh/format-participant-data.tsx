import Papa from "papaparse";
import {
  ActionPlanRowT,
  IntegrityRowT,
  ParticipantDataT,
  ResultsRowT,
} from "@/types/coodesh/attempts";

export function formatParticipantsData(
  resultsCsv: string,
  integrityCsv: string,
  actionPlansCsv: string
): ParticipantDataT[] {
  const results = parseCsv<ResultsRowT>(resultsCsv);
  const integrity = parseCsv<IntegrityRowT>(integrityCsv);
  const actionPlans = parseCsv<ActionPlanRowT>(actionPlansCsv);

  const participantsMap = new Map<string, ParticipantDataT>();

  // Processar results.csv agrupando múltiplas entradas
  results.forEach((result) => {
    const email = result.email.toLowerCase();
    const existing = participantsMap.get(email);

    if (existing) {
      existing.results.push(result);
    } else {
      participantsMap.set(email, {
        email: email,
        name: result.participant,
        results: [result],
        integrityEvents: [],
        actionPlans: [],
      });
    }
  });

  // Processar integrity.csv
  integrity.forEach((event) => {
    const email = event.email.toLowerCase();
    const participant = participantsMap.get(email);
    if (participant) {
      participant.integrityEvents.push(event);
    }
  });

  // Processar action_plans.csv
  actionPlans.forEach((plan) => {
    const email = plan.email.toLowerCase();
    const participant = participantsMap.get(email);
    if (participant) {
      participant.actionPlans.push(plan);
    }
  });

  console.log(Array.from(participantsMap.values()));

  return Array.from(participantsMap.values());
}

function parseCsv<T>(csvString: string): T[] {
  const result = Papa.parse(csvString, {
    header: true,
    transformHeader: (header) => {
      return header
        .trim()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
    },
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return result.data as T[];
}
