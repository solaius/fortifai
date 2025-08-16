// Mock data service for development when backend API is not available
import { Provider, VaultProvider, AWSProvider, AzureProvider } from '../types/providers';
import { SecretReference, RotationPolicy, Permission } from '../types/secrets';
import { MCPServerBinding } from '../types/bindings';

// Mock providers data
export const mockProviders: Provider[] = [
  {
    id: 'vault-corp',
    name: 'Corporate Vault',
    type: 'vault' as const,
    status: 'healthy' as const,
    authMethod: 'approle',
    address: 'https://vault.corp.example.com',
    scopes: ['secrets', 'auth'],
    lastHealthCheck: new Date().toISOString(),
    secretCount: 150,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'platform-team',
    namespace: 'corp',
    labels: {
      environment: 'production',
      team: 'platform'
    },
    annotations: {},
    config: {
      address: 'https://vault.corp.example.com',
      namespace: 'corp',
      tlsSkipVerify: false,
      timeout: 30,
      maxRetries: 3
    },
    auth: {
      method: 'approle' as const,
      appRole: {
        roleId: 'mock-role-id',
        secretId: 'mock-secret-id'
      }
    },
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canList: true,
      canUpdate: true
    }
  } as VaultProvider,
    {
    id: 'aws-secrets',
    name: 'AWS Secrets Manager',
    type: 'aws' as const,
    status: 'healthy' as const,
    authMethod: 'iam-role',
    address: 'https://secretsmanager.us-east-1.amazonaws.com',
    scopes: ['secrets', 'kms'],
    lastHealthCheck: new Date().toISOString(),
    secretCount: 75,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    createdBy: 'cloud-team',
    namespace: 'aws',
    labels: {
      environment: 'production',
      team: 'cloud'
    },
    annotations: {},
    config: {
      region: 'us-east-1',
      maxRetries: 3,
      timeout: 30
    },
    auth: {
      method: 'iam-role' as const,
      roleArn: 'arn:aws:iam::123456789012:role/SecretsManagerRole'
    },
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canList: true,
      canUpdate: true
    }
  } as AWSProvider,
    {
    id: 'azure-keyvault',
    name: 'Azure Key Vault',
    type: 'azure' as const,
    status: 'healthy' as const,
    authMethod: 'workload-identity',
    address: 'https://fortifai-keyvault.vault.azure.net',
    scopes: ['keys', 'secrets', 'certificates'],
    lastHealthCheck: new Date().toISOString(),
    secretCount: 45,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString(),
    createdBy: 'enterprise-team',
    namespace: 'azure',
    labels: {
      environment: 'production',
      team: 'enterprise'
    },
    annotations: {},
    config: {
      vaultName: 'fortifai-keyvault',
      tenantId: 'mock-tenant-id',
      subscriptionId: 'mock-subscription-id',
      resourceGroup: 'fortifai-rg',
      environment: 'AzureCloud' as const,
      timeout: 30
    },
    auth: {
      method: 'workload-identity' as const,
      clientId: 'mock-client-id',
      namespace: 'default'
    },
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canList: true,
      canUpdate: true
    }
  } as AzureProvider
];

// Mock secret references data
export const mockSecretReferences: SecretReference[] = [
  {
    id: 'openai-api-key',
    name: 'OpenAI API Key',
    description: 'API key for OpenAI services integration',
    providerId: 'vault-corp',
    providerType: 'vault' as const,
    path: 'secrets/openai/api-key',
    version: 'v1',
    versionSelector: {
      type: 'latest' as const,
      value: 'v1'
    },
    labels: {},
    annotations: {},
    namespace: 'default',
    project: 'ai-platform',
    tags: ['openai', 'api-key', 'ai'],
    accessControl: {
      roles: [
        {
          role: 'ai-developer',
          permissions: ['read', 'list'] as Permission[]
        }
      ],
      allowedNetworks: ['10.0.0.0/8'],
      allowedNamespaces: ['default', 'ai'],
      allowedProjects: ['ai-platform'],
      requireMFA: true,
      requireApproval: false
    },
    lifecycle: {
      allowCreation: true,
      allowModification: true,
      allowDeletion: false,
      maxVersions: 10,
      versionRetention: 365,
      archivalPolicy: {
        enabled: false,
        trigger: 'manual' as const,
        destination: 'backup' as const
      },
      deletionPolicy: {
        enabled: false,
        trigger: 'manual' as const,
        softDelete: true,
        retentionPeriod: 730
      },
      notifications: []
    },
    createdBy: 'ai-team',
           metadata: {
         displayName: 'OpenAI API Key',
         description: 'API key for OpenAI services integration',
         category: 'api-keys',
         priority: 'high' as const,
         secretType: 'api-key' as const,
         format: 'text' as const,
         encoding: 'plaintext' as const,
         classification: 'confidential' as const,
         compliance: ['GDPR', 'SOC2'],
         dataRetention: 365,
         owner: 'ai-team',
         team: 'ai',
         costCenter: 'AI-001',
         environment: 'production' as const,
         rotationPolicy: {
           enabled: true,
           type: 'automatic' as const,
           interval: 30,
           method: 'create-new' as const,
           notificationBefore: 7,
           notificationAfter: 1,
           approvers: ['ai-team-lead']
         },
         lastRotated: new Date('2024-01-15').toISOString(),
         nextRotation: new Date('2024-02-15').toISOString(),
         rotationHistory: [],
         usageCount: 0,
         lastAccessed: new Date().toISOString(),
         accessPatterns: []
       },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'database-password',
    name: 'Database Password',
    description: 'Production database connection password',
    providerId: 'vault-corp',
    providerType: 'vault' as const,
    path: 'secrets/database/prod/password',
    version: 'v2',
    versionSelector: {
      type: 'latest' as const,
      value: 'v2'
    },
    labels: {},
    annotations: {},
    namespace: 'default',
    project: 'database-platform',
    tags: ['database', 'password', 'production'],
    accessControl: {
      roles: [
        {
          role: 'db-admin',
          permissions: ['read', 'list'] as Permission[]
        }
      ],
      allowedNetworks: ['10.0.0.0/8'],
      allowedNamespaces: ['default', 'database'],
      allowedProjects: ['database-platform'],
      requireMFA: true,
      requireApproval: false
    },
    lifecycle: {
      allowCreation: true,
      allowModification: true,
      allowDeletion: false,
      maxVersions: 10,
      versionRetention: 365,
      archivalPolicy: {
        enabled: false,
        trigger: 'manual' as const,
        destination: 'backup' as const
      },
      deletionPolicy: {
        enabled: false,
        trigger: 'manual' as const,
        softDelete: true,
        retentionPeriod: 730
      },
      notifications: []
    },
    createdBy: 'db-team',
           metadata: {
         displayName: 'Database Password',
         description: 'Production database connection password',
         category: 'database',
         priority: 'critical' as const,
         secretType: 'password' as const,
         format: 'text' as const,
         encoding: 'plaintext' as const,
         classification: 'secret' as const,
         compliance: ['GDPR', 'SOC2', 'PCI'],
         dataRetention: 730,
         owner: 'db-team',
         team: 'database',
         costCenter: 'DB-001',
         environment: 'production' as const,
         rotationPolicy: {
           enabled: true,
           type: 'scheduled' as const,
           interval: 90,
           method: 'create-new' as const,
           notificationBefore: 14,
           notificationAfter: 1,
           approvers: ['db-team-lead']
         },
         lastRotated: new Date('2024-01-10').toISOString(),
         nextRotation: new Date('2024-04-10').toISOString(),
         rotationHistory: [],
         usageCount: 0,
         lastAccessed: new Date().toISOString(),
         accessPatterns: []
       },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 'jwt-secret',
    name: 'JWT Secret',
    description: 'Secret key for JWT token signing',
    providerId: 'aws-secrets',
    providerType: 'aws' as const,
    path: 'jwt/signing-key',
    version: 'v1',
    versionSelector: {
      type: 'latest' as const,
      value: 'v1'
    },
    labels: {},
    annotations: {},
    namespace: 'default',
    project: 'security-platform',
    tags: ['jwt', 'authentication', 'security'],
    accessControl: {
      roles: [
        {
          role: 'security-admin',
          permissions: ['read', 'list'] as Permission[]
        }
      ],
      allowedNetworks: ['10.0.0.0/8'],
      allowedNamespaces: ['default', 'security'],
      allowedProjects: ['security-platform'],
      requireMFA: true,
      requireApproval: false
    },
    lifecycle: {
      allowCreation: true,
      allowModification: true,
      allowDeletion: false,
      maxVersions: 10,
      versionRetention: 365,
      archivalPolicy: {
        enabled: false,
        trigger: 'manual' as const,
        destination: 'backup' as const
      },
      deletionPolicy: {
        enabled: false,
        trigger: 'manual' as const,
        softDelete: true,
        retentionPeriod: 730
      },
      notifications: []
    },
    createdBy: 'security-team',
           metadata: {
         displayName: 'JWT Secret',
         description: 'Secret key for JWT token signing',
         category: 'authentication',
         priority: 'high' as const,
         secretType: 'private-key' as const,
         format: 'text' as const,
         encoding: 'base64' as const,
         classification: 'secret' as const,
         compliance: ['GDPR', 'SOC2', 'OAuth2'],
         dataRetention: 365,
         owner: 'security-team',
         team: 'security',
         costCenter: 'SEC-001',
         environment: 'production' as const,
         rotationPolicy: {
           enabled: true,
           type: 'automatic' as const,
           interval: 30,
           method: 'create-new' as const,
           notificationBefore: 7,
           notificationAfter: 1,
           approvers: ['security-team-lead']
         },
         lastRotated: new Date('2024-01-20').toISOString(),
         nextRotation: new Date('2024-02-20').toISOString(),
         rotationHistory: [],
         usageCount: 0,
         lastAccessed: new Date().toISOString(),
         accessPatterns: []
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
    serverId: 'mcp-prod-01',
    serverName: 'mcp-prod-01',
    serverType: 'mcp-server' as const,
    environment: 'production' as const,
    namespace: 'default',
    secretBindings: [
      {
        id: 'secret-binding-1',
        secretReferenceId: 'openai-api-key',
        secretName: 'OpenAI API Key',
        secretPath: 'secrets/openai/api-key',
        providerType: 'vault',
        envVarName: 'OPENAI_API_KEY',
        envVarType: 'string' as const,
        accessLevel: 'read' as const,
        required: true,
        category: 'api-keys',
        priority: 'high' as const,
        refreshInterval: 0,
        refreshCount: 0,
        errorHandling: {
          strategy: 'fail-fast' as const,
          maxRetries: 3,
          retryDelay: 5,
          logErrors: true,
          notifyOnError: false
        },
        lastError: undefined,
        errorCount: 0,
        lastRefreshed: new Date().toISOString()
      }
    ],
    runtimeConfig: {
      deploymentStrategy: 'rolling' as const,
      replicas: 1,
      resources: {
        cpu: {
          request: '100m',
          limit: '500m'
        },
        memory: {
          request: '128Mi',
          limit: '256Mi'
        }
      },
      envVars: [],
      volumeMounts: [],
      securityContext: {},
      healthChecks: [
        {
          type: 'http' as const,
          path: '/health',
          port: 8080,
          initialDelaySeconds: 30,
          periodSeconds: 10,
          timeoutSeconds: 5,
          successThreshold: 1,
          failureThreshold: 3
        }
      ],
      monitoring: {
        enabled: true,
        metrics: {
          port: 9090,
          path: '/metrics'
        },
        tracing: {
          enabled: true,
          sampler: 0.1,
          backend: 'jaeger'
        },
        alerting: {
          enabled: true,
          rules: []
        }
      },
      logging: {
        level: 'info',
        format: 'json',
        output: 'stdout',
        retention: 30
      }
    },
    validationStatus: {
      status: 'valid' as const,
      errors: [],
      warnings: [],
      lastValidated: new Date().toISOString(),
      validationDuration: 150
    },
    lastValidation: new Date().toISOString(),
    healthStatus: 'healthy' as const,
    labels: {},
    annotations: {},
        tags: ['mcp', 'production', 'openai'],
    status: 'active' as const,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'ai-team',
    deploymentCount: 1
  },
  {
    id: 'notebook-binding-1',
    name: 'Data Science Notebook',
    description: 'Jupyter notebook for data analysis',
    serverId: 'notebook-ds-01',
    serverName: 'notebook-ds-01',
    serverType: 'mcp-client' as const,
    environment: 'production' as const,
    namespace: 'default',
    secretBindings: [
      {
        id: 'secret-binding-2',
        secretReferenceId: 'database-password',
        secretName: 'Database Password',
        secretPath: 'secrets/database/prod/password',
        providerType: 'vault',
        envVarName: 'DB_PASSWORD',
        envVarType: 'string' as const,
        accessLevel: 'read' as const,
        required: true,
        category: 'database',
        priority: 'critical' as const,
        refreshInterval: 0,
        refreshCount: 0,
        errorHandling: {
          strategy: 'fail-fast' as const,
          maxRetries: 3,
          retryDelay: 5,
          logErrors: true,
          notifyOnError: false
        },
        lastError: undefined,
        errorCount: 0,
        lastRefreshed: new Date().toISOString()
      }
    ],
    runtimeConfig: {
      deploymentStrategy: 'rolling' as const,
      replicas: 1,
      resources: {
        cpu: {
          request: '100m',
          limit: '500m'
        },
        memory: {
          request: '128Mi',
          limit: '256Mi'
        }
      },
      envVars: [],
      volumeMounts: [],
      securityContext: {},
      healthChecks: [
        {
          type: 'http' as const,
          path: '/health',
          port: 8080,
          initialDelaySeconds: 30,
          periodSeconds: 10,
          timeoutSeconds: 5,
          successThreshold: 1,
          failureThreshold: 3
        }
      ],
      monitoring: {
        enabled: true,
        metrics: {
          port: 9090,
          path: '/metrics'
        },
        tracing: {
          enabled: true,
          sampler: 0.1,
          backend: 'jaeger'
        },
        alerting: {
          enabled: true,
          rules: []
        }
      },
      logging: {
        level: 'info',
        format: 'json',
        output: 'stdout',
        retention: 30
      }
    },
    validationStatus: {
      status: 'valid' as const,
      errors: [],
      warnings: [],
      lastValidated: new Date().toISOString(),
      validationDuration: 150
    },
    lastValidation: new Date().toISOString(),
    healthStatus: 'healthy' as const,
    labels: {},
    annotations: {},
    tags: ['notebook', 'database', 'production'],
    status: 'active' as const,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    createdBy: 'ds-team',
    deploymentCount: 1
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
