import Color, { ColorLike } from "color";
import { UserModeFormData, UserMode } from "../types";
import { getAllFeaturesRules, DEFAULT_FEATURE_EXCLUSIONS } from "./feature-rules";

/**
 * Handles color value conversion from various formats to hex
 * @param colorValue - Color value in various formats (array, string, object)
 * @returns Hex color string or null if invalid
 */
export const processColorValue = (colorValue: ColorLike): string | null => {
    try {
        let hex: string;

        if (Array.isArray(colorValue)) {
            // If it's an RGBA array
            const [r, g, b, a] = colorValue;
            const color = Color.rgb(r, g, b, a || 1);
            hex = color.hex();
        } else if (typeof colorValue === "string") {
            // If it's already a string (hex, rgb, etc.)
            hex = Color(colorValue).hex();
        } else if (colorValue && typeof colorValue === "object") {
            // If it's an object with color properties
            hex = Color(colorValue).hex();
        } else {
            return null; // Invalid color format
        }

        return hex;
    } catch (error) {
        console.error("Error processing color:", error);
        return null;
    }
};

/**
 * Gets default form values for user mode creation/editing
 * @param currentUserMode - Existing user mode data (for editing)
 * @returns Default form values
 */
export const getDefaultUserModeFormValues = (currentUserMode?: UserMode | null): UserModeFormData => {
    if (currentUserMode) {
        // Merge existing rules with available features to ensure all features are present
        const mergedFeaturesRules = getAllFeaturesRules(currentUserMode, false);

        return {
            title: currentUserMode.title,
            key: currentUserMode.key,
            color: currentUserMode.color,
            featuresRules: mergedFeaturesRules,
        };
    }

    return {
        title: "",
        key: "",
        color: "#3bf6a8",
        featuresRules: getAllFeaturesRules(currentUserMode || null),
    };
};

/**
 * Creates a new user mode object from form data
 * @param formData - Validated form data
 * @param currentUserMode - Existing user mode (for editing)
 * @returns New user mode object
 */
export const createUserModeFromFormData = (formData: UserModeFormData, currentUserMode?: UserMode | null): UserMode => {
    return {
        id: currentUserMode?.id || crypto.randomUUID(),
        title: formData.title.trim(),
        key: formData.key.trim(),
        color: formData.color,
        featuresRules: formData.featuresRules.map((rule) => {
            const { hiddenFeatures, excludedFromMetrics } = DEFAULT_FEATURE_EXCLUSIONS;

            return {
                id: rule.id,
                isVisible: hiddenFeatures.includes(rule.id) ? undefined : rule.isVisible,
                aggregateInMetric: excludedFromMetrics.includes(rule.id) ? undefined : rule.aggregateInMetric,
            };
        }),
        created_at: currentUserMode?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
};

/**
 * Updates user modes array with new or edited user mode
 * @param currentUserModes - Current array of user modes
 * @param newUserMode - New or updated user mode
 * @param isEditing - Whether this is an edit operation
 * @returns Updated user modes array
 */
export const updateUserModesArray = (currentUserModes: UserMode[], newUserMode: UserMode, isEditing: boolean): UserMode[] => {
    if (isEditing) {
        return currentUserModes.map((userMode) => (userMode.id === newUserMode.id ? newUserMode : userMode));
    } else {
        return [...currentUserModes, newUserMode];
    }
};
