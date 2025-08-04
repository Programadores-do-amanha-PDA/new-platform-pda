import { ParticipantDataT } from "@/types/classroom-coodesh/attempts";

interface MetricResult {
  [key: string]: number;
}

export function calculateOverallAccuracy(
  participants: ParticipantDataT[]
): number {
  const validResults = participants
    .flatMap((p) => p.results)
    .filter(
      (result) =>
        !isNaN(result.challengeScore) &&
        typeof result.challengeScore === "number"
    );

  if (validResults.length === 0) return 0;

  const total = validResults.reduce(
    (sum, result) => sum + result.challengeScore,
    0
  );
  return Number((total / validResults.length).toFixed(2));
}

export function calculateAccuracyByChallenge(
  participants: ParticipantDataT[]
): MetricResult {
  const challengeMap = participants.reduce((acc, participant) => {
    participant.results.forEach((result) => {
      if (isNaN(result.challengeScore)) return;

      const challenge = result.challenge || "Desconhecido";
      if (!acc[challenge]) {
        acc[challenge] = { total: 0, count: 0 };
      }
      acc[challenge].total += result.challengeScore;
      acc[challenge].count++;
    });
    return acc;
  }, {} as { [key: string]: { total: number; count: number } });

  return Object.entries(challengeMap).reduce((acc, [challenge, data]) => {
    acc[challenge] =
      data.count > 0 ? Number((data.total / data.count).toFixed(2)) : 0;
    return acc;
  }, {} as MetricResult);
}

export function calculateOverallAverageDuration(
  participants: ParticipantDataT[]
): number {
  const validDurations = participants
    .flatMap((p) => p.results)
    .filter(
      (result) =>
        !isNaN(result.assessmentDurationMinutes) &&
        result.assessmentDurationMinutes > 0
    );

  if (validDurations.length === 0) return 0;

  const total = validDurations.reduce(
    (sum, result) => sum + result.assessmentDurationMinutes,
    0
  );
  return Number((total / validDurations.length).toFixed(2));
}

export function calculateAverageDurationByChallenge(
  participants: ParticipantDataT[]
): MetricResult {
  const challengeMap = participants.reduce((acc, participant) => {
    participant.results.forEach((result) => {
      if (isNaN(result.challengeDurationMinutes)) return;

      const challenge = result.challenge || "Desconhecido";
      if (!acc[challenge]) {
        acc[challenge] = { total: 0, count: 0 };
      }
      acc[challenge].total += result.challengeDurationMinutes;
      acc[challenge].count++;
    });
    return acc;
  }, {} as { [key: string]: { total: number; count: number } });

  return Object.entries(challengeMap).reduce((acc, [challenge, data]) => {
    acc[challenge] =
      data.count > 0 ? Number((data.total / data.count).toFixed(2)) : 0;
    return acc;
  }, {} as MetricResult);
}
