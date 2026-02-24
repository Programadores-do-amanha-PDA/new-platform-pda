import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';
import { join } from 'path';
import nextJest from 'next/jest.js';

// Ler o tsconfig.json diretamente
const tsconfigPath = join(process.cwd(), 'tsconfig.json');
const tsconfigContent = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(tsconfigContent.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.test.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  transformIgnorePatterns: ['node_modules/(?!(color|color-string)/)'],
};

export default createJestConfig(customJestConfig);