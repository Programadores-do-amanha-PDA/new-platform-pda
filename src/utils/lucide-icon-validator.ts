import * as LucideIcons from "lucide-react";

/**
 * Valida se um nome de ícone existe no Lucide React
 */
export function isValidLucideIcon(iconName: string): boolean {
  if (typeof iconName !== "string" || !iconName.trim()) {
    return false;
  }

  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[
    iconName.trim()
  ];
  
  return typeof Icon === "function";
}

/**
 * Retorna um nome de ícone válido ou um fallback
 */
export function getValidIconName(iconName: unknown): string {
  if (typeof iconName === "string" && iconName.trim() && isValidLucideIcon(iconName.trim())) {
    return iconName.trim();
  }
  
  return "BookOpen"; // Fallback padrão
}

/**
 * Lista de ícones comuns para usar como sugestões
 */
export const commonIcons = [
  "BookOpen",
  "Users",
  "Calendar",
  "Clock",
  "Star",
  "Heart",
  "Home",
  "Settings",
  "User",
  "Mail",
] as const;