// Mock data service for development when backend API is not available
import { Provider, VaultProvider, AWSProvider, AzureProvider } from '../types/providers';
import { SecretReference } from '../types/secrets';
import { MCPServerBinding } from '../types/bindings';

// Mock providers data
export const mockProviders: Provider[] = [
  {
    id: 'vault-corp',
    name: 'Corporate Vault',
    type: 'vault',
    description: 'Main HashiCorp Vault instance for corporate secrets',
    status: 'active',
    config: {
      address: 'https://vault.corp.example.com',
      namespace: 'corp',
      auth: {
        method: 'approle',
        appRole: {
          roleId: 'mock-role-id',
          secretId: 'mock-secret-id'
        }
      }
    },
    metadata: {
      environment: 'production',
      team: 'platform',
      region: 'us-east-1',
      tags: ['corporate', 'production', 'vault']
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  } as VaultProvider,
  {
    id: 'aws-secrets',
    name: 'AWS Secrets Manager',
    type: 'aws',
    description: 'AWS Secrets Manager for cloud-native applications',
    status: 'active',
    config: {
      region: 'us-east-1',
      auth: {
        method: 'iam',
        iam: {
          roleArn: 'arn:aws:iam::123456789012:role/SecretsManagerRole'
        }
      }
    },
    metadata: {
      environment: 'production',
      team: 'cloud',
      region: 'us-east-1',
      tags: ['aws', 'cloud', 'production']
    },
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  } as AWSProvider,
  {
    id: 'azure-keyvault',
    name: 'Azure Key Vault',
    type: 'azure',
    description: 'Azure Key Vault for Microsoft ecosystem integration',
    status: 'active',
    config: {
      vaultName: 'fortifai-keyvault',
      tenantId: 'mock-tenant-id',
      auth: {
        method: 'workload-identity',
        workloadIdentity: {
          clientId: 'mock-client-id',
          namespace: 'default'
        }
      }
    },
    metadata: {
      environment: 'production',
      team: 'enterprise',
      region: 'eastus',
      tags: ['azure', 'enterprise', 'production']
    },
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString()
  } as AzureProvider
];

// Mock secret references data
export const mockSecretReferences: SecretReference[] = [
  {
    id: 'openai-api-key',
    name: 'OpenAI API Key',
    description: 'API key for OpenAI services integration',
    providerId: 'vault-corp',
    path: 'secrets/openai/api-key',
    version: 'v1',
    metadata: {
      category: 'api-keys',
      priority: 'high',
      classification: 'confidential',
      environment: 'production',
      team: 'ai',
      owner: 'ai-team',
      tags: ['openai', 'api-key', 'ai'],
      lastRotated: new Date('2024-01-15').toISOString(),
      rotationPolicy: 'monthly',
      expiryDate: new Date('2024-04-15').toISOString()
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'database-password',
    name: 'Database Password',
    description: 'Production database connection password',
    providerId: 'vault-corp',
    path: 'secrets/database/prod/password',
    version: 'v2',
    metadata: {
      category: 'database',
      priority: 'critical',
      classification: 'secret',
      environment: 'production',
      team: 'database',
      owner: 'db-team',
      tags: ['database', 'password', 'production'],
      lastRotated: new Date('2024-01-10').toISOString(),
      rotationPolicy: 'quarterly',
      expiryDate: new Date('2024-04-10').toISOString()
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 'jwt-secret',
    name: 'JWT Secret',
    description: 'Secret key for JWT token signing',
    providerId: 'aws-secrets',
    path: 'jwt/signing-key',
    version: 'v1',
    metadata: {
      category: 'authentication',
      priority: 'high',
      classification: 'secret',
      environment: 'production',
      team: 'security',
      owner: 'security-team',
      tags: ['jwt', 'authentication', 'security'],
      lastRotated: new Date('2024-01-20').toISOString(),
      rotationPolicy: 'monthly',
      expiryDate: new Date('2024-02-20').toISOString()
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  }
];

// Mock MCP bindings data
export const mockBindings: MCPServerBinding[] = [
  {
    id: 'mcp-server-1',
    name: 'Production MCP Server',
    description: 'Main MCP server for production workloads',
    targetType: 'mcp-server',
    targetName: 'mcp-prod-01',
    secretId: 'openai-api-key',
    envVarName: 'OPENAI_API_KEY',
    provider: 'vault-corp',
    status: 'active',
    required: true,
    environment: 'production',
    metadata: {
      team: 'ai',
      owner: 'ai-team',
      tags: ['mcp', 'production', 'openai']
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    lastUsed: new Date('2024-01-20').toISOString()
  },
  {
    id: 'notebook-binding-1',
    name: 'Data Science Notebook',
    description: 'Jupyter notebook for data analysis',
    targetType: 'notebook',
    targetName: 'ds-notebook-01',
    secretId: 'database-password',
    envVarName: 'DB_PASSWORD',
    provider: 'vault-corp',
    status: 'active',
    required: true,
    environment: 'production',
    metadata: {
      team: 'data-science',
      owner: 'ds-team',
      tags: ['notebook', 'database', 'production']
    },
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    lastUsed: new Date('2024-01-20').toISOString()
  }
];

// Mock service responses
export const createMockResponse = <T>(data: T, success: boolean = true, message?: string) => ({
  data,
  success,
  message: message || (success ? 'Success' : 'Error'),
  error: success ? undefined : 'Mock error'
});

// Mock paginated response
export const createMockPaginatedResponse = <T>(data: T[], page: number = 1, perPage: number = 10, total: number = data.length) => ({
  data,
  success: true,
  message: 'Success',
  pagination: {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage)
  }
});

// Check if mock data should be used
export const shouldUseMockData = (): boolean => {
  // Check multiple ways to determine if we're in development mode
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
    (typeof window !== 'undefined' && window.location.port === '5173')
  );
};

// Mock delay to simulate network latency
export const mockDelay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
