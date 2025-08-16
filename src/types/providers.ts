export interface BaseProvider {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  authMethod: string;
  address: string;
  scopes: string[];
  lastHealthCheck: string;
  secretCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export type ProviderType = 'vault' | 'aws' | 'azure';
export type ProviderStatus = 'healthy' | 'warning' | 'critical' | 'disconnected' | 'configuring';

export interface VaultProvider extends BaseProvider {
  type: 'vault';
  config: VaultConfig;
  auth: VaultAuth;
  capabilities: VaultCapabilities;
}

export interface VaultConfig {
  address: string;
  namespace?: string;
  tlsSkipVerify: boolean;
  tlsServerName?: string;
  timeout: number;
  maxRetries: number;
}

export interface VaultAuth {
  method: 'approle' | 'kubernetes' | 'token' | 'ldap';
  appRole?: {
    roleId: string;
    secretId: string;
  };
  kubernetes?: {
    role: string;
    jwt: string;
    mountPath: string;
  };
  token?: string;
  ldap?: {
    username: string;
    password: string;
  };
}

export interface VaultCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canList: boolean;
  canUpdate: boolean;
}

export interface AWSProvider extends BaseProvider {
  type: 'aws';
  config: AWSConfig;
  auth: AWSAuth;
  capabilities: AWSCapabilities;
}

export interface AWSConfig {
  region: string;
  endpoint?: string;
  maxRetries: number;
  timeout: number;
}

export interface AWSAuth {
  method: 'iam-role' | 'access-key' | 'assume-role';
  accessKeyId?: string;
  secretAccessKey?: string;
  roleArn?: string;
  sessionName?: string;
}

export interface AWSCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canList: boolean;
  canUpdate: boolean;
}

export interface AzureProvider extends BaseProvider {
  type: 'azure';
  config: AzureConfig;
  auth: AzureAuth;
  capabilities: AzureCapabilities;
}

export interface AzureConfig {
  tenantId: string;
  subscriptionId: string;
  resourceGroup: string;
  vaultName: string;
  environment: 'AzureCloud' | 'AzureUSGovernment' | 'AzureChinaCloud';
  timeout: number;
}

export interface AzureAuth {
  method: 'workload-identity' | 'service-principal' | 'managed-identity';
  clientId?: string;
  clientSecret?: string;
  certificatePath?: string;
  certificatePassword?: string;
}

export interface AzureCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canList: boolean;
  canUpdate: boolean;
}

export interface ProviderHealth {
  status: ProviderStatus;
  lastCheck: string;
  responseTime: number;
  error?: string;
  details: {
    version?: string;
    uptime?: number;
    connections?: number;
    rateLimit?: {
      remaining: number;
      reset: string;
    };
  };
}

export interface ProviderTestResult {
  success: boolean;
  message: string;
  details?: {
    authTest: boolean;
    connectionTest: boolean;
    permissionTest: boolean;
    responseTime: number;
  };
  error?: string;
}

export interface ProviderCreateRequest {
  name: string;
  type: ProviderType;
  config: any;
  auth: any;
  scopes: string[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface ProviderUpdateRequest {
  name?: string;
  config?: any;
  auth?: any;
  scopes?: string[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export type Provider = VaultProvider | AWSProvider | AzureProvider;
