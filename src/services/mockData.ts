// Mock data service for development when backend API is not available
import { Provider, VaultProvider, AWSProvider, AzureProvider } from '../types/providers';
import { SecretReference, RotationPolicy, Permission } from '../types/secrets';
import { MCPServerBinding } from '../types/bindings';
import { Role, Permission as RBACPermission, Policy } from '../types/rbac';

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

// ============================================================================
// MOCK RBAC DATA
// ============================================================================

// Mock RBAC permissions
export const mockPermissions: RBACPermission[] = [
  {
    id: 'perm-providers-read',
    name: 'providers:read',
    displayName: 'Read Providers',
    description: 'Can view provider configurations and status',
    resource: 'providers',
    action: 'read',
    scope: { type: 'global' },
    metadata: {
      category: 'provider',
      priority: 100,
      tags: ['provider', 'read'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-providers-write',
    name: 'providers:write',
    displayName: 'Write Providers',
    description: 'Can create, update, and delete provider configurations',
    resource: 'providers',
    action: 'write',
    scope: { type: 'global' },
    metadata: {
      category: 'provider',
      priority: 200,
      tags: ['provider', 'write'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-secrets-read',
    name: 'secrets:read',
    displayName: 'Read Secrets',
    description: 'Can view secret references and metadata',
    resource: 'secrets',
    action: 'read',
    scope: { type: 'global' },
    metadata: {
      category: 'secret',
      priority: 100,
      tags: ['secret', 'read'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-secrets-write',
    name: 'secrets:write',
    displayName: 'Write Secrets',
    description: 'Can create, update, and delete secret references',
    resource: 'secrets',
    action: 'write',
    scope: { type: 'global' },
    metadata: {
      category: 'secret',
      priority: 200,
      tags: ['secret', 'write'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-bindings-read',
    name: 'bindings:read',
    displayName: 'Read Bindings',
    description: 'Can view MCP server bindings and configurations',
    resource: 'bindings',
    action: 'read',
    scope: { type: 'global' },
    metadata: {
      category: 'binding',
      priority: 100,
      tags: ['binding', 'read'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-bindings-write',
    name: 'bindings:write',
    displayName: 'Write Bindings',
    description: 'Can create, update, and delete MCP server bindings',
    resource: 'bindings',
    action: 'write',
    scope: { type: 'global' },
    metadata: {
      category: 'binding',
      priority: 200,
      tags: ['binding', 'write'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-policies-read',
    name: 'policies:read',
    displayName: 'Read Policies',
    description: 'Can view RBAC policies and rules',
    resource: 'policies',
    action: 'read',
    scope: { type: 'global' },
    metadata: {
      category: 'policy',
      priority: 100,
      tags: ['policy', 'read'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-policies-write',
    name: 'policies:write',
    displayName: 'Write Policies',
    description: 'Can create, update, and delete RBAC policies',
    resource: 'policies',
    action: 'write',
    scope: { type: 'global' },
    metadata: {
      category: 'policy',
      priority: 300,
      tags: ['policy', 'write'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-audit-read',
    name: 'audit:read',
    displayName: 'Read Audit Logs',
    description: 'Can view audit logs and access history',
    resource: 'audit',
    action: 'read',
    scope: { type: 'global' },
    metadata: {
      category: 'audit',
      priority: 100,
      tags: ['audit', 'read'],
      labels: {},
      annotations: {}
    }
  },
  {
    id: 'perm-audit-export',
    name: 'audit:export',
    displayName: 'Export Audit Logs',
    description: 'Can export audit logs and reports',
    resource: 'audit',
    action: 'export',
    scope: { type: 'global' },
    metadata: {
      category: 'audit',
      priority: 200,
      tags: ['audit', 'export'],
      labels: {},
      annotations: {}
    }
  }
];

// Mock RBAC roles
export const mockRoles: Role[] = [
  {
    id: 'role-org-admin',
    name: 'org-admin',
    displayName: 'Organization Administrator',
    description: 'Full access to all resources and administrative functions',
    permissions: [],
    isSystem: true,
    isDefault: false,
    metadata: {
      category: 'administrative',
      priority: 1000,
      tags: ['admin', 'full-access'],
      labels: { tier: 'admin' },
      annotations: {}
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system'
  },
  {
    id: 'role-project-admin',
    name: 'project-admin',
    displayName: 'Project Administrator',
    description: 'Administrative access to project resources and team management',
    permissions: [],
    isSystem: true,
    isDefault: false,
    metadata: {
      category: 'administrative',
      priority: 800,
      tags: ['admin', 'project'],
      labels: { tier: 'project-admin' },
      annotations: {}
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system'
  },
  {
    id: 'role-secret-editor',
    name: 'secret-editor',
    displayName: 'Secret Editor',
    description: 'Can manage secrets and bindings for assigned resources',
    permissions: [],
    isSystem: true,
    isDefault: true,
    metadata: {
      category: 'operational',
      priority: 500,
      tags: ['secret', 'editor'],
      labels: { tier: 'editor' },
      annotations: {}
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system'
  },
  {
    id: 'role-secret-viewer',
    name: 'secret-viewer',
    displayName: 'Secret Viewer',
    description: 'Read-only access to secrets and bindings',
    permissions: [],
    isSystem: true,
    isDefault: true,
    metadata: {
      category: 'operational',
      priority: 300,
      tags: ['secret', 'viewer'],
      labels: { tier: 'viewer' },
      annotations: {}
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'system'
  },
  {
    id: 'role-ml-engineer',
    name: 'ml-engineer',
    displayName: 'ML Engineer',
    description: 'Specialized role for machine learning workloads and AI secrets',
    permissions: [],
    isSystem: false,
    isDefault: false,
    metadata: {
      category: 'specialized',
      priority: 600,
      tags: ['ml', 'ai', 'engineer'],
      labels: { tier: 'specialist' },
      annotations: {}
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'admin'
  }
];

// Mock RBAC policies
export const mockPolicies: Policy[] = [
  {
    id: 'policy-finance-access',
    name: 'finance-access',
    displayName: 'Finance Team Access',
    description: 'Allow finance team to access financial secrets',
    effect: 'allow',
    priority: 100,
    status: 'active',
    rules: [
      {
        id: 'rule-finance-role',
        type: 'role',
        value: ['finance-admin', 'finance-user'],
        operator: 'in'
      },
      {
        id: 'rule-finance-namespace',
        type: 'namespace',
        value: 'finance',
        operator: 'equals'
      }
    ],
    targets: {
      resources: ['secrets'],
      actions: ['read', 'bind'],
      pathPrefixes: ['kv/data/finance/'],
      targetTypes: ['mcp-server', 'notebook']
    },
    conditions: [],
    metadata: {
      category: 'team-access',
      tags: ['finance', 'allow'],
      labels: { team: 'finance' },
      annotations: {},
      compliance: {
        standards: ['SOC2'],
        requirements: ['financial-data-access'],
        controls: ['access-control'],
        evidence: []
      },
      risk: {
        level: 'medium',
        factors: ['financial-data'],
        mitigation: ['role-based-access', 'audit-logging'],
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    version: 1,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'policy-prod-deny',
    name: 'production-deny',
    displayName: 'Production Secrets Deny',
    description: 'Deny access to production secrets for non-production users',
    effect: 'deny',
    priority: 200,
    status: 'active',
    rules: [
      {
        id: 'rule-non-prod-role',
        type: 'role',
        value: ['developer', 'data-scientist'],
        operator: 'in'
      },
      {
        id: 'rule-prod-path',
        type: 'resource',
        value: ['/prod/', '/production/'],
        operator: 'in'
      }
    ],
    targets: {
      resources: ['secrets'],
      actions: ['read', 'bind'],
      pathPrefixes: ['kv/data/prod/', 'aws/prod/', 'azure/prod/'],
      targetTypes: ['mcp-server', 'agent', 'notebook', 'job']
    },
    conditions: [],
    metadata: {
      category: 'security',
      tags: ['production', 'deny', 'security'],
      labels: { environment: 'production' },
      annotations: {},
      compliance: {
        standards: ['SOC2', 'ISO27001'],
        requirements: ['production-access-control'],
        controls: ['least-privilege'],
        evidence: []
      },
      risk: {
        level: 'high',
        factors: ['production-data', 'unauthorized-access'],
        mitigation: ['role-restriction', 'path-filtering'],
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    version: 1,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'policy-ml-access',
    name: 'ml-access',
    displayName: 'ML Team Access',
    description: 'Allow ML team to access AI and data secrets',
    effect: 'allow',
    priority: 150,
    status: 'active',
    rules: [
      {
        id: 'rule-ml-role',
        type: 'role',
        value: ['ml-engineer', 'data-scientist'],
        operator: 'in'
      },
      {
        id: 'rule-ml-namespace',
        type: 'namespace',
        value: 'ml',
        operator: 'equals'
      }
    ],
    targets: {
      resources: ['secrets'],
      actions: ['read', 'bind'],
      pathPrefixes: ['kv/data/ml/', 'azure/ml/'],
      targetTypes: ['mcp-server', 'notebook', 'job']
    },
    conditions: [],
    metadata: {
      category: 'team-access',
      tags: ['ml', 'ai', 'allow'],
      labels: { team: 'ml' },
      annotations: {},
      compliance: {
        standards: ['SOC2'],
        requirements: ['ai-data-access'],
        controls: ['role-based-access'],
        evidence: []
      },
      risk: {
        level: 'medium',
        factors: ['ai-model-access'],
        mitigation: ['role-restriction', 'namespace-isolation'],
        reviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    version: 1,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    createdBy: 'admin'
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
    process.env.NODE_ENV === 'test' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
    (typeof window !== 'undefined' && window.location.port === '5173')
  );
};

// ============================================================================
// MOCK DATA GETTERS
// ============================================================================

export const getMockProviders = (): Provider[] => mockProviders;
export const getMockSecretReferences = (): SecretReference[] => mockSecretReferences;
export const getMockBindings = (): MCPServerBinding[] => mockBindings;
export const getMockRoles = (): Role[] => mockRoles;
export const getMockPermissions = (): RBACPermission[] => mockPermissions;
export const getMockPolicies = (): Policy[] => mockPolicies;

// Mock delay to simulate network latency
export const mockDelay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
