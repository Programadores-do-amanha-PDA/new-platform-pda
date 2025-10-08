/**
 * Extracts first and last name initials from a display name
 * 
 * This utility function processes a person's full name to create a two-letter
 * initial abbreviation. It handles various edge cases including single names,
 * multiple spaces, and invalid inputs.
 * 
 * ## Input Processing
 * - Trims leading/trailing whitespace
 * - Splits on any whitespace (spaces, tabs, multiple spaces)
 * - Filters out empty strings from the result
 * - Handles single names by returning only first initial
 * 
 * ## Common Use Cases
 * - User avatar placeholders
 * - Profile picture fallbacks
 * - Initial-based user identification
 * - Data visualization abbreviations
 * 
 * @param displayName - The full display name to extract initials from
 * @returns Uppercase two-letter initials or empty string for invalid input
 * 
 * @example
 * ```typescript
 * // Basic usage
 * getFirstLastInitials("John Doe")         // Returns "JD"
 * getFirstLastInitials("Alice")            // Returns "A"
 * getFirstLastInitials("Mary Jane Smith")  // Returns "MS"
 * 
 * // Edge cases
 * getFirstLastInitials("  John   Doe  ")   // Returns "JD" (trims and normalizes)
 * getFirstLastInitials("")                 // Returns "" (empty string)
 * getFirstLastInitials("   ")              // Returns "" (only whitespace)
 * getFirstLastInitials(null)               // Returns "" (invalid input)
 * ```
 * 
 * @remarks
 * - Returns empty string for null, undefined, or non-string inputs
 * - Always returns uppercase letters
 * - For single names, returns only the first initial
 * - Handles multiple consecutive spaces gracefully
 */
export const getFirstLastInitials = (displayName: string): string => {
  // Guard clause: validate input is a non-empty string
  if (!displayName || typeof displayName !== "string") {
    return "";
  }

  // Normalize and split the name into meaningful parts
  const names = displayName
    .trim()
    .split(/\s+/) // Split on any whitespace, including multiple spaces
    .filter((name) => name.length > 0); // Remove empty strings

  // Handle case where name consists only of whitespace
  if (names.length === 0) {
    return "";
  }

  // Extract first name initial
  const firstInitial = names[0].charAt(0);
  
  // Extract last name initial if available, otherwise empty string
  const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : "";

  // Return combined initials in uppercase
  return (firstInitial + lastInitial).toUpperCase();
};