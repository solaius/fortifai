# Mock Data Management

This document provides comprehensive guidance on managing mock data in the FortifAI testing infrastructure, including strategies, patterns, and best practices.

## 🎯 Overview

Mock data is the foundation of our testing strategy, providing:
- **Isolation**: Tests run independently without external dependencies
- **Predictability**: Consistent data for reliable test results
- **Performance**: Fast test execution without network calls
- **Control**: Ability to test edge cases and error scenarios

## 🏗️ Architecture

### Mock Data Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Files                               │
│  (bindings.test.ts, providers.test.ts, secrets.test.ts)   │
├─────────────────────────────────────────────────────────────┤
│                 Service Layer                               │
│  (bindings.ts, providers.ts, secrets.ts)                  │
├─────────────────────────────────────────────────────────────┤
│                Mock Data Layer                             │
│  (mockData.ts, service-specific mocks)                    │
├─────────────────────────────────────────────────────────────┤
│                 Type Definitions                           │
│  (types/bindings.ts, types/secrets.ts, etc.)              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Test Setup**: Tests configure mock data and service mocks
2. **Service Calls**: Services check `shouldUseMockData()` function
3. **Mock Resolution**: Mock data is returned instead of API calls
4. **Test Validation**: Tests assert against predictable mock responses

## 📁 File Organization

### Central Mock Data (`src/services/mockData.ts`)

Contains shared mock data and utility functions:

```typescript
// Mock data exports
export const mockBindings: MCPServerBinding[] = [...];
export const mockProviders: Provider[] = [...];
export const mockSecretReferences: SecretReference[] = [...];

// Utility functions
export const shouldUseMockData = (): boolean => { ... };
export const mockDelay = (ms: number = 100): Promise<void> => { ... };
export const applyMockFilter = <T>(data: T[], filter: any): T[] => { ... };
```

### Service-Specific Mocks

Each service includes its own mock data for testing:

```typescript
// src/services/bindings.ts
import { mockBindings } from './mockData';

// Service-specific mock data
const mockBindingFacets: BindingSearchFacets = {
  providers: [
    { value: 'vault', count: 5 },
    { value: 'aws', count: 3 }
  ],
  statuses: [
    { value: 'active', count: 6 },
    { value: 'inactive', count: 2 }
  ]
};
```

### Test-Specific Mocks

Individual tests can create custom mock data:

```typescript
// In test files
const customMockBinding: MCPServerBinding = {
  ...mockBindings[0],
  status: 'inactive',
  name: 'Custom Test Binding'
};
```

## 🔧 Core Mock Data

### MCPServerBinding Mock Data

```typescript
export const mockBindings: MCPServerBinding[] = [
  {
    id: 'binding-1',
    name: 'Production Vault Binding',
    description: 'Production environment Vault server binding',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    runtimeConfig: {
      environment: 'production',
      region: 'us-east-1',
      version: '1.0.0',
      cluster: 'prod-cluster-1'
    },
    validationStatus: {
      isValid: true,
      errors: [],
      warnings: [],
      lastValidated: '2025-01-01T00:00:00Z'
    }
  },
  {
    id: 'binding-2',
    name: 'Development AWS Binding',
    description: 'Development environment AWS Secrets Manager binding',
    status: 'active',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    runtimeConfig: {
      environment: 'development',
      region: 'us-west-2',
      version: '2.0.0',
      cluster: 'dev-cluster-1'
    },
    validationStatus: {
      isValid: true,
      errors: [],
      warnings: ['Configuration warning'],
      lastValidated: '2025-01-02T00:00:00Z'
    }
  }
];
```

### Provider Mock Data

```typescript
export const mockProviders: Provider[] = [
  {
    id: 'provider-1',
    name: 'Production Vault',
    type: 'vault',
    description: 'Production HashiCorp Vault instance',
    status: 'active',
    config: {
      url: 'https://vault.prod.company.com',
      authMethod: 'approle',
      namespace: 'production'
    },
    metadata: {
      environment: 'production',
      region: 'us-east-1',
      version: '1.12.0'
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'provider-2',
    name: 'Development AWS',
    type: 'aws',
    description: 'Development AWS Secrets Manager',
    status: 'active',
    config: {
      region: 'us-west-2',
      profile: 'dev-profile',
      roleArn: 'arn:aws:iam::123456789012:role/SecretsManagerRole'
    },
    metadata: {
      environment: 'development',
      region: 'us-west-2',
      version: 'latest'
    },
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z'
  }
];
```

### Secret Reference Mock Data

```typescript
export const mockSecretReferences: SecretReference[] = [
  {
    id: 'secret-1',
    name: 'database-credentials',
    description: 'Production database credentials',
    secretType: 'credentials',
    format: 'json',
    encoding: 'utf-8',
    classification: 'confidential',
    compliance: ['SOX', 'GDPR'],
    dataRetention: 365,
    owner: 'database-team',
    team: 'infrastructure',
    costCenter: 'IT-001',
    rotationPolicy: {
      enabled: true,
      interval: 90,
      lastRotated: '2025-01-01T00:00:00Z',
      nextRotation: '2025-04-01T00:00:00Z'
    },
    usageCount: 150,
    lastAccessed: '2025-01-15T10:30:00Z',
    accessPatterns: ['read', 'write'],
    labels: {
      environment: 'production',
      service: 'database'
    },
    annotations: {
      'backup-required': 'true',
      'monitoring-enabled': 'true'
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
```

## 🎭 Mock Data Factories

### Factory Pattern

Create reusable functions for generating mock data:

```typescript
// Generic factory for any type
export const createMockData = <T>(
  baseData: T,
  overrides: Partial<T> = {}
): T => ({
  ...baseData,
  ...overrides
});

// Specific factory for bindings
export const createMockBinding = (
  overrides: Partial<MCPServerBinding> = {}
): MCPServerBinding => ({
  id: `binding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Binding',
  description: 'A test binding for unit testing',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  runtimeConfig: {
    environment: 'test',
    region: 'us-east-1',
    version: '1.0.0',
    cluster: 'test-cluster'
  },
  validationStatus: {
    isValid: true,
    errors: [],
    warnings: [],
    lastValidated: new Date().toISOString()
  },
  ...overrides
});

// Usage examples
const activeBinding = createMockBinding({ status: 'active' });
const inactiveBinding = createMockBinding({ status: 'inactive' });
const productionBinding = createMockBinding({
  runtimeConfig: { environment: 'production', region: 'us-west-2' }
});
```

### Array Factories

Generate arrays of mock data:

```typescript
export const createMockBindings = (
  count: number,
  baseOverrides: Partial<MCPServerBinding> = {}
): MCPServerBinding[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockBinding({
      id: `binding-${index + 1}`,
      name: `Test Binding ${index + 1}`,
      ...baseOverrides
    })
  );
};

// Usage
const fiveBindings = createMockBindings(5, { status: 'active' });
const tenBindings = createMockBindings(10, { 
  runtimeConfig: { environment: 'development' } 
});
```

## 🔄 Mock Data Lifecycle

### Test Setup Phase

```typescript
describe('BindingsService', () => {
  let service: BindingsService;
  let mockSecretsService: any;
  let mockProvidersService: any;

  beforeEach(() => {
    // Clear previous mocks
    jest.clearAllMocks();
    
    // Setup fresh mock data
    setupMockData();
    
    // Initialize service with mocked dependencies
    service = new BindingsService();
    mockSecretsService = require('../../services/secrets');
    mockProvidersService = require('../../services/providers');
    
    // Configure mock implementations
    mockSecretsService.getReference.mockResolvedValue(mockSecretReferences[0]);
    mockProvidersService.getProvider.mockResolvedValue(mockProviders[0]);
  });

  afterEach(() => {
    // Clean up any side effects
    cleanup();
  });
});
```

### Mock Data Setup

```typescript
const setupMockData = () => {
  // Reset mock data to initial state
  mockBindings.length = 0;
  mockBindings.push(...defaultMockBindings);
  
  // Clear any cached data
  if (global.mockDataCache) {
    global.mockDataCache.clear();
  }
};

const cleanup = () => {
  // Remove any test-specific data
  // Reset service state if needed
  if (service && typeof service.clear === 'function') {
    service.clear();
  }
};
```

## 🎯 Environment-Based Mocking

### Mock Data Decision Logic

```typescript
export const shouldUseMockData = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||           // Always use mocks in tests
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
    (typeof window !== 'undefined' && window.location.port === '5173')
  );
};
```

### Service Implementation Pattern

```typescript
async listBindings(filter?: BindingFilter): Promise<MCPServerBinding[]> {
  try {
    // Priority 1: Use mock data in test environment
    if (process.env.NODE_ENV === 'test') {
      return this.filterMockBindings(mockBindings, filter);
    }

    // Priority 2: Use mock data if enabled
    if (shouldUseMockData()) {
      return this.filterMockBindings(mockBindings, filter);
    }

    // Priority 3: Make real API call
    const response = await api.get('/bindings', { params: filter });
    return response.data;
  } catch (error) {
    // Priority 4: Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔄 Falling back to mock data due to API failure');
      return this.filterMockBindings(mockBindings, filter);
    }
    throw error;
  }
}
```

## 🧪 Testing Mock Data

### Mock Data Validation

```typescript
describe('Mock Data', () => {
  it('should have valid binding data', () => {
    mockBindings.forEach(binding => {
      expect(binding.id).toBeDefined();
      expect(binding.name).toBeDefined();
      expect(binding.status).toBeDefined();
      expect(binding.runtimeConfig).toBeDefined();
      expect(binding.validationStatus).toBeDefined();
    });
  });

  it('should have valid provider data', () => {
    mockProviders.forEach(provider => {
      expect(provider.id).toBeDefined();
      expect(provider.name).toBeDefined();
      expect(provider.type).toBeDefined();
      expect(provider.config).toBeDefined();
    });
  });

  it('should have valid secret reference data', () => {
    mockSecretReferences.forEach(secret => {
      expect(secret.id).toBeDefined();
      expect(secret.name).toBeDefined();
      expect(secret.secretType).toBeDefined();
      expect(secret.metadata).toBeDefined();
    });
  });
});
```

### Mock Data Consistency

```typescript
it('should maintain data consistency across test runs', () => {
  const firstRun = mockBindings.map(b => b.id).sort();
  const secondRun = mockBindings.map(b => b.id).sort();
  
  expect(firstRun).toEqual(secondRun);
});

it('should have unique IDs across all mock data', () => {
  const allIds = [
    ...mockBindings.map(b => b.id),
    ...mockProviders.map(p => p.id),
    ...mockSecretReferences.map(s => s.id)
  ];
  
  const uniqueIds = new Set(allIds);
  expect(uniqueIds.size).toBe(allIds.length);
});
```

## 🚀 Performance Optimization

### Lazy Loading

```typescript
// Only load mock data when needed
let _mockBindings: MCPServerBinding[] | null = null;

export const getMockBindings = (): MCPServerBinding[] => {
  if (!_mockBindings) {
    _mockBindings = generateMockBindings();
  }
  return _mockBindings;
};

export const clearMockBindings = () => {
  _mockBindings = null;
};
```

### Efficient Filtering

```typescript
export const filterMockBindings = (
  bindings: MCPServerBinding[],
  filter?: BindingFilter
): MCPServerBinding[] => {
  if (!filter) return bindings;
  
  return bindings.filter(binding => {
    if (filter.status && binding.status !== filter.status) return false;
    if (filter.environment && binding.runtimeConfig.environment !== filter.environment) return false;
    if (filter.region && binding.runtimeConfig.region !== filter.region) return false;
    return true;
  });
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Mock Data Not Loading

**Symptoms**: Tests fail with "Cannot read properties of undefined"
**Solution**: Ensure mock data is properly imported and initialized

```typescript
// Check import
import { mockBindings } from './mockData';

// Verify mock data exists
console.log('Mock bindings:', mockBindings);
```

#### 2. Type Mismatches

**Symptoms**: TypeScript compilation errors
**Solution**: Ensure mock objects conform to actual interfaces

```typescript
// Use type assertion to verify
const mockBinding: MCPServerBinding = {
  // ... mock data
};

// Or use satisfies operator (TypeScript 4.9+)
const mockBinding = {
  // ... mock data
} satisfies MCPServerBinding;
```

#### 3. Circular Dependencies

**Symptoms**: Tests fail with import/export errors
**Solution**: Use proper mocking strategies

```typescript
// Mock at the top of the file
jest.mock('../../services/providers');

// Get mocked module
const mockProvidersService = require('../../services/providers');
```

### Debugging Tips

1. **Log Mock Data**: `console.log('Mock data:', mockBindings)`
2. **Check Environment**: `console.log('NODE_ENV:', process.env.NODE_ENV)`
3. **Verify Imports**: Check that mock data is properly exported
4. **Test Mock Functions**: Verify `shouldUseMockData()` returns expected values

## 📚 Best Practices

### 1. Keep Mock Data Realistic

```typescript
// Good - realistic data
const mockBinding: MCPServerBinding = {
  id: 'binding-prod-001',
  name: 'Production Database Binding',
  description: 'Production environment database connection binding',
  // ... other realistic properties
};

// Bad - unrealistic data
const mockBinding: MCPServerBinding = {
  id: 'test',
  name: 'test',
  description: 'test',
  // ... minimal properties
};
```

### 2. Use Consistent Naming

```typescript
// Good - consistent naming
export const mockBindings = [...];
export const mockProviders = [...];
export const mockSecretReferences = [...];

// Bad - inconsistent naming
export const bindings = [...];
export const providerData = [...];
export const secrets = [...];
```

### 3. Maintain Data Relationships

```typescript
// Ensure related data is consistent
const mockBinding = createMockBinding({
  runtimeConfig: {
    environment: 'production',
    region: 'us-east-1'
  }
});

const mockProvider = createMockProvider({
  metadata: {
    environment: 'production',
    region: 'us-east-1'
  }
});
```

### 4. Document Mock Data Purpose

```typescript
/**
 * Mock bindings for testing the BindingsService
 * 
 * Contains:
 * - Production Vault binding (active)
 * - Development AWS binding (active)
 * - Test binding (inactive)
 * 
 * Used in:
 * - bindings.test.ts
 * - integration tests
 * - development fallback
 */
export const mockBindings: MCPServerBinding[] = [...];
```

---

*This documentation provides comprehensive guidance for managing mock data in the FortifAI testing infrastructure. Follow these patterns to create maintainable and reliable tests.*
