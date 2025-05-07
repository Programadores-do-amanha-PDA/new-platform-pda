/**
 * Double-encodes a UUID if it starts with '/' or contains '//'.
 */
export function encodeUUID(uuid: string): string {
  if (uuid.startsWith("/") || uuid.includes("//")) {
    return encodeURIComponent(encodeURIComponent(uuid));
  }
  return uuid;
}
