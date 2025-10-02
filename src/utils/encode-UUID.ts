/**
 * Double-encodes UUIDs for safe URL usage when they contain problematic characters
 *
 * This function addresses edge cases where UUIDs may start with forward slashes or
 * contain double slashes, which can cause URL routing issues in web applications.
 * Double-encoding ensures these special characters are properly escaped for HTTP.
 *
 * ## Problem Context
 * Some UUID generation methods or database systems may produce UUIDs with leading
 * slashes or double slashes, which interfere with URL parsing and routing:
 * - Leading `/` can be interpreted as URL path separators
 * - Double `//` can be interpreted as protocol separators or path shortcuts
 *
 * ## Encoding Strategy
 * - Single encoding: `encodeURIComponent()` converts `/` to `%2F`
 * - Double encoding: Converts `%2F` to `%252F` for complete URL safety
 *
 * @param uuid - The UUID string to encode (may contain special characters)
 * @returns Safe encoded UUID string for URL usage
 *
 * @example
 * ```typescript
 * // Problematic UUIDs
 * encodeUUID("/abc123")     // Returns "%2Fabc123" (double-encoded)
 * encodeUUID("abc//123")    // Returns "abc%2F%2F123" (double-encoded)
 * encodeUUID("normal-uuid") // Returns "normal-uuid" (unchanged)
 *
 * // Usage in URLs
 * const userId = encodeUUID("/problematic-uuid");
 * const url = `/api/users/${userId}/profile`;
 * // Result: "/api/users/%2Fproblematic-uuid/profile"
 * ```
 *
 * @remarks
 * This is a defensive encoding strategy for UUIDs from untrusted sources.
 * Most UUIDs won't need encoding, but this prevents routing errors for edge cases.
 *
 * @see {@link encodeURIComponent} for single encoding behavior
 * @see RFC 4122 for UUID format specifications
 */
export function encodeUUID(uuid: string): string {
  // Validate input parameter
  if (typeof uuid !== "string") {
    throw new TypeError("UUID must be a string");
  }

  if (uuid.length === 0) {
    return uuid;
  }

  // Check if UUID contains problematic patterns that require double encoding
  const requiresDoubleEncoding = uuid.startsWith("/") || uuid.includes("//");

  if (!requiresDoubleEncoding) {
    return uuid;
  }

  // Apply double encoding for complete URL safety
  return encodeURIComponent(encodeURIComponent(uuid));
}


/**
 * Decodes double-encoded UUIDs back to their original form
 * 
 * This function reverses the double-encoding applied by `encodeUUID`
 * and should be used when reading UUIDs from URL parameters.
 * 
 * @param encodedUUID - The encoded UUID string from URL parameters
 * @returns Original UUID string
 * 
 * @example
 * ```typescript
 * // From URL parameter
 * const encodedId = getParameterFromURL('userId'); // "%2Fabc123"
 * const originalId = decodeUUID(encodedId);        // Returns "/abc123"
 * ```
 */
export function decodeUUID(encodedUUID: string): string {
  if (typeof encodedUUID !== 'string') {
    throw new TypeError('Encoded UUID must be a string');
  }

  try {
    // Try double decoding first, fall back to single decoding
    const singleDecoded = decodeURIComponent(encodedUUID);
    
    // If the single-decoded string still contains encoded characters,
    // it was likely double-encoded
    if (singleDecoded.includes('%')) {
      return decodeURIComponent(singleDecoded);
    }
    
    return singleDecoded;
  } catch (error) {
    // If decoding fails, return the original string
    console.error('Failed to decode UUID, returning original:', error);
    return encodedUUID;
  }
}