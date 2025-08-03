/** @type {import('jest').Config} */
export default {
  preset: '@remix-run/dev/jest-preset',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/entry.client.tsx',
    '!app/entry.server.tsx',
    '!app/root.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}'
  ],
  moduleNameMapping: {
    '^~/(.*)$': '<rootDir>/app/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@remix-run|remix))'
  ]
};