import { iconsData } from "@/components/ui/icons-data";

/**
 * Get all available icon names from the icons data
 */
export function getAvailableIconNames(): string[] {
  return iconsData.map(icon => icon.name);
}

/**
 * Check if an icon name exists in our icons data
 */
export function isValidIconName(name: string): boolean {
  return iconsData.some(icon => icon.name === name);
}

/**
 * Search icons by category
 */
export function getIconsByCategory(category: string): string[] {
  return iconsData
    .filter(icon => icon.categories.includes(category))
    .map(icon => icon.name);
}

/**
 * Search icons by tag
 */
export function getIconsByTag(tag: string): string[] {
  return iconsData
    .filter(icon => icon.tags.some(iconTag => 
      iconTag.toLowerCase().includes(tag.toLowerCase())
    ))
    .map(icon => icon.name);
}

/**
 * Convert kebab-case to PascalCase for Lucide icon names
 */
export function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}