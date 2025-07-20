import generatePassword from "generate-password";

/**
 * Generates a random password with secure defaults
 * @param options - Optional configuration for password generation
 * @returns A randomly generated password string
 */
export const generateRandomPassword = (options?: {
  length?: number;
  numbers?: boolean;
  symbols?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  excludeSimilarCharacters?: boolean;
  strict?: boolean;
}) => {
  return generatePassword.generate({
    length: options?.length ?? 12,
    numbers: options?.numbers ?? true,
    symbols: options?.symbols ?? true,
    uppercase: options?.uppercase ?? true,
    lowercase: options?.lowercase ?? true,
    excludeSimilarCharacters: options?.excludeSimilarCharacters ?? true,
    strict: options?.strict ?? true,
  });
};