jest.mock("@/providers/admin/sidebar-config", () => ({
    ADMIN_CLASSROOM_PAGES_KEYS: ["overview", "kpis", "attendance", "satisfaction", "activities", "projects", "coodesh", "zoom"],
}));

// Mock zod to avoid import issues
jest.mock("zod/mini", () => ({
    __esModule: true,
    default: {
        object: jest.fn(),
        string: jest.fn(),
        number: jest.fn(),
        boolean: jest.fn(),
        array: jest.fn(),
        enum: jest.fn(),
        optional: jest.fn(),
    },
}));

import { ADMIN_CLASSROOM_PAGES_KEYS } from "@/providers/admin/sidebar-config";
import { UserMode, UserModeFeatureRule } from "../types";
import { DEFAULT_FEATURE_EXCLUSIONS, getAllFeaturesRules } from "../utils/feature-rules";

describe("Feature Rules Utilities", () => {
    const mockUserMode: UserMode = {
        id: "1",
        title: "Test Mode",
        key: "test-mode",
        color: "#000000",
        featuresRules: [
            {
                id: "kpis",
                isVisible: false,
                aggregateInMetric: false,
            },
            {
                id: "activities",
                isVisible: true,
                aggregateInMetric: true,
            },
        ],
    };

    const mockInvalidUserMode: UserMode = {
        id: "2",
        title: "Invalid Mode",
        key: "invalid-mode",
        color: "#000000",
        featuresRules: [
            {
                id: "kpis",
                isVisible: true,
                aggregateInMetric: true,
            },

            // Invalid rule
            {} as UserModeFeatureRule,
        ],
    };

    describe("DEFAULT_FEATURE_EXCLUSIONS", () => {
        it("should have correct default hidden features", () => {
            expect(DEFAULT_FEATURE_EXCLUSIONS.hiddenFeatures).toEqual(["projects", "coodesh", "zoom"]);
        });

        it("should have correct default excluded from metrics", () => {
            expect(DEFAULT_FEATURE_EXCLUSIONS.excludedFromMetrics).toEqual(["overview", "zoom"]);
        });
    });

    describe("getAllFeaturesRules", () => {
        describe("when no user mode is provided", () => {
            it("should return default rules for all features", () => {
                const result = getAllFeaturesRules(null);

                expect(result).toHaveLength(ADMIN_CLASSROOM_PAGES_KEYS.length);

                // Check default rules
                result.forEach((rule) => {
                    expect(rule).toEqual({
                        id: expect.any(String),
                        isVisible: expect.any(Boolean),
                        aggregateInMetric: expect.any(Boolean),
                    });
                });
            });

            it("should apply default visibility rules correctly", () => {
                const result = getAllFeaturesRules(null);

                const projectsRule = result.find((rule) => rule.id === "projects");
                const kpisRule = result.find((rule) => rule.id === "kpis");

                expect(projectsRule?.isVisible).toBe(false); // projects está em hiddenFeatures
                expect(kpisRule?.isVisible).toBe(true); // kpis não está em hiddenFeatures
            });

            it("should apply default metric aggregation rules correctly", () => {
                const result = getAllFeaturesRules(null);

                const zoomRule = result.find((rule) => rule.id === "zoom");
                const activitiesRule = result.find((rule) => rule.id === "activities");

                expect(zoomRule?.aggregateInMetric).toBe(false); // zoom está em excludedFromMetrics
                expect(activitiesRule?.aggregateInMetric).toBe(true); // activities não está em excludedFromMetrics
            });
        });

        describe("when user mode has no featuresRules", () => {
            it("should return default rules when featuresRules is empty array", () => {
                const userModeWithEmptyRules = { ...mockUserMode, featuresRules: [] };
                const result = getAllFeaturesRules(userModeWithEmptyRules);

                expect(result).toHaveLength(ADMIN_CLASSROOM_PAGES_KEYS.length);

                // Should use standard rules
                const kpisRule = result.find((rule) => rule.id === "kpis");
                expect(kpisRule?.isVisible).toBe(true); // Default value
            });
        });

        describe("when user mode has valid featuresRules", () => {
            it("should merge user rules with default rules", () => {
                const result = getAllFeaturesRules(mockUserMode);

                // User rules must be applied
                const kpisRule = result.find((rule) => rule.id === "kpis");
                const activitiesRule = result.find((rule) => rule.id === "activities");

                expect(kpisRule?.isVisible).toBe(false); // User  override
                expect(kpisRule?.aggregateInMetric).toBe(false); // User  override
                expect(activitiesRule?.isVisible).toBe(true); // User  override
                expect(activitiesRule?.aggregateInMetric).toBe(true); // User  override
            });

            it("should use default rules for features not overridden by user", () => {
                const result = getAllFeaturesRules(mockUserMode);

                // Features not specified in user mode should retain default values
                const attendanceRule = result.find((rule) => rule.id === "attendance");
                const projectsRule = result.find((rule) => rule.id === "projects");

                expect(attendanceRule?.isVisible).toBe(true); // Default value
                expect(projectsRule?.isVisible).toBe(false); // Default value (excluded)
            });
        });

        describe("when user mode has invalid feature rules", () => {
            it("should fall back to default rules for invalid rules", () => {
                const result = getAllFeaturesRules(mockInvalidUserMode);

                // A valid rule must be applied
                const kpisRule = result.find((rule) => rule.id === "kpis");
                expect(kpisRule?.isVisible).toBe(true); // Valid user mode

                // Invalid rules should use the default
                const otherRules = result.filter((rule) => rule.id !== "kpis");
                otherRules.forEach((rule) => {
                    expect(rule.isVisible).toBe(
                        !DEFAULT_FEATURE_EXCLUSIONS.hiddenFeatures.includes(
                            rule.id as (typeof DEFAULT_FEATURE_EXCLUSIONS.hiddenFeatures)[number],
                        ),
                    );
                });
            });

            it("should handle rules with missing properties", () => {
                const userModeWithPartialRules: UserMode = {
                    ...mockUserMode,
                    featuresRules: [
                        {
                            id: "kpis",
                            // Missing isVisible and aggregateInMetric
                        } as UserModeFeatureRule,
                    ],
                };

                const result = getAllFeaturesRules(userModeWithPartialRules);
                const kpisRule = result.find((rule) => rule.id === "kpis");

                // When properties are undefined in the userRule, applyUserModeOverrides
                // returns undefined, which is the current behavior of the implementation.
                expect(kpisRule?.isVisible).toBeUndefined();
                expect(kpisRule?.aggregateInMetric).toBeUndefined();
            });
        });

        describe("edge cases", () => {
            it("should handle user mode with non-existent feature IDs", () => {
                const userModeWithInvalidFeatures: UserMode = {
                    ...mockUserMode,
                    featuresRules: [
                        {
                            id: "non-existent-feature",
                            isVisible: false,
                            aggregateInMetric: false,
                        },
                    ],
                };

                const result = getAllFeaturesRules(userModeWithInvalidFeatures);

                // It should not affect existing features.
                expect(result).toHaveLength(ADMIN_CLASSROOM_PAGES_KEYS.length);

                // The invalid rule should not appear in the result.
                const invalidRule = result.find((rule) => rule.id === "non-existent-feature");
                expect(invalidRule).toBeUndefined();
            });
        });

        describe("type safety and validation", () => {
            it("should validate all returned rules have correct structure", () => {
                const result = getAllFeaturesRules(mockUserMode);

                result.forEach((rule) => {
                    expect(rule).toMatchObject({
                        id: expect.any(String),
                        isVisible: expect.any(Boolean),
                        aggregateInMetric: expect.any(Boolean),
                    });
                });
            });

            it("should maintain feature IDs integrity", () => {
                const result = getAllFeaturesRules(mockUserMode);

                const resultIds = result.map((rule) => rule.id).sort();
                const expectedIds = [...ADMIN_CLASSROOM_PAGES_KEYS].sort();

                expect(resultIds).toEqual(expectedIds);
            });
        });
    });
});
