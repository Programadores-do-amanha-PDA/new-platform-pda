export function safeIconName(name: unknown): string {
  return typeof name === "string" && name.trim() ? name.trim() : "BookOpen";
}