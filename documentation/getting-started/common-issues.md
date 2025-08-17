# Common Issues and Solutions

This document provides solutions to frequently encountered problems in the FortifAI project, organized by category and severity.

## 🚨 Critical Issues

### 1. Tests Failing with "Cannot read properties of undefined"

**Symptoms**: Tests crash with `TypeError: Cannot read properties of undefined (reading 'success')`

**Root Cause**: Mock API responses don't match expected structure

**Solution**:
```typescript
// ❌ Incorrect mock response
mockApi.post.mockResolvedValue(mockData);

// ✅ Correct mock response
mockApi.post.mockResolvedValue({
  success: true,
  data: mockData
});
```

**Prevention**: Always ensure mock API responses include `success` and `data` properties

### 2. Infinite Recursive Loops in Services

**Symptoms**: Tests run indefinitely or crash with memory errors

**Root Cause**: Service methods calling themselves in catch blocks

**Solution**:
```typescript
// ❌ Incorrect - causes infinite loop
async listBindings() {
  try {
    return await api.get('/bindings');
  } catch (error) {
    return this.listBindings(); // ❌ Recursive call!
  }
}

// ✅ Correct - explicit mock data fallback
async listBindings() {
  try {
    return await api.get('/bindings');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔄 Falling back to mock data due to API failure');
      return this.filterMockBindings(mockBindings);
    }
    throw error;
  }
}
```

**Prevention**: Never call service methods recursively in error handling

### 3. TypeScript Compilation Errors

**Symptoms**: Build fails with type errors

**Root Cause**: Mock objects don't conform to actual interfaces

**Solution**:
```typescript
// ❌ Incorrect - missing required properties
const mockBinding = {
  id: 'test',
  name: 'test'
};

// ✅ Correct - includes all required properties
const mockBinding: MCPServerBinding = {
  id: 'binding-123',
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
  }
};
```

**Prevention**: Use TypeScript interfaces to validate mock object structure

## ⚠️ High Priority Issues

### 4. Service Dependencies Not Mocked

**Symptoms**: Tests fail with "Cannot read properties of undefined" or real API calls

**Root Cause**: External service dependencies not properly mocked

**Solution**:
```typescript
// ❌ Missing mock
// No jest.mock() for external services

// ✅ Correct mocking
jest.mock('../../services/secrets');
jest.mock('../../services/providers');

const mockSecretsService = require('../../services/secrets');
const mockProvidersService = require('../../services/providers');

beforeEach(() => {
  mockSecretsService.getReference.mockResolvedValue(mockSecretReference);
  mockProvidersService.getProvider.mockResolvedValue(mockProvider);
});
```

**Prevention**: Always mock external service dependencies at the top of test files

### 5. Environment Detection Issues

**Symptoms**: Services try to make real API calls instead of using mock data

**Root Cause**: `shouldUseMockData()` function not properly configured

**Solution**:
```typescript
// ❌ Incorrect - doesn't include test environment
export const shouldUseMockData = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  );
};

// ✅ Correct - includes test environment
export const shouldUseMockData = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' || // ✅ Added this line
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
    (typeof window !== 'undefined' && window.location.port === '5173')
  );
};
```

**Prevention**: Always test the `shouldUseMockData()` function in test environment

### 6. Mock Data Import Issues

**Symptoms**: Tests fail with "Cannot read properties of undefined" for mock data

**Root Cause**: Incorrect import paths or missing exports

**Solution**:
```typescript
// ❌ Incorrect import
import { mockBindings } from './mockData';

// ✅ Correct import (check actual file structure)
import { mockBindings } from '../../services/mockData';

// Verify mock data exists
console.log('Mock bindings:', mockBindings);
```

**Prevention**: Verify import paths and ensure mock data is properly exported

## 🔧 Medium Priority Issues

### 7. Timestamp Comparison Failures

**Symptoms**: Tests fail when comparing `updatedAt` timestamps

**Root Cause**: Mock implementation too fast, resulting in identical timestamps

**Solution**:
```typescript
// ❌ Incorrect - no delay between operations
async updateBinding(id: string, data: UpdateBindingRequest) {
  const binding = this.bindings.get(id);
  if (binding) {
    const updated = { ...binding, ...data, updatedAt: new Date().toISOString() };
    this.bindings.set(id, updated);
    return updated;
  }
  return null;
}

// ✅ Correct - add small delay for testing
async updateBinding(id: string, data: UpdateBindingRequest) {
  const binding = this.bindings.get(id);
  if (binding) {
    if (process.env.NODE_ENV === 'test') {
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    const updated = { ...binding, ...data, updatedAt: new Date().toISOString() };
    this.bindings.set(id, updated);
    return updated;
  }
  return null;
}
```

**Prevention**: Add small delays in test environment for timestamp-dependent operations

### 8. Circular Dependency Issues

**Symptoms**: Tests fail with import/export errors or unexpected behavior

**Root Cause**: Services importing each other creating circular dependencies

**Solution**:
```typescript
// ❌ Incorrect - circular import
// services/bindings.ts
import { providersService } from './providers';

// services/providers.ts  
import { bindingsService } from './bindings';

// ✅ Correct - use dependency injection or lazy loading
class BindingsService {
  private providersService?: ProvidersService;
  
  getProvidersService(): ProvidersService {
    if (!this.providersService) {
      this.providersService = new ProvidersService();
    }
    return this.providersService;
  }
}
```

**Prevention**: Avoid direct imports between services, use dependency injection

### 9. Test Expectation Mismatches

**Symptoms**: Tests fail because they expect different behavior than implementation

**Root Cause**: Tests written for old implementation or incorrect assumptions

**Solution**:
```typescript
// ❌ Incorrect - expects API call
it('should make API call when shouldUseMockData is false', async () => {
  shouldUseMockData.mockReturnValue(false);
  const result = await service.listBindings();
  expect(mockApi.get).toHaveBeenCalledWith('/bindings');
});

// ✅ Correct - expects mock data usage
it('should use mock data when shouldUseMockData is true', async () => {
  shouldUseMockData.mockReturnValue(true);
  const result = await service.listBindings();
  expect(result).toEqual(mockBindings);
  expect(mockApi.get).not.toHaveBeenCalled();
});
```

**Prevention**: Keep tests aligned with current implementation behavior

## 📊 Performance Issues

### 10. Slow Test Execution

**Symptoms**: Tests take longer than expected to run

**Root Cause**: Inefficient mock data, memory leaks, or heavy operations

**Solution**:
```bash
# Profile test performance
npm test -- --verbose --detectOpenHandles

# Check memory usage
npm test -- --maxWorkers=1 --maxOldSpaceSize=4096

# Identify slow tests
npm test -- --verbose --detectOpenHandles --runInBand
```

**Prevention**: Monitor test execution times and optimize slow tests

### 11. Memory Leaks

**Symptoms**: Tests consume increasing memory or crash with heap errors

**Root Cause**: Unclosed resources, global state pollution, or large data structures

**Solution**:
```typescript
// ❌ Incorrect - global state pollution
global.testData = [];

// ✅ Correct - clean up after each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset any global state
  if (global.testData) {
    global.testData.length = 0;
  }
});

afterEach(() => {
  // Clean up resources
  cleanup();
});
```

**Prevention**: Always clean up test state and avoid global modifications

## 🔍 Debugging Strategies

### 1. Use Verbose Output

```bash
# Get detailed test information
npm test -- --verbose

# See which tests are running
npm test -- --verbose --detectOpenHandles
```

### 2. Run Single Tests

```bash
# Focus on failing test
npm test -- --testNamePattern="should create binding"

# Test specific file
npm test -- --testPathPattern="bindings.test.ts$"
```

### 3. Check Console Logs

```typescript
// Add logging to understand what's happening
console.log('Mock data:', mockBindings);
console.log('Environment:', process.env.NODE_ENV);
console.log('shouldUseMockData result:', shouldUseMockData());
```

### 4. Verify Mock Data

```typescript
// Ensure mock data is properly structured
describe('Mock Data Validation', () => {
  it('should have valid binding data', () => {
    mockBindings.forEach(binding => {
      expect(binding.id).toBeDefined();
      expect(binding.name).toBeDefined();
      // ... other validations
    });
  });
});
```

## 🛠️ Prevention Strategies

### 1. Code Review Checklist

- [ ] All external dependencies are mocked
- [ ] Mock data conforms to actual interfaces
- [ ] Error handling doesn't create infinite loops
- [ ] Environment detection includes test environment
- [ ] Tests align with current implementation

### 2. Automated Checks

```bash
# Run before committing
npm run lint
npm test
npm run build

# Use pre-commit hooks
npx husky add .husky/pre-commit "npm test"
```

### 3. Regular Maintenance

- Update mock data when interfaces change
- Review test performance monthly
- Monitor test coverage trends
- Update testing dependencies regularly

## 📚 Additional Resources

### Documentation

- [Testing Infrastructure](../testing/README.md)
- [Test Writing Guidelines](../testing/test-writing-guidelines.md)
- [Mock Data Management](../testing/mock-data-management.md)

### Tools

- **Jest CLI**: `npx jest --help`
- **TypeScript Compiler**: `npx tsc --noEmit`
- **ESLint**: `npm run lint`
- **Coverage Reports**: `npm test -- --coverage`

### Community Support

- [GitHub Issues](https://github.com/your-org/fortifai/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/fortifai)
- [Discord Community](https://discord.gg/your-community)

## ✅ Quick Fix Checklist

When encountering issues, check these in order:

1. **Environment**: Is `NODE_ENV=test` set?
2. **Mocks**: Are all external dependencies mocked?
3. **Data**: Does mock data conform to interfaces?
4. **Loops**: Are there any recursive calls in error handling?
5. **Imports**: Are import paths correct?
6. **Timestamps**: Are timestamp comparisons failing?
7. **Performance**: Are tests running slowly?
8. **Memory**: Are there memory leaks?

---

*For more detailed troubleshooting, refer to the specific issue sections above or create an issue in the project repository.*
