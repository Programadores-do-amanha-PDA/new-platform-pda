import { buildUserUpdateData, isValueChanged } from "../utils/profile-form-utils";
import { User, ProfileFormSchemaT } from "../types";

/**
 * Test suite for profile-form-utils
 * Tests utility functions for building user update data and checking email changes
 */
describe("profile-form-utils", () => {
    /**
     * Mock data for tests
     */
    const mockCurrentUser: User = {
        id: "user-123",
        email: "john@example.com",
        user_metadata: {},
        app_metadata: {},
        aud: "authenticated",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        profile: {
            id: "profile-123",
            full_name: "John Doe",
            bio: "Software Developer",
            user_role: { id: 2, role: "admin" },
            avatar_url: null,
            created_at: new Date("2024-01-01T00:00:00Z"),
            updated_at: new Date("2024-01-01T00:00:00Z"),
        },
    };

    const mockFormData: ProfileFormSchemaT = {
        email: "john@example.com",
        fullName: "John Doe",
        bio: "Software Developer",
        newPassword: "",
        confirmNewPassword: "",
    };

    describe("buildUserUpdateData", () => {
        it("should return empty object when no fields have changed", () => {
            const result = buildUserUpdateData({ formData: mockFormData, currentUser: mockCurrentUser });

            expect(result).toEqual({});
        });

        it("should include email in update data when email is changed", () => {
            const formDataWithNewEmail: ProfileFormSchemaT = {
                ...mockFormData,
                email: "newemail@example.com",
            };

            const result = buildUserUpdateData({ formData: formDataWithNewEmail, currentUser: mockCurrentUser });

            expect(result.email).toBe("newemail@example.com");
        });

        it("should include password in update data when new password matches confirmation", () => {
            const formDataWithPassword: ProfileFormSchemaT = {
                ...mockFormData,
                newPassword: "NewPassword123!",
                confirmNewPassword: "NewPassword123!",
            };

            const result = buildUserUpdateData({ formData: formDataWithPassword, currentUser: mockCurrentUser });

            expect(result.password).toBe("NewPassword123!");
        });

        it("should not include password when new password does not match confirmation", () => {
            const formDataWithMismatchPassword: ProfileFormSchemaT = {
                ...mockFormData,
                newPassword: "NewPassword123!",
                confirmNewPassword: "DifferentPassword123!",
            };

            const result = buildUserUpdateData({ formData: formDataWithMismatchPassword, currentUser: mockCurrentUser });

            expect(result.password).toBeUndefined();
        });

        it("should not include password when only newPassword is provided", () => {
            const formDataWithOnlyNewPassword: ProfileFormSchemaT = {
                ...mockFormData,
                newPassword: "NewPassword123!",
                confirmNewPassword: "",
            };

            const result = buildUserUpdateData({ formData: formDataWithOnlyNewPassword, currentUser: mockCurrentUser });

            expect(result.password).toBeUndefined();
        });

        it("should not include password when only confirmNewPassword is provided", () => {
            const formDataWithOnlyConfirmPassword: ProfileFormSchemaT = {
                ...mockFormData,
                newPassword: "",
                confirmNewPassword: "NewPassword123!",
            };

            const result = buildUserUpdateData({ formData: formDataWithOnlyConfirmPassword, currentUser: mockCurrentUser });

            expect(result.password).toBeUndefined();
        });

        it("should handle multiple field changes simultaneously", () => {
            const formDataWithMultipleChanges: ProfileFormSchemaT = {
                email: "newemail@example.com",
                fullName: "Jane Smith",
                bio: "Product Manager",
                newPassword: "NewPassword123!",
                confirmNewPassword: "NewPassword123!",
            };

            const result = buildUserUpdateData({ formData: formDataWithMultipleChanges, currentUser: mockCurrentUser });

            expect(result.email).toBe("newemail@example.com");
            expect(result.password).toBe("NewPassword123!");
        });

        it("should not include metadata object when no metadata changes exist", () => {
            const result = buildUserUpdateData({ formData: mockFormData, currentUser: mockCurrentUser });

            expect(result.data).toBeUndefined();
        });

        it("should handle empty bio change to empty string", () => {
            const formDataWithEmptyBio: ProfileFormSchemaT = {
                ...mockFormData,
                bio: "",
            };

            const result = buildUserUpdateData({ formData: formDataWithEmptyBio, currentUser: mockCurrentUser });

            expect(result.data).toBeUndefined();
        });
    });

    describe("isValueChanged", () => {
        it("should return true when email is different", () => {
            const result = isValueChanged({ currentValue: "john@example.com", newValue: "newemail@example.com" });

            expect(result).toBe(true);
        });

        it("should return false when email is the same", () => {
            const result = isValueChanged({ currentValue: "john@example.com", newValue: "john@example.com" });

            expect(result).toBe(false);
        });

        it("should handle email comparison case-sensitively", () => {
            const result = isValueChanged({ currentValue: "John@Example.com", newValue: "john@example.com" });

            expect(result).toBe(true);
        });

        it("should return false when emails are equal with whitespace", () => {
            const result = isValueChanged({ currentValue: "john@example.com ", newValue: "john@example.com " });

            expect(result).toBe(false);
        });
    });
});
