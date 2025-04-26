export default {
  preset: 'ts-jest',              // 🔥 this automatically uses ts-jest
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  //setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};