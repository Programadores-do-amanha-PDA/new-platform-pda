import { buildUserUpdateData, isValueChanged } from "../utils/profile-form-utils";
import { AuthUserWithProfile, ProfileFormSchemaT } from "../types";

/**
 * Test suite for profile-form-utils
 * Tests utility functions for building user update data and checking email changes
 */
describe("profile-form-utils", () => {
    /**
     * Mock data for tests
     */
    const mockCurrentUser: AuthUserWithProfile = {
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

        it("should include full_name in metadata when full name is changed", () => {
            const formDataWithNewName: ProfileFormSchemaT = {
                ...mockFormData,
                fullName: "Jane Doe",
            };

            const result = buildUserUpdateData({ formData: formDataWithNewName, currentUser: mockCurrentUser });

            expect(result.data).toBeDefined();
            expect(result.data?.full_name).toBe("Jane Doe");
        });

        it("should include bio in metadata when bio is changed", () => {
            const formDataWithNewBio: ProfileFormSchemaT = {
                ...mockFormData,
                bio: "Senior Developer",
            };

            const result = buildUserUpdateData({ formData: formDataWithNewBio, currentUser: mockCurrentUser });

            expect(result.data).toBeDefined();
            expect(result.data?.bio).toBe("Senior Developer");
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
            expect(result.data?.full_name).toBe("Jane Smith");
            expect(result.data?.bio).toBe("Product Manager");
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

        it("should handle user profile being null", () => {
            const userWithoutProfile: AuthUserWithProfile = {
                ...mockCurrentUser,
                profile: null,
            };

            const formDataWithChanges: ProfileFormSchemaT = {
                ...mockFormData,
                fullName: "New Name",
            };

            const result = buildUserUpdateData({ formData: formDataWithChanges, currentUser: userWithoutProfile });

            expect(result.data).toBeDefined();
            expect(result.data?.full_name).toBe("New Name");
        });

        it("should handle user profile bio being null", () => {
            const userWithoutBio: AuthUserWithProfile = {
                ...mockCurrentUser,
                profile: {
                    ...mockCurrentUser.profile!,
                    bio: null,
                },
            };

            const formDataWithBio: ProfileFormSchemaT = {
                ...mockFormData,
                bio: "New Bio",
            };

            const result = buildUserUpdateData({ formData: formDataWithBio, currentUser: userWithoutBio });

            expect(result.data?.bio).toBe("New Bio");
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
