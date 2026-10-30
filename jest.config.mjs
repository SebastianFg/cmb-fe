/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/config/**/*.{ts,tsx}',
    'src/modules/auth/**/*.{ts,tsx}',
    'src/router/**/*.{ts,tsx}',
    'src/shared/components/can/**/*.{ts,tsx}',
    'src/shared/hooks/use-can.ts',
    '!src/**/*.d.ts',
    // Replaced by tests/mocks/env-config.ts through moduleNameMapper, so the
    // real module is never loaded under Jest.
    '!src/config/env-config.ts',
    '!src/**/types/**',
    '!src/**/*.types.ts',
    '!src/app/main.tsx',
  ],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/config/env-config$': '<rootDir>/tests/mocks/env-config.ts',
    '^\\./env-config$': '<rootDir>/tests/mocks/env-config.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/{src,tests}/**/?(*.)+(test|spec).{ts,tsx}'],
  transform: {
    '^.+\\.[jt]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
};

export default config;
