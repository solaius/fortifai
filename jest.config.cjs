module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(svg)$': '<rootDir>/__mocks__/svgMock.cjs',
    '^@patternfly/react-icons/dist/esm/icons/(.*)$': '<rootDir>/__mocks__/iconMock.cjs',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@patternfly|@testing-library)/)'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
}; 