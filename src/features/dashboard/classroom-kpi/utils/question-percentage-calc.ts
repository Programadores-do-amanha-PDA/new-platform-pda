/**
 * Poll Answer Weight Configuration
 *
 * Defines the weight values for different poll answer types used in
 * calculating poll engagement percentages. Weights represent the
 * level of agreement/disagreement intensity.
 */
const POLL_ANSWER_WEIGHTS = {
  STRONGLY_AGREE: 1.0, // Full positive impact (1/1)
  AGREE: 0.5, // Moderate positive impact (0.5/1)
  DISAGREE: -0.333, // Moderate negative impact (1/3)
  STRONGLY_DISAGREE: -0.25, // Strong negative impact (1/4)
} as const;

/**
 * Normalized Poll Answer Keys
 *
 * Standardized keys for poll answer types to ensure consistent
 * string comparison across different text variations.
 */
const POLL_ANSWER_KEYS = {
  STRONGLY_AGREE: ["concordo plenamente", "muito bom"],
  AGREE: ["concordo", "bom"],
  DISAGREE: ["discordo", "regular"],
  STRONGLY_DISAGREE: ["discordo plenamente", "ruim"],
} as const;

/**
 * Calculates engagement percentage from poll answers using weighted scoring
 *
 * This function processes an array of poll answers and calculates a normalized
 * engagement percentage based on weighted agreement/disagreement levels.
 * The scoring system applies different weights to reflect the intensity
 * of agreement or disagreement.
 *
 * ## Scoring Algorithm
 * - Strongly Agree: +100% weight (full positive impact)
 * - Agree: +50% weight (moderate positive impact)
 * - Disagree: -33.3% weight (moderate negative impact)
 * - Strongly Disagree: -25% weight (strong negative impact)
 *
 * The final percentage is normalized between 0% and 100% to represent
 * overall poll engagement level.
 *
 * @param answers - Array of string answers from poll respondents
 * @returns Normalized percentage between 0 and 100 representing engagement level
 *
 * @example
 * ```typescript
 * // High agreement scenario
 * const positiveAnswers = ["concordo plenamente", "concordo", "concordo"];
 * calculatePollPercentage(positiveAnswers); // Returns ~66.67%
 *
 * // Mixed responses scenario
 * const mixedAnswers = ["concordo", "discordo", "discordo plenamente"];
 * calculatePollPercentage(mixedAnswers); // Returns ~13.89%
 *
 * // Empty array scenario
 * calculatePollPercentage([]); // Returns 0%
 * ```
 *
 * @remarks
 * - Empty arrays return 0% to avoid division by zero
 * - Answer comparison is case-insensitive for reliability
 * - Result is clamped between 0% and 100% for meaningful percentages
 * - Weights are designed to balance agreement and disagreement intensities
 */
export const calculatePollPercentage = (answers: string[]): number => {
  // Early return for empty input to prevent unnecessary processing
  if (answers.length === 0) {
    return 0;
  }

  const answerCounts = countPollAnswers(answers);
  console.log(answerCounts);
  const weightedScore = calculateWeightedScore(answerCounts, answers.length);
  const normalizedPercentage = normalizePercentage(weightedScore);

  return normalizedPercentage;
};

/**
 * Counts occurrences of each poll answer type
 *
 * Processes the answers array once to count all answer types efficiently.
 * Uses case-insensitive comparison for reliability.
 *
 * @param answers - Array of poll answer strings
 * @returns Object with counts for each answer type
 */
const countPollAnswers = (
  answers: string[]
): Record<keyof typeof POLL_ANSWER_KEYS, number> => {
  const counts = {
    STRONGLY_AGREE: 0,
    AGREE: 0,
    DISAGREE: 0,
    STRONGLY_DISAGREE: 0,
  };

  answers.forEach((answer) => {
    const normalizedAnswer = answer.toLowerCase().trim();

    if (
      (POLL_ANSWER_KEYS.STRONGLY_AGREE as readonly string[]).includes(
        normalizedAnswer
      )
    ) {
      counts.STRONGLY_AGREE++;
    } else if (
      (POLL_ANSWER_KEYS.AGREE as readonly string[]).includes(normalizedAnswer)
    ) {
      counts.AGREE++;
    } else if (
      (POLL_ANSWER_KEYS.DISAGREE as readonly string[]).includes(
        normalizedAnswer
      )
    ) {
      counts.DISAGREE++;
    } else if (
      (POLL_ANSWER_KEYS.STRONGLY_DISAGREE as readonly string[]).includes(
        normalizedAnswer
      )
    ) {
      counts.STRONGLY_DISAGREE++;
    }
    // Unknown answers are ignored in counting
  });

  return counts;
};

/**
 * Calculates weighted score based on answer counts and weights
 *
 * Applies the predefined weights to each answer type and computes
 * the overall engagement score.
 *
 * @param counts - Object containing counts for each answer type
 * @param totalAnswers - Total number of answers for normalization
 * @returns Raw weighted score between -1 and 1
 */
const calculateWeightedScore = (
  counts: Record<keyof typeof POLL_ANSWER_KEYS, number>,
  totalAnswers: number
): number => {
  const { STRONGLY_AGREE, AGREE, DISAGREE, STRONGLY_DISAGREE } = counts;

  const rawScore =
    (STRONGLY_AGREE * POLL_ANSWER_WEIGHTS.STRONGLY_AGREE +
      AGREE * POLL_ANSWER_WEIGHTS.AGREE +
      DISAGREE * POLL_ANSWER_WEIGHTS.DISAGREE +
      STRONGLY_DISAGREE * POLL_ANSWER_WEIGHTS.STRONGLY_DISAGREE) /
    totalAnswers;

  return rawScore;
};

/**
 * Normalizes raw score to a 0-100 percentage range
 *
 * Clamps the result to ensure meaningful percentage values and
 * converts the normalized score to percentage format.
 *
 * @param rawScore - Raw weighted score between -1 and 1
 * @returns Percentage value between 0 and 100
 */
const normalizePercentage = (rawScore: number): number => {
  // Clamp value between 0 and 1 for percentage calculation
  const clampedValue = Math.max(0, Math.min(1, rawScore));
  // Convert to percentage with 2 decimal places for precision
  const percentage = clampedValue * 100;

  return percentage;
};

// Alternative implementation with configurable weights for different use cases

/**
 * Advanced poll percentage calculator with configurable weights
 *
 * Provides flexibility for different scoring systems while maintaining
 * the same core calculation logic.
 *
 * @example
 * ```typescript
 * // Custom weights for different poll types
 * const customWeights = {
 *   STRONGLY_AGREE: 1.0,
 *   AGREE: 0.7,
 *   DISAGREE: -0.5,
 *   STRONGLY_DISAGREE: -1.0
 * };
 *
 * const percentage = calculatePollPercentageAdvanced(
 *   answers,
 *   customWeights
 * );
 * ```
 */
export const calculatePollPercentageAdvanced = (
  answers: string[],
  customWeights: Record<
    keyof typeof POLL_ANSWER_WEIGHTS,
    number
  > = POLL_ANSWER_WEIGHTS
): number => {
  if (answers.length === 0) {
    return 0;
  }

  const answerCounts = countPollAnswers(answers);

  const { STRONGLY_AGREE, AGREE, DISAGREE, STRONGLY_DISAGREE } = answerCounts;

  const rawScore =
    (STRONGLY_AGREE * customWeights.STRONGLY_AGREE +
      AGREE * customWeights.AGREE +
      DISAGREE * customWeights.DISAGREE +
      STRONGLY_DISAGREE * customWeights.STRONGLY_DISAGREE) /
    answers.length;

  return normalizePercentage(rawScore);
};
