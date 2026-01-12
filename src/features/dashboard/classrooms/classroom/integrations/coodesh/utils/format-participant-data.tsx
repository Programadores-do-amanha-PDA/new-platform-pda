import Papa from "papaparse";
import { CoodeshAttemptParticipantData, CoodeshAttemptResultsRow, CoodeshAttemptIntegrityRow, CoodeshAttemptActionPlanRow } from "../types";


export function formatParticipantsData(
  resultsCsv: string,
  integrityCsv: string,
  actionPlansCsv: string
): CoodeshAttemptParticipantData[] {
  const results = parseCsv<CoodeshAttemptResultsRow>(resultsCsv);
  const integrity = parseCsv<CoodeshAttemptIntegrityRow>(integrityCsv);
  const actionPlans = parseCsv<CoodeshAttemptActionPlanRow>(actionPlansCsv);

  const participantsMap = new Map<string, CoodeshAttemptParticipantData>();

  // Processar results.csv agrupando múltiplas entradas
  results.forEach((result) => {
    if (!result.email) return;
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
    if (!event.email) return;

    const email = event.email.toLowerCase();
    const participant = participantsMap.get(email);
    if (participant) {
      participant.integrityEvents.push(event);
    }
  });

  // Processar action_plans.csv
  actionPlans.forEach((plan) => {
    if (!plan.email) return;
    const email = plan.email.toLowerCase();
    const participant = participantsMap.get(email);
    if (participant) {
      participant.actionPlans.push(plan);
    }
  });

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
