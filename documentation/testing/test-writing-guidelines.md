# Test Writing Guidelines

This document provides comprehensive guidelines for writing tests in the FortifAI project, covering best practices, patterns, and common pitfalls to avoid.

## 🎯 Test Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation when possible
2. **Isolation**: Each test should be independent and not affect other tests
3. **Readability**: Tests should be self-documenting and easy to understand
4. **Maintainability**: Tests should be easy to update when requirements change
5. **Performance**: Tests should run quickly and efficiently

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something specific when given certain conditions', async () => {
      // Arrange - Set up test data and mocks
      const mockData = createMockData();
      const mockService = createMockService();
      
      // Act - Execute the method being tested
      const result = await service.methodName(mockData);
      
      // Assert - Verify the expected behavior
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
  });
});
```

## 📝 Test Naming Conventions

### Describe Blocks

- **Service Level**: `describe('ServiceName', () => { ... })`
- **Method Level**: `describe('methodName', () => { ... })`
- **Scenario Level**: `describe('when condition is met', () => { ... })`

### Test Cases

- **Positive Cases**: `it('should return success when valid data is provided', () => { ... })`
- **Negative Cases**: `it('should throw error when invalid data is provided', () => { ... })`
- **Edge Cases**: `it('should handle empty array gracefully', () => { ... })`
- **Async Operations**: `it('should resolve promise with expected data', async () => { ... })`

### Examples

```typescript
describe('BindingsService', () => {
  describe('createBinding', () => {
    it('should create binding successfully with valid data', async () => { ... });
    it('should throw error when required fields are missing', async () => { ... });
    it('should handle API failures gracefully', async () => { ... });
  });
  
  describe('listBindings', () => {
    it('should return all bindings when no filter is applied', async () => { ... });
    it('should filter bindings by provider type', async () => { ... });
    it('should return empty array when no bindings exist', async () => { ... });
  });
});
```

## 🔧 Mocking Strategies

### Service Dependencies

Always mock external service dependencies to ensure test isolation:

```typescript
// Mock the entire module
jest.mock('../../services/secrets');
jest.mock('../../services/providers');

// Get the mocked module
const mockSecretsService = require('../../services/secrets');
const mockProvidersService = require('../../services/providers');

// Setup mock implementations
beforeEach(() => {
  mockSecretsService.getReference.mockResolvedValue(mockSecretReference);
  mockProvidersService.getProvider.mockResolvedValue(mockProvider);
});
```

### API Calls

Mock API calls to prevent real network requests:

```typescript
// Mock axios or fetch
const mockApi = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Setup mock responses
mockApi.post.mockResolvedValue({
  success: true,
  data: mockResponseData
});
```

### Complex Objects

Create realistic mock objects that conform to actual interfaces:

```typescript
const mockBinding: MCPServerBinding = {
  id: 'binding-123',
  name: 'Test Binding',
  description: 'A test binding for unit testing',
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  runtimeConfig: {
    environment: 'test',
    region: 'us-east-1',
    version: '1.0.0'
  },
  validationStatus: {
    isValid: true,
    errors: [],
    warnings: [],
    lastValidated: '2025-01-01T00:00:00Z'
  }
};
```

## 🧪 Test Data Management

### Mock Data Sources

1. **Central Mock Data**: Use `src/services/mockData.ts` for common mock objects
2. **Service-Specific Mocks**: Define mock data within each service file
3. **Test-Specific Mocks**: Create custom mock data for specific test scenarios

### Data Factories

Create helper functions to generate test data:

```typescript
const createMockBinding = (overrides: Partial<MCPServerBinding> = {}): MCPServerBinding => ({
  id: `binding-${Date.now()}`,
  name: 'Test Binding',
  description: 'A test binding',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  runtimeConfig: {
    environment: 'test',
    region: 'us-east-1',
    version: '1.0.0'
  },
  validationStatus: {
    isValid: true,
    errors: [],
    warnings: [],
    lastValidated: new Date().toISOString()
  },
  ...overrides
});

// Usage
const binding = createMockBinding({ status: 'inactive' });
```

### Test Data Cleanup

Ensure test data is properly cleaned up:

```typescript
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset service state
  service.clear();
  
  // Setup fresh mock data
  setupMockData();
});

afterEach(() => {
  // Clean up any side effects
  cleanup();
});
```

## ✅ Assertions and Expectations

### Jest Matchers

Use appropriate Jest matchers for different types of assertions:

```typescript
// Equality
expect(result).toBe(expectedValue);
expect(result).toEqual(expectedObject);
expect(result).toStrictEqual(expectedObject);

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeUndefined();

// Numbers
expect(result).toBeGreaterThan(0);
expect(result).toBeLessThan(100);
expect(result).toBeCloseTo(3.14, 2);

// Strings
expect(result).toContain('expected text');
expect(result).toMatch(/regex pattern/);
expect(result).toHaveLength(5);

// Arrays
expect(result).toHaveLength(3);
expect(result).toContain('item');
expect(result).toEqual(expect.arrayContaining(['item1', 'item2']));

// Objects
expect(result).toHaveProperty('key');
expect(result).toMatchObject({ key: 'value' });
expect(result).toEqual(expect.objectContaining({ key: 'value' }));

// Functions
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFunction).toHaveBeenCalledTimes(1);
```

### Async Testing

Handle asynchronous operations properly:

```typescript
// Promise resolution
it('should resolve with expected data', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

// Promise rejection
it('should reject with error', async () => {
  await expect(service.asyncMethod()).rejects.toThrow('Error message');
});

// Mock function calls
it('should call external service', async () => {
  await service.method();
  expect(mockExternalService.call).toHaveBeenCalledWith('expected arg');
});
```

## 🚫 Common Pitfalls to Avoid

### 1. Testing Implementation Details

❌ **Don't test implementation details:**
```typescript
// Bad - testing internal state
expect(service.internalArray).toHaveLength(3);
```

✅ **Do test public behavior:**
```typescript
// Good - testing public interface
expect(await service.getItems()).toHaveLength(3);
```

### 2. Over-Mocking

❌ **Don't mock everything:**
```typescript
// Bad - over-mocking
jest.mock('../../utils/dateFormatter');
jest.mock('../../utils/validator');
jest.mock('../../utils/logger');
```

✅ **Do mock only external dependencies:**
```typescript
// Good - mock only what's necessary
jest.mock('../../services/externalApi');
jest.mock('../../services/database');
```

### 3. Complex Test Setup

❌ **Don't create complex test setup:**
```typescript
// Bad - complex setup
beforeEach(async () => {
  await setupDatabase();
  await seedTestData();
  await setupMockServices();
  await configureEnvironment();
});
```

✅ **Do keep setup simple:**
```typescript
// Good - simple setup
beforeEach(() => {
  jest.clearAllMocks();
  setupMockData();
});
```

### 4. Testing Multiple Behaviors

❌ **Don't test multiple behaviors in one test:**
```typescript
// Bad - multiple behaviors
it('should create, update, and delete item', async () => {
  const item = await service.create(data);
  expect(item).toBeDefined();
  
  const updated = await service.update(item.id, newData);
  expect(updated.name).toBe(newData.name);
  
  await service.delete(item.id);
  expect(await service.get(item.id)).toBeNull();
});
```

✅ **Do test one behavior per test:**
```typescript
// Good - single behavior per test
it('should create item successfully', async () => {
  const item = await service.create(data);
  expect(item).toBeDefined();
  expect(item.name).toBe(data.name);
});

it('should update item successfully', async () => {
  const updated = await service.update(itemId, newData);
  expect(updated.name).toBe(newData.name);
});

it('should delete item successfully', async () => {
  await service.delete(itemId);
  expect(await service.get(itemId)).toBeNull();
});
```

## 🔍 Test Coverage Guidelines

### Minimum Coverage Requirements

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

### Critical Paths

Always test these critical paths:

1. **Happy Path**: Normal operation with valid data
2. **Error Handling**: Invalid data, network failures, validation errors
3. **Edge Cases**: Empty data, boundary values, null/undefined handling
4. **Async Operations**: Promise resolution/rejection, timeout handling

### Coverage Exclusions

Exclude from coverage:
- **Configuration files**: `jest.config.cjs`, `tsconfig.json`
- **Build artifacts**: `dist/`, `build/`
- **Test utilities**: `__mocks__/`, test helper files
- **Type definitions**: `.d.ts` files

## 📊 Performance Considerations

### Test Execution Time

- **Unit Tests**: Should run in < 100ms
- **Integration Tests**: Should run in < 1s
- **Full Test Suite**: Should run in < 30s

### Memory Usage

- **Individual Tests**: Should use < 50MB
- **Test Suite**: Should not exceed 500MB
- **Watch Mode**: Should maintain stable memory usage

### Optimization Techniques

1. **Mock Heavy Dependencies**: Mock database, file system, network calls
2. **Use Test Factories**: Generate test data efficiently
3. **Clean Up Resources**: Properly dispose of test resources
4. **Parallel Execution**: Run independent tests in parallel when possible

## 🔄 Continuous Integration

### Pre-commit Hooks

Configure pre-commit hooks to run tests:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --passWithNoTests",
      "pre-push": "npm test"
    }
  }
}
```

### CI Pipeline

Ensure tests run in CI:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm test -- --coverage --ci
```

## 📚 Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)

### Tools

- **Jest**: Primary testing framework
- **Testing Library**: React component testing utilities
- **ts-jest**: TypeScript support for Jest
- **jest-dom**: Additional DOM matchers

---

*Follow these guidelines to write maintainable, reliable, and efficient tests for the FortifAI project.*
