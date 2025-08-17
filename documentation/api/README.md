# API Documentation

This document provides comprehensive API documentation for the FortifAI project, including service interfaces, data types, and usage examples.

## 🎯 Overview

The FortifAI API provides a comprehensive interface for managing MCP server bindings, secrets providers, and secret references. The API is designed with a service-oriented architecture and includes comprehensive mocking support for development and testing.

## 🏗️ API Architecture

### Service Layer

The API is organized into four main service areas:

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  BindingsService  │  ProvidersService  │  SecretsService      │
├─────────────────────────────────────────────────────────────────┤
│                    RBAC Services                                │
├─────────────────────────────────────────────────────────────────┤
│  RBACService  │  PolicyEngineService  │  PolicyVersioningService │
├─────────────────────────────────────────────────────────────────┤
│                    Mock Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Mock Data  │  Mock Services  │  Test Utilities              │
└─────────────────────────────────────────────────────────────────┘
```

### Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

## 🔗 Bindings Service API

### Overview

The `BindingsService` manages MCP server bindings, providing CRUD operations and search functionality.

### Service Interface

```typescript
class BindingsService {
  // Core CRUD operations
  async listBindings(filter?: BindingFilter): Promise<MCPServerBinding[]>
  async getBinding(id: string): Promise<MCPServerBinding | null>
  async createBinding(request: CreateBindingRequest): Promise<MCPServerBinding>
  async updateBinding(id: string, request: UpdateBindingRequest): Promise<MCPServerBinding | null>
  async deleteBinding(id: string): Promise<boolean>
  
  // Search and filtering
  async searchBindings(query: string, facets?: BindingSearchFacets): Promise<BindingSearchResult>
  async getBindingFacets(): Promise<BindingSearchFacets>
}
```

### Data Types

#### MCPServerBinding

```typescript
interface MCPServerBinding {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  runtimeConfig: RuntimeConfig;
  validationStatus: ValidationStatus;
}
```

#### RuntimeConfig

```typescript
interface RuntimeConfig {
  environment: string;
  region: string;
  version: string;
  cluster?: string;
  namespace?: string;
  tags?: Record<string, string>;
}
```

#### ValidationStatus

```typescript
interface ValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lastValidated: string; // ISO 8601 timestamp
}
```

### API Methods

#### listBindings

Retrieves a list of MCP server bindings with optional filtering.

```typescript
async listBindings(filter?: BindingFilter): Promise<MCPServerBinding[]>
```

**Parameters:**
- `filter` (optional): Filter criteria for bindings

**Returns:** Array of MCP server bindings

**Example:**
```typescript
const bindings = await bindingsService.listBindings({
  status: 'active',
  environment: 'production'
});
```

#### getBinding

Retrieves a specific binding by ID.

```typescript
async getBinding(id: string): Promise<MCPServerBinding | null>
```

**Parameters:**
- `id`: Unique identifier for the binding

**Returns:** Binding object or null if not found

**Example:**
```typescript
const binding = await bindingsService.getBinding('binding-123');
if (binding) {
  console.log('Binding found:', binding.name);
}
```

#### createBinding

Creates a new MCP server binding.

```typescript
async createBinding(request: CreateBindingRequest): Promise<MCPServerBinding>
```

**Parameters:**
- `request`: Binding creation request

**Returns:** Newly created binding

**Example:**
```typescript
const newBinding = await bindingsService.createBinding({
  name: 'Production Database Binding',
  description: 'Production environment database connection',
  runtimeConfig: {
    environment: 'production',
    region: 'us-east-1',
    version: '1.0.0'
  }
});
```

#### updateBinding

Updates an existing binding.

```typescript
async updateBinding(id: string, request: UpdateBindingRequest): Promise<MCPServerBinding | null>
```

**Parameters:**
- `id`: Binding ID to update
- `request`: Update request data

**Returns:** Updated binding or null if not found

**Example:**
```typescript
const updated = await bindingsService.updateBinding('binding-123', {
  description: 'Updated description',
  status: 'inactive'
});
```

#### deleteBinding

Deletes a binding by ID.

```typescript
async deleteBinding(id: string): Promise<boolean>
```

**Parameters:**
- `id`: Binding ID to delete

**Returns:** True if deleted successfully, false otherwise

**Example:**
```typescript
const deleted = await bindingsService.deleteBinding('binding-123');
if (deleted) {
  console.log('Binding deleted successfully');
}
```

## 🔐 Providers Service API

### Overview

The `ProvidersService` manages secrets providers, including Vault, AWS, and other external services.

### Service Interface

```typescript
class ProvidersService {
  // Core CRUD operations
  async listProviders(): Promise<Provider[]>
  async getProvider(id: string): Promise<Provider | null>
  async createProvider(request: CreateProviderRequest): Promise<Provider>
  async updateProvider(id: string, request: UpdateProviderRequest): Promise<Provider | null>
  async deleteProvider(id: string): Promise<boolean>
  
  // Provider-specific operations
  async getProviderService(provider: Provider): Promise<ProviderService | null>
  async initializeVaultService(provider: VaultProvider): Promise<void>
}
```

### Data Types

#### Provider

```typescript
interface Provider {
  id: string;
  name: string;
  type: 'vault' | 'aws' | 'azure' | 'gcp';
  description: string;
  status: 'active' | 'inactive' | 'error';
  config: ProviderConfig;
  metadata: ProviderMetadata;
  createdAt: string;
  updatedAt: string;
}
```

#### ProviderConfig

```typescript
interface ProviderConfig {
  url?: string;
  region?: string;
  authMethod?: string;
  namespace?: string;
  profile?: string;
  roleArn?: string;
}
```

#### ProviderMetadata

```typescript
interface ProviderMetadata {
  environment: string;
  region: string;
  version: string;
  capabilities?: string[];
}
```

### API Methods

#### listProviders

Retrieves all configured providers.

```typescript
async listProviders(): Promise<Provider[]>
```

**Returns:** Array of all providers

**Example:**
```typescript
const providers = await providersService.listProviders();
providers.forEach(provider => {
  console.log(`${provider.name} (${provider.type})`);
});
```

#### getProvider

Retrieves a specific provider by ID.

```typescript
async getProvider(id: string): Promise<Provider | null>
```

**Parameters:**
- `id`: Provider ID

**Returns:** Provider object or null if not found

**Example:**
```typescript
const provider = await providersService.getProvider('provider-123');
if (provider && provider.type === 'vault') {
  await providersService.initializeVaultService(provider as VaultProvider);
}
```

#### createProvider

Creates a new provider.

```typescript
async createProvider(request: CreateProviderRequest): Promise<Provider>
```

**Parameters:**
- `request`: Provider creation request

**Returns:** Newly created provider

**Example:**
```typescript
const vaultProvider = await providersService.createProvider({
  name: 'Production Vault',
  type: 'vault',
  description: 'Production HashiCorp Vault instance',
  config: {
    url: 'https://vault.prod.company.com',
    authMethod: 'approle',
    namespace: 'production'
  },
  metadata: {
    environment: 'production',
    region: 'us-east-1',
    version: '1.12.0'
  }
});
```

## 🔐 RBAC (Role-Based Access Control) API

### Overview

The RBAC system provides comprehensive role-based access control for secrets management, including role management, permission handling, policy evaluation, and versioning capabilities.

### Core Services

- **`RBACService`**: Manages roles, permissions, and policies
- **`PolicyEngineService`**: Evaluates policies and makes access decisions
- **`PolicyVersioningService`**: Handles policy versioning and audit trails

### Quick Start

```typescript
import { rbacService } from '../services/rbac';
import { policyEngineService } from '../services/policyEngine';
import { policyVersioningService } from '../services/policyVersioning';

// Check user permissions
const userRoles = ['org-admin', 'project-admin'];
if (rbacService.hasRole(userRoles, 'org-admin')) {
  // User has org-admin role
}

// Evaluate access policy
const result = await policyEngineService.evaluatePolicy(request);

// Create policy with versioning
const { policy, version } = await policyVersioningService.createPolicyWithVersioning(
  policyData,
  'Initial creation'
);
```

### Documentation

For comprehensive RBAC documentation, see [RBAC API Reference](./rbac.md).

**Key Features:**
- **Role Management**: Create, update, and manage user roles
- **Permission System**: Granular permissions for resources and actions
- **Policy Engine**: Deterministic policy evaluation with conflict resolution
- **Policy Versioning**: Complete audit trail and version management
- **Policy Simulation**: Test policies before deployment

**Example:**
```typescript
const newRole = await rbacService.createRole({
  name: 'ml-engineer',
  displayName: 'ML Engineer',
  description: 'Specialized role for machine learning workloads',
  permissions: ['perm-secrets-read', 'perm-bindings-read'],
  metadata: {
    category: 'specialized',
    priority: 600,
    tags: ['ml', 'ai', 'engineer']
  }
});
```

## 🔒 Secrets Service API

### Overview

The `SecretsService` manages secret references, providing secure access to secrets stored in various providers.

### Service Interface

```typescript
class SecretsService {
  // Core CRUD operations
  async listReferences(filter?: SecretFilter): Promise<SecretReference[]>
  async getReference(id: string): Promise<SecretReference | null>
  async createReference(request: CreateSecretReferenceRequest): Promise<SecretReference>
  async updateReference(id: string, request: UpdateSecretReferenceRequest): Promise<SecretReference | null>
  async deleteReference(id: string): Promise<boolean>
  
  // Secret operations
  async getSecretValue(id: string): Promise<string | null>
  async rotateSecret(id: string): Promise<boolean>
}
```

### Data Types

#### SecretReference

```typescript
interface SecretReference {
  id: string;
  name: string;
  description: string;
  secretType: 'credentials' | 'certificate' | 'key' | 'token' | 'other';
  format: 'json' | 'yaml' | 'text' | 'binary';
  encoding: 'utf-8' | 'base64' | 'hex';
  classification: 'public' | 'internal' | 'confidential' | 'secret';
  compliance: string[];
  dataRetention: number; // days
  owner: string;
  team: string;
  costCenter: string;
  rotationPolicy: RotationPolicy;
  usageCount: number;
  lastAccessed: string;
  accessPatterns: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
```

#### RotationPolicy

```typescript
interface RotationPolicy {
  enabled: boolean;
  interval: number; // days
  lastRotated: string;
  nextRotation: string;
  rotationHistory: RotationEvent[];
}
```

### API Methods

#### listReferences

Retrieves secret references with optional filtering.

```typescript
async listReferences(filter?: SecretFilter): Promise<SecretReference[]>
```

**Parameters:**
- `filter` (optional): Filter criteria for secrets

**Returns:** Array of secret references

**Example:**
```typescript
const secrets = await secretsService.listReferences({
  secretType: 'credentials',
  classification: 'confidential'
});
```

#### createReference

Creates a new secret reference.

```typescript
async createReference(request: CreateSecretReferenceRequest): Promise<SecretReference>
```

**Parameters:**
- `request`: Secret reference creation request

**Returns:** Newly created secret reference

**Example:**
```typescript
const secretRef = await secretsService.createReference({
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
  labels: {
    environment: 'production',
    service: 'database'
  }
});
```

## 🔧 Mock Data API

### Overview

The mock data system provides realistic test data and utilities for development and testing.

### Core Functions

#### shouldUseMockData

Determines whether mock data should be used based on environment.

```typescript
export const shouldUseMockData = (): boolean
```

**Returns:** True if mock data should be used, false otherwise

**Usage:**
```typescript
if (shouldUseMockData()) {
  return mockBindings;
} else {
  return await api.get('/bindings');
}
```

#### mockDelay

Simulates network latency for realistic testing.

```typescript
export const mockDelay = (ms: number = 100): Promise<void>
```

**Parameters:**
- `ms`: Delay in milliseconds

**Returns:** Promise that resolves after the specified delay

**Usage:**
```typescript
// Simulate API delay
await mockDelay(200);
return mockData;
```

#### applyMockFilter

Applies filtering to mock data arrays.

```typescript
export const applyMockFilter = <T>(data: T[], filter: any): T[]
```

**Parameters:**
- `data`: Array of data to filter
- `filter`: Filter criteria

**Returns:** Filtered array

**Usage:**
```typescript
const filteredBindings = applyMockFilter(mockBindings, {
  status: 'active',
  environment: 'production'
});
```

### Mock Data Objects

#### mockBindings

Array of mock MCP server bindings for testing.

```typescript
export const mockBindings: MCPServerBinding[]
```

#### mockProviders

Array of mock secrets providers for testing.

```typescript
export const mockProviders: Provider[]
```

#### mockSecretReferences

Array of mock secret references for testing.

```typescript
export const mockSecretReferences: SecretReference[]
```

## 🧪 Testing API

### Test Utilities

#### Jest Mocking

```typescript
// Mock external services
jest.mock('../../services/secrets');
jest.mock('../../services/providers');

// Get mocked modules
const mockSecretsService = require('../../services/secrets');
const mockProvidersService = require('../../services/providers');

// Setup mock implementations
beforeEach(() => {
  mockSecretsService.getReference.mockResolvedValue(mockSecretReferences[0]);
  mockProvidersService.getProvider.mockResolvedValue(mockProviders[0]);
});
```

#### Mock API Responses

```typescript
// Mock API calls
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

## 🔄 Error Handling

### Error Types

#### API Errors

```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}
```

#### Service Errors

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
```

### Error Handling Patterns

#### Try-Catch with Fallback

```typescript
async listBindings(filter?: BindingFilter): Promise<MCPServerBinding[]> {
  try {
    if (process.env.NODE_ENV === 'test') {
      return this.filterMockBindings(mockBindings, filter);
    }
    
    if (shouldUseMockData()) {
      return this.filterMockBindings(mockBindings, filter);
    }
    
    const response = await api.get('/bindings', { params: filter });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔄 Falling back to mock data due to API failure');
      return this.filterMockBindings(mockBindings, filter);
    }
    throw error;
  }
}
```

## 📊 Performance Considerations

### Mock Data Optimization

- Mock data is loaded lazily to reduce memory usage
- Efficient filtering algorithms for large datasets
- Proper cleanup to prevent memory leaks

### API Response Caching

- Mock responses are cached during test execution
- Service state is reset between tests
- No persistent state between test runs

## 🔐 Security Considerations

### Mock Data Security

- All mock data is fictional and contains no real secrets
- No production credentials or sensitive information
- Mock data is isolated to development and test environments

### API Security

- No real API calls during testing
- All external dependencies are mocked
- Secure fallback mechanisms for development

## 📚 Usage Examples

### Complete Service Usage

```typescript
// Initialize services
const bindingsService = new BindingsService();
const providersService = new ProvidersService();
const secretsService = new SecretsService();

// Create a provider
const vaultProvider = await providersService.createProvider({
  name: 'Test Vault',
  type: 'vault',
  description: 'Test HashiCorp Vault instance',
  config: {
    url: 'https://vault.test.local',
    authMethod: 'token'
  },
  metadata: {
    environment: 'test',
    region: 'local',
    version: '1.0.0'
  }
});

// Create a secret reference
const secretRef = await secretsService.createReference({
  name: 'test-credentials',
  description: 'Test credentials',
  secretType: 'credentials',
  format: 'json',
  encoding: 'utf-8',
  classification: 'internal',
  compliance: ['TEST'],
  dataRetention: 30,
  owner: 'test-user',
  team: 'test-team',
  costCenter: 'TEST-001'
});

// Create a binding
const binding = await bindingsService.createBinding({
  name: 'Test Binding',
  description: 'Test MCP server binding',
  runtimeConfig: {
    environment: 'test',
    region: 'local',
    version: '1.0.0'
  }
});

// List all bindings
const allBindings = await bindingsService.listBindings();
console.log(`Found ${allBindings.length} bindings`);
```

### Testing Examples

```typescript
describe('BindingsService Integration', () => {
  let bindingsService: BindingsService;
  
  beforeEach(() => {
    bindingsService = new BindingsService();
  });
  
  it('should create and retrieve binding', async () => {
    const newBinding = await bindingsService.createBinding({
      name: 'Test Binding',
      description: 'Test description',
      runtimeConfig: {
        environment: 'test',
        region: 'local',
        version: '1.0.0'
      }
    });
    
    expect(newBinding.id).toBeDefined();
    expect(newBinding.name).toBe('Test Binding');
    
    const retrieved = await bindingsService.getBinding(newBinding.id);
    expect(retrieved).toEqual(newBinding);
  });
  
  it('should list bindings with filter', async () => {
    const bindings = await bindingsService.listBindings({
      status: 'active'
    });
    
    expect(bindings).toHaveLength(2);
    expect(bindings.every(b => b.status === 'active')).toBe(true);
  });
});
```

---

*This API documentation provides comprehensive coverage of all service interfaces, data types, and usage patterns. For implementation details, refer to the source code and test files.*
