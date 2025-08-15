"use client";
import * as LucideIcons from "lucide-react";
import { isValidIconName, kebabToPascalCase } from "@/utils/icon-utils";

type Props = {
  name: unknown;
  className?: string;
};

// Get safe icon name and validate it exists in our icons data
function getSafeIconName(name: unknown): string {
  if (typeof name !== "string" || !name.trim()) {
    return "BookOpen";
  }

  const iconName = name.trim();

  // Check if the icon exists in our icons data
  if (!isValidIconName(iconName)) {
    return "BookOpen";
  }

  return kebabToPascalCase(iconName);
}

export function DynamicLucideIcon({ name, className }: Props) {
  const iconName = getSafeIconName(name);

  // Type-safe access to Lucide icons
  const LucideIconsRecord = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const Icon = LucideIconsRecord[iconName];

  if (!Icon) {
    return <LucideIcons.BookOpen className={className} />;
  }

  return <Icon className={className} />;
}
