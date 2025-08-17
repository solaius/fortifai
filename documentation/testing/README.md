# Testing Infrastructure

This document provides a comprehensive guide to the FortifAI testing infrastructure, including setup, configuration, and usage patterns.

## 🎯 Overview

The FortifAI project uses **Jest** as the primary testing framework with **TypeScript** support. The testing infrastructure is designed to provide:

- **Isolated Testing**: Each test runs in isolation with proper mocking
- **Fast Execution**: Optimized for quick feedback during development
- **Comprehensive Coverage**: Tests cover all major service layers
- **Mock-First Approach**: Uses mock data to avoid external dependencies

## 📊 Current Status

- **Total Test Suites**: 9
- **Passing**: 9 ✅
- **Failing**: 0 ❌
- **Success Rate**: 100% 🎉

### Test Suite Breakdown

| Test Suite | Status | Description |
|------------|--------|-------------|
| `api.test.ts` | ✅ Passing | API utility functions and response handling |
| `bindings.test.ts` | ✅ Passing | MCP server binding management service |
| `mockData.test.ts` | ✅ Passing | Mock data utilities and validation |
| `providers.test.ts` | ✅ Passing | Provider management service |
| `secrets.test.ts` | ✅ Passing | Secret reference management service |

## 🏗️ Architecture

### Test Structure
```
src/__tests__/
├── services/           # Service layer tests
│   ├── api.test.ts    # API utilities
│   ├── bindings.test.ts # Bindings service
│   ├── mockData.test.ts # Mock data utilities
│   ├── providers.test.ts # Providers service
│   └── secrets.test.ts  # Secrets service
└── __mocks__/         # Global mocks
    ├── svgMock.cjs    # SVG file mocks
    └── iconMock.cjs   # Icon component mocks
```

### Configuration Files
- **`jest.config.cjs`**: Main Jest configuration
- **`jest.setup.js`**: Global test setup and polyfills
- **`tsconfig.json`**: TypeScript configuration for tests

## ⚙️ Configuration

### Jest Configuration (`jest.config.cjs`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',           // Browser-like environment
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,                   // ES modules support
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
```

### Test Setup (`jest.setup.js`)

The setup file provides:
- **Jest DOM matchers** for better assertions
- **TextEncoder/TextDecoder polyfills** for React Router
- **Window location mocking** for consistent test environment
- **Media query mocking** for responsive design testing
- **Observer API mocks** (ResizeObserver, IntersectionObserver)
- **Console method configuration** for reduced test noise

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- --testPathPattern=bindings.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create binding"
```

### Test Execution Patterns

#### 1. Full Test Suite
```bash
npm test
```
- Runs all 9 test suites
- Provides summary of results
- Shows coverage information

#### 2. Specific Service Tests
```bash
# Test only bindings service
npm test -- --testPathPattern="bindings.test.ts$"

# Test only providers service  
npm test -- --testPathPattern="providers.test.ts$"

# Test only secrets service
npm test -- --testPathPattern="secrets.test.ts$"
```

#### 3. Pattern-Based Testing
```bash
# Test all service files
npm test -- --testPathPattern="services/.*\.test\.ts$"

# Test specific functionality
npm test -- --testNamePattern="create|update|delete"
```

## 🔧 Mock Data Strategy

### Core Principles

1. **Environment-Based Mocking**: Mock data is used in `development` and `test` environments
2. **Service Isolation**: Each service has its own mock data and dependencies
3. **Realistic Data**: Mock objects conform to actual TypeScript interfaces
4. **Fallback Logic**: Services gracefully fall back to mock data on API failures

### Mock Data Sources

- **`src/services/mockData.ts`**: Central mock data definitions
- **Service-specific mocks**: Each service includes its own mock data
- **Test-specific mocks**: Individual tests can override mock behavior

### Mock Data Usage

```typescript
// Check if mock data should be used
if (shouldUseMockData()) {
  return mockData;
}

// Fallback to mock data in development
if (process.env.NODE_ENV === 'development') {
  console.warn('🔄 Falling back to mock data due to API failure');
  return mockData;
}
```

## 🚀 Service Testing Patterns

### 1. Bindings Service (`bindings.test.ts`)

**Key Features:**
- Mocks `secretsService` and `providersService` dependencies
- Tests CRUD operations with mock data
- Validates API response structures
- Tests search and filtering functionality

**Mock Strategy:**
```typescript
// Mock dependencies
jest.mock('../../services/secrets');
jest.mock('../../services/providers');

// Setup mock implementations
const mockSecretsService = {
  getReference: jest.fn().mockResolvedValue(mockSecretReferences[0])
};

const mockProvidersService = {
  getProvider: jest.fn().mockResolvedValue(mockProviders[0])
};
```

### 2. Providers Service (`providers.test.ts`)

**Key Features:**
- Tests provider CRUD operations
- Mocks `VaultService` for external dependencies
- Handles provider type-specific logic
- Tests service initialization

**Mock Strategy:**
```typescript
// Mock VaultService
const mockVaultService = {
  authenticateWithAppRole: jest.fn().mockResolvedValue(true),
  getHealth: jest.fn().mockResolvedValue({
    initialized: true,
    sealed: false,
    lastCheck: new Date().toISOString()
  })
};
```

### 3. Secrets Service (`secrets.test.ts`)

**Key Features:**
- Tests secret reference management
- Handles complex metadata structures
- Tests lifecycle policies and access control
- Mocks provider service dependencies

**Mock Strategy:**
```typescript
// Mock providers service
jest.mock('../../services/providers', () => ({
  providersService: {
    getProvider: jest.fn().mockResolvedValue(null),
    getProviderService: jest.fn().mockReturnValue(null)
  }
}));
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Memory Issues
**Symptoms**: Tests run for extended periods or crash with heap errors
**Solution**: Check for infinite loops in service methods, especially in `catch` blocks

#### 2. TypeScript Errors
**Symptoms**: Compilation failures during testing
**Solution**: Ensure mock objects conform to actual interfaces

#### 3. Service Dependencies
**Symptoms**: Tests fail due to unmocked service calls
**Solution**: Mock all external service dependencies using `jest.mock()`

#### 4. API Response Mismatches
**Symptoms**: Tests fail with "Cannot read properties of undefined" errors
**Solution**: Ensure mock API responses match expected `ApiResponse` structure

### Debugging Tips

1. **Use Verbose Output**: `npm test -- --verbose`
2. **Run Single Tests**: Focus on failing test suites
3. **Check Console Logs**: Look for warning messages about mock data fallbacks
4. **Verify Mock Data**: Ensure mock objects have all required properties

## 📈 Performance Optimization

### Current Optimizations

1. **Mock-First Approach**: Services check for mock data before making API calls
2. **Environment Detection**: Automatic mock data usage in test environment
3. **Dependency Mocking**: External services are mocked to prevent real API calls
4. **Efficient Data Structures**: Mock data uses optimized data structures

### Future Improvements

1. **Parallel Test Execution**: Configure Jest for parallel test runs
2. **Test Data Factories**: Implement factories for generating test data
3. **Performance Monitoring**: Add test execution time tracking
4. **Memory Profiling**: Monitor memory usage during test execution

## 🔄 Maintenance

### Regular Tasks

1. **Update Mock Data**: Keep mock data in sync with actual interfaces
2. **Review Test Coverage**: Ensure new features have corresponding tests
3. **Update Dependencies**: Keep testing libraries up to date
4. **Performance Review**: Monitor test execution times

### Best Practices

1. **Write Tests First**: Follow TDD principles when possible
2. **Keep Tests Simple**: Each test should focus on one behavior
3. **Use Descriptive Names**: Test names should clearly describe what's being tested
4. **Mock External Dependencies**: Never let tests make real API calls

---

*This documentation covers the complete testing infrastructure. For specific implementation details, refer to the individual test files and service implementations.*
