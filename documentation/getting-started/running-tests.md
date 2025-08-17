# Running Tests

This document provides a comprehensive guide to running tests in the FortifAI project, including different execution modes, troubleshooting, and best practices.

## 🎯 Quick Start

### Basic Test Execution

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose
```

### Expected Output

When tests are successful, you should see:

```
 PASS  src/__tests__/services/api.test.ts
 PASS  src/__tests__/services/bindings.test.ts
 PASS  src/__tests__/services/mockData.test.ts
 PASS  src/__tests__/services/providers.test.ts
 PASS  src/__tests__/services/secrets.test.ts

Test Suites: 5 passed, 5 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        3.45 s
Ran all test suites.
```

## 🧪 Test Execution Modes

### 1. Full Test Suite

```bash
# Run all tests once
npm test

# Run all tests with coverage report
npm test -- --coverage

# Run all tests with detailed output
npm test -- --verbose --detectOpenHandles
```

**Use Case**: CI/CD pipelines, pre-commit hooks, final verification

### 2. Watch Mode (Development)

```bash
# Start watch mode
npm test -- --watch

# Watch mode with coverage
npm test -- --watch --coverage

# Watch mode with verbose output
npm test -- --watch --verbose
```

**Use Case**: Active development, debugging tests, iterative testing

### 3. Specific Test Files

```bash
# Test only bindings service
npm test -- --testPathPattern="bindings.test.ts$"

# Test only providers service
npm test -- --testPathPattern="providers.test.ts$"

# Test only secrets service
npm test -- --testPathPattern="secrets.test.ts$"

# Test all service files
npm test -- --testPathPattern="services/.*\.test\.ts$"
```

**Use Case**: Focused testing, debugging specific services, faster feedback

### 4. Pattern-Based Testing

```bash
# Test specific functionality
npm test -- --testNamePattern="create|update|delete"

# Test error handling
npm test -- --testNamePattern="should.*error|should.*fail"

# Test async operations
npm test -- --testNamePattern="should.*async|should.*promise"
```

**Use Case**: Testing specific behaviors, regression testing, feature validation

## 📊 Test Coverage

### Generate Coverage Report

```bash
# Generate coverage report
npm test -- --coverage

# Coverage with specific thresholds
npm test -- --coverage --coverageThreshold='{"global":{"statements":80,"branches":75,"functions":85,"lines":80}}'

# Coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/services/**/*.ts"
```

### Coverage Report Structure

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.71 |    78.95 |   88.89 |   85.71 |
 bindings |   85.71 |    78.95 |   88.89 |   85.71 | 45,67,89
providers |   90.48 |    85.71 |   92.31 |   90.48 | 23,45
  secrets |   82.35 |    75.00 |   85.71 |   82.35 | 34,56,78
----------|---------|----------|---------|---------|-------------------
```

### Coverage Thresholds

The project maintains these minimum coverage requirements:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

## 🔧 Advanced Test Execution

### Performance Optimization

```bash
# Run tests with specific worker count
npm test -- --maxWorkers=4

# Set memory limit
npm test -- --maxOldSpaceSize=4096

# Run tests in parallel
npm test -- --maxWorkers=50%
```

### Debug Mode

```bash
# Run tests with Node.js debugger
npm test -- --inspect-brk

# Run specific test with debugging
npm test -- --testNamePattern="should create binding" --inspect-brk

# Debug with console output
npm test -- --verbose --detectOpenHandles --forceExit
```

### Environment-Specific Testing

```bash
# Test with specific environment
NODE_ENV=test npm test

# Test with custom configuration
npm test -- --config=jest.config.test.js

# Test with environment variables
NODE_ENV=test API_MOCK_ENABLED=true npm test
```

## 🚀 Test Execution Workflows

### Development Workflow

```bash
# 1. Start development
npm run dev

# 2. In another terminal, start test watch mode
npm test -- --watch

# 3. Make code changes and see tests run automatically
# 4. Fix any failing tests
# 5. Continue development
```

### Pre-commit Workflow

```bash
# 1. Stage your changes
git add .

# 2. Run tests before committing
npm test

# 3. If tests pass, commit
git commit -m "Add new feature with tests"

# 4. If tests fail, fix and repeat
```

### CI/CD Workflow

```bash
# 1. Install dependencies
npm ci

# 2. Run linting
npm run lint

# 3. Run tests with coverage
npm test -- --coverage --ci --maxWorkers=2

# 4. Build application
npm run build
```

## 🛠️ Troubleshooting

### Common Test Failures

#### 1. TypeScript Compilation Errors

**Symptoms**: Tests fail during compilation
**Solution**: Check TypeScript configuration and fix type errors

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix type errors first, then run tests
npm test
```

#### 2. Mock Data Issues

**Symptoms**: Tests fail with "Cannot read properties of undefined"
**Solution**: Verify mock data setup and imports

```typescript
// Check mock data import
import { mockBindings } from './mockData';

// Verify mock data exists
console.log('Mock bindings:', mockBindings);
```

#### 3. Service Dependency Issues

**Symptoms**: Tests fail due to unmocked service calls
**Solution**: Ensure all external dependencies are mocked

```typescript
// Mock at the top of test file
jest.mock('../../services/providers');
jest.mock('../../services/secrets');

// Setup mock implementations in beforeEach
beforeEach(() => {
  jest.clearAllMocks();
  // Configure mocks...
});
```

#### 4. Environment Issues

**Symptoms**: Tests fail with environment-related errors
**Solution**: Check Jest configuration and environment setup

```bash
# Verify Jest configuration
npx jest --showConfig

# Check environment variables
echo $NODE_ENV
```

### Performance Issues

#### 1. Slow Test Execution

```bash
# Profile test performance
npm test -- --verbose --detectOpenHandles

# Check memory usage
npm test -- --maxWorkers=1 --maxOldSpaceSize=4096

# Identify slow tests
npm test -- --verbose --detectOpenHandles --runInBand
```

#### 2. Memory Leaks

```bash
# Run tests with memory profiling
npm test -- --detectLeaks --detectOpenHandles

# Check for open handles
npm test -- --detectOpenHandles --forceExit
```

### Debugging Tips

1. **Use Verbose Output**: `npm test -- --verbose`
2. **Run Single Tests**: Focus on failing test cases
3. **Check Console Logs**: Look for warning messages
4. **Verify Mock Data**: Ensure mock objects are properly configured
5. **Check Environment**: Verify `NODE_ENV` and other variables

## 📈 Test Monitoring

### Performance Metrics

Monitor these metrics for optimal test performance:

- **Execution Time**: Full suite should complete in < 30 seconds
- **Memory Usage**: Individual tests should use < 50MB
- **Startup Time**: Jest should start in < 5 seconds
- **Watch Mode Responsiveness**: Tests should re-run in < 2 seconds

### Continuous Monitoring

```bash
# Run tests with timing information
npm test -- --verbose --detectOpenHandles

# Monitor memory usage
npm test -- --maxOldSpaceSize=4096 --verbose

# Track test execution patterns
npm test -- --verbose --detectOpenHandles --runInBand
```

## 🔄 Best Practices

### 1. Test Execution Order

```bash
# Run tests in logical order
npm test -- --testPathPattern="api.test.ts"
npm test -- --testPathPattern="mockData.test.ts"
npm test -- --testPathPattern="providers.test.ts"
npm test -- --testPathPattern="secrets.test.ts"
npm test -- --testPathPattern="bindings.test.ts"
```

### 2. Watch Mode Usage

```bash
# Use watch mode during development
npm test -- --watch

# Use watch mode with coverage
npm test -- --watch --coverage

# Use watch mode for specific files
npm test -- --watch --testPathPattern="bindings.test.ts$"
```

### 3. CI/CD Integration

```bash
# Use CI mode for automated testing
npm test -- --ci --coverage --maxWorkers=2

# Set appropriate timeouts
npm test -- --testTimeout=10000 --maxWorkers=2

# Generate coverage reports
npm test -- --coverage --coverageReporters=text --coverageReporters=lcov
```

## 📚 Additional Resources

### Jest CLI Options

```bash
# View all available options
npx jest --help

# View Jest configuration
npx jest --showConfig

# Run Jest in debug mode
npx jest --inspect-brk
```

### Environment Variables

```bash
# Test environment
NODE_ENV=test

# Jest configuration
JEST_WORKERS=4
JEST_TIMEOUT=10000

# Custom configuration
JEST_CONFIG_PATH=jest.config.test.js
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:debug": "jest --inspect-brk"
  }
}
```

## ✅ Verification Checklist

Before running tests, ensure:

- [ ] Dependencies are installed (`npm install`)
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Environment is properly configured
- [ ] Mock data is available and properly imported
- [ ] Service dependencies are properly mocked
- [ ] Jest configuration is correct
- [ ] Test files follow naming conventions

## 🎯 Next Steps

After successfully running tests:

1. **Explore Test Coverage**: Run `npm test -- --coverage`
2. **Debug Failing Tests**: Use `npm test -- --verbose`
3. **Optimize Performance**: Monitor execution times and memory usage
4. **Write New Tests**: Follow the [Test Writing Guidelines](../testing/test-writing-guidelines.md)
5. **Integrate with CI/CD**: Set up automated testing pipelines

---

*For more detailed information about the testing infrastructure, refer to the [Testing Infrastructure](../testing/README.md) documentation.*
