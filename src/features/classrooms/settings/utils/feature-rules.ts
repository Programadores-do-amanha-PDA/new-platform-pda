import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/features/classrooms/utils/constants";
import { FeatureKey, UserModeFeatureRule, UserMode } from "../types";

/**
 * Default feature exclusion configuration
 * Defines which features should be hidden or excluded from metrics by default
 */
export const DEFAULT_FEATURE_EXCLUSIONS = {
    hiddenFeatures: ["projects", "coodesh", "zoom"] as FeatureKey[],
    excludedFromMetrics: ["overview", "zoom"] as FeatureKey[],
} as const;

/**
 * Validates that a feature rule has all required properties
 */
const isValidFeatureRule = (rule: UserModeFeatureRule): boolean => {
    return (
        typeof rule === "object" &&
        rule !== null &&
        typeof rule.id === "string" &&
        (rule.isVisible === undefined || typeof rule.isVisible === "boolean") &&
        (rule.aggregateInMetric === undefined || typeof rule.aggregateInMetric === "boolean")
    );
};

/**
 * Determines the value for a feature property based on exclusions and defaults
 */
const getFeaturePropertyValue = (
    feature: FeatureKey,
    exclusionList: readonly FeatureKey[],
    defaultValue?: boolean,
): boolean => {
    if (exclusionList.includes(feature)) {
        return false;
    }
    return defaultValue ?? true;
};

/**
 * Creates a default feature rule for a given feature
 */
const createDefaultFeatureRule = (feature: FeatureKey, defaultValue?: boolean): UserModeFeatureRule => {
    const { hiddenFeatures, excludedFromMetrics } = DEFAULT_FEATURE_EXCLUSIONS;

    return {
        id: feature,
        isVisible: getFeaturePropertyValue(feature, hiddenFeatures, defaultValue),
        aggregateInMetric: getFeaturePropertyValue(feature, excludedFromMetrics, defaultValue),
    };
};

/**
 * Applies user mode overrides to a default rule while respecting exclusions
 */
const applyUserModeOverrides = (defaultRule: UserModeFeatureRule, userRule: UserModeFeatureRule): UserModeFeatureRule => {
    const { hiddenFeatures, excludedFromMetrics } = DEFAULT_FEATURE_EXCLUSIONS;

    return {
        ...userRule,
        isVisible: hiddenFeatures.includes(userRule.id as FeatureKey) ? false : userRule.isVisible,
        aggregateInMetric: excludedFromMetrics.includes(userRule.id as FeatureKey) ? false : userRule.aggregateInMetric,
    };
};

/**
 * Checks if user mode has valid feature rules
 */
const hasValidUserModeRules = (userMode: UserMode | null): boolean => {
    return !!userMode?.featuresRules?.length;
};

/**
 * Gets all feature rules with proper default values and user mode overrides
 *
 * This function provides a comprehensive feature rule system that:
 * - Applies default visibility and metric aggregation rules
 * - Respects user mode specific overrides when available
 * - Maintains type safety across all feature configurations
 *
 * @param currentUserMode - The current user mode configuration or null
 * @param defaultValue - Optional default value for features not in exclusion lists
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
export const getAllFeaturesRules = (currentUserMode: UserMode | null, defaultValue?: boolean): UserModeFeatureRule[] => {
    // Create default rules for all features
    const defaultRules = ADMIN_CLASSROOM_PAGES_KEYS.map((feature) => createDefaultFeatureRule(feature, defaultValue));

    // Return default rules if no valid user mode is provided
    if (!hasValidUserModeRules(currentUserMode)) {
        return defaultRules;
    }

    // Merge user mode rules with defaults
    return defaultRules.map((defaultRule) => {
        const userRule = currentUserMode!.featuresRules.find((rule) => rule.id === defaultRule.id);

        if (userRule && isValidFeatureRule(userRule)) {
            return applyUserModeOverrides(defaultRule, userRule);
        }

        return defaultRule;
    });
};
