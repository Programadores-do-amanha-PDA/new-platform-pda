import {
    REGEX_FOR_EMAIL_VALIDATION,
    REGEX_FOR_PASSWORD_VALIDATION,
    REGEX_FOR_FULL_NAME_VALIDATION,
} from "../user-regex-validations";

describe("User Regex Validations", () => {
    describe("REGEX_FOR_EMAIL_VALIDATION", () => {
        it("should validate correct email formats", () => {
            const validEmails = [
                "user@example.com",
                "john.doe@company.co.uk",
                "test+tag@domain.org",
                "user123@test-domain.com",
                "a@b.co",
            ];

            validEmails.forEach((email) => {
                expect(REGEX_FOR_EMAIL_VALIDATION.test(email)).toBe(true);
            });
        });

        it("should reject invalid email formats", () => {
            const invalidEmails = [
                "invalid.email",
                "@example.com",
                "user@",
                "user @example.com",
                "user@.com",
                "user@example",
                "user..name@example.com",
                "user@example..com",
            ];

            invalidEmails.forEach((email) => {
                expect(REGEX_FOR_EMAIL_VALIDATION.test(email)).toBe(false);
            });
        });

        it("should handle edge cases", () => {
            expect(REGEX_FOR_EMAIL_VALIDATION.test("")).toBe(false);
            expect(REGEX_FOR_EMAIL_VALIDATION.test("   ")).toBe(false);
        });
    });

    describe("REGEX_FOR_PASSWORD_VALIDATION", () => {
        it("should validate correct password formats", () => {
            const validPasswords = ["ValidPass123!", "MyP@ssw0rd", "Secure#Pass99", "TestPassword1$", "Complex@Pass2024"];

            validPasswords.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(true);
            });
        });

        it("should reject passwords without uppercase letters", () => {
            const invalidPasswords = ["validpass123!", "myp@ssw0rd", "secure#pass99"];

            invalidPasswords.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(false);
            });
        });

        it("should reject passwords without lowercase letters", () => {
            const invalidPasswords = ["VALIDPASS123!", "MYP@SSW0RD", "SECURE#PASS99"];

            invalidPasswords.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(false);
            });
        });

        it("should reject passwords without numbers", () => {
            const invalidPasswords = ["ValidPassword!", "MyPassWord@", "SecurePass#"];

            invalidPasswords.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(false);
            });
        });

        it("should reject passwords without special characters", () => {
            const invalidPasswords = ["ValidPass123", "MyPassword0", "SecurePass99"];

            invalidPasswords.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(false);
            });
        });

        it("should reject passwords shorter than 7 characters", () => {
            const invalidPasswords = ["Pass1!", "Pwd0@", "Sec#1"];

            invalidPasswords.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(false);
            });
        });

        it("should accept passwords with minimum length of 7 characters", () => {
            expect(REGEX_FOR_PASSWORD_VALIDATION.test("Pass1!a")).toBe(true);
        });

        it("should accept passwords with all special characters variations", () => {
            const specialChars = [
                "Pass!word1",
                "Pass@word1",
                "Pass#word1",
                "Pass$word1",
                "Pass%word1",
                "Pass^word1",
                "Pass&word1",
                "Pass*word1",
            ];

            specialChars.forEach((password) => {
                expect(REGEX_FOR_PASSWORD_VALIDATION.test(password)).toBe(true);
            });
        });
    });

    describe("REGEX_FOR_FULL_NAME_VALIDATION", () => {
        it("should validate correct full name formats", () => {
            const validNames = [
                "John Doe",
                "Maria Santos Silva",
                "Anna Johnson Brown",
                "Joseph Smith",
                "Catherine Elizabeth",
                "Alexander Graham",
            ];

            validNames.forEach((name) => {
                expect(REGEX_FOR_FULL_NAME_VALIDATION.test(name)).toBe(true);
            });
        });

        it("should reject names with less than 4 characters in first part", () => {
            const invalidNames = ["Jon Doe", "Max Miller", "Tim Brown", "Leo Green"];

            invalidNames.forEach((name) => {
                expect(REGEX_FOR_FULL_NAME_VALIDATION.test(name)).toBe(false);
            });
        });

        it("should reject names with only one word", () => {
            const invalidNames = ["John", "Maria", "Alexander", "Catherine"];

            invalidNames.forEach((name) => {
                expect(REGEX_FOR_FULL_NAME_VALIDATION.test(name)).toBe(false);
            });
        });

        it("should reject names with numbers", () => {
            const invalidNames = ["John123 Doe", "Maria2 Santos", "John5 Doe3"];

            invalidNames.forEach((name) => {
                expect(REGEX_FOR_FULL_NAME_VALIDATION.test(name)).toBe(false);
            });
        });

        it("should reject names with special characters", () => {
            const invalidNames = ["John! Doe", "Maria@ Santos", "John# Doe$", "John-Doe O'Brien"];

            invalidNames.forEach((name) => {
                expect(REGEX_FOR_FULL_NAME_VALIDATION.test(name)).toBe(false);
            });
        });

        it("should reject names with extra spaces", () => {
            const invalidNames = ["John  Doe", "Maria   Santos", "John    Doe"];

            invalidNames.forEach((name) => {
                expect(REGEX_FOR_FULL_NAME_VALIDATION.test(name)).toBe(false);
            });
        });

        it("should accept maximum of 3 name parts", () => {
            expect(REGEX_FOR_FULL_NAME_VALIDATION.test("John Doe Smith")).toBe(true);
        });

        it("should accept more than 3 name parts", () => {
            expect(REGEX_FOR_FULL_NAME_VALIDATION.test("John Doe Smith Johnson")).toBe(true);
            expect(REGEX_FOR_FULL_NAME_VALIDATION.test("John Doe Smith Johnson Miller")).toBe(true);
        });

        it("should handle case insensitivity", () => {
            expect(REGEX_FOR_FULL_NAME_VALIDATION.test("JOHN DOE")).toBe(true);
            expect(REGEX_FOR_FULL_NAME_VALIDATION.test("john doe")).toBe(true);
            expect(REGEX_FOR_FULL_NAME_VALIDATION.test("JoHn DoE")).toBe(true);
        });
    });
});
