// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.ts`

// Learn more: https://jestjs.io/docs/configuration#setupfilesafterenv-array
import "@testing-library/jest-dom";

// Mock the color library to avoid ES module issues
jest.mock("color", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return jest.fn().mockImplementation((_: unknown) => ({
    hex: () => "#000000",
    rgb: () => ({ r: 0, g: 0, b: 0 }),
    hsl: () => ({ h: 0, s: 0, l: 0 }),
  }));
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
  useParams() {
    return {};
  },
}));

// Mock environment variables
Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true,
  configurable: true,
});
