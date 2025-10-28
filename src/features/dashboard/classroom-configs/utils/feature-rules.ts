import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/admin/sidebar-config";
import {
  ClassroomFeatureKeyT,
  UserModeFeatureRuleT,
  ClassroomConfigUserModeT,
} from "../types";

/**
 * Default feature exclusion configuration
 * Defines which features should be hidden or excluded from metrics by default
 */
export const DEFAULT_FEATURE_EXCLUSIONS = {
  hiddenFeatures: ["coodesh", "projects", "zoom"] as ClassroomFeatureKeyT[],
  excludedFromMetrics: ["overview", "zoom"] as ClassroomFeatureKeyT[],
} as const;

/**
 * Gets all feature rules with proper default values and user mode overrides
 *
 * This function provides a comprehensive feature rule system that:
 * - Applies default visibility and metric aggregation rules
 * - Respects user mode specific overrides when available
 * - Maintains type safety across all feature configurations
 *
 * @param currentUserMode - The current user mode configuration or null
 * @returns Array of feature rules with proper defaults and overrides
 *
 * @example
 * ```typescript
 * // Get default rules when no user mode is set
 * const defaultRules = getAllFeaturesRules(null);
 *
 * // Get rules with user mode overrides
 * const userRules = getAllFeaturesRules(userMode);
 *
 * // Filter visible features
 * const visibleFeatures = userRules.filter(rule => rule.isVisible);
 * ```
 */
export const getAllFeaturesRules = (
  currentUserMode: ClassroomConfigUserModeT | null,
  defaultValue?: boolean
): UserModeFeatureRuleT[] => {
  const { hiddenFeatures, excludedFromMetrics } = DEFAULT_FEATURE_EXCLUSIONS;

  /**
   * Creates default feature rules based on exclusion lists
   */
  const createDefaultFeatureRules = (): UserModeFeatureRuleT[] => {
    return ADMIN_CLASSROOM_PAGES_KEYS.map(
      (feature): UserModeFeatureRuleT => ({
        id: feature,
        isVisible: hiddenFeatures.includes(feature)
          ? undefined
          : typeof defaultValue === "boolean"
          ? defaultValue
          : true,
        aggregateInMetric: excludedFromMetrics.includes(feature)
          ? undefined
          : typeof defaultValue === "boolean"
          ? defaultValue
          : true,
      })
    );
  };

  /**
   * Merges user mode rules with default rules
   */
  const mergeWithUserModeRules = (
    defaultRules: UserModeFeatureRuleT[]
  ): UserModeFeatureRuleT[] => {
    // Return default rules if no user mode is provided
    if (
      !currentUserMode ||
      !currentUserMode.featuresRules ||
      currentUserMode.featuresRules.length === 0
    ) {
      return defaultRules;
    }

    return defaultRules.map((defaultRule) => {
      const userRule = currentUserMode.featuresRules.find(
        (rule) => rule.id === defaultRule.id
      );

      // Use user rule if it exists and is properly defined
      if (userRule && isValidFeatureRule(userRule)) {
        return {
          ...userRule,
          isVisible: hiddenFeatures.includes(userRule.id)
            ? undefined
            : userRule.isVisible,
          aggregateInMetric: excludedFromMetrics.includes(userRule.id)
            ? undefined
            : userRule.aggregateInMetric,
        };
      }

      // Fall back to default rule
      return defaultRule;
    });
  };

  /**
   * Validates that a feature rule has all required properties
   */
  const isValidFeatureRule = (
    rule: UserModeFeatureRuleT
  ): rule is UserModeFeatureRuleT => {
    return (
      typeof rule === "object" &&
      rule !== null &&
      typeof rule.id === "string" &&
      typeof rule.isVisible === "boolean" &&
      typeof rule.aggregateInMetric === "boolean"
    );
  };

  // Generate default rules and merge with user mode overrides
  const defaultRules = createDefaultFeatureRules();
  return mergeWithUserModeRules(defaultRules);
};
