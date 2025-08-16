export interface MCPServerBinding {
  id: string;
  name: string;
  description?: string;
  serverId: string;
  serverName: string;
  serverType: 'mcp-server' | 'mcp-client' | 'custom';
  environment: 'development' | 'staging' | 'production' | 'testing';
  namespace: string;
  project?: string;
  
  // Secret references
  secretBindings: SecretBinding[];
  
  // Runtime configuration
  runtimeConfig: RuntimeConfig;
  
  // Validation and health
  validationStatus: ValidationStatus;
  lastValidation: string;
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  
  // Metadata
  labels: Record<string, string>;
  annotations: Record<string, string>;
  tags: string[];
  
  // Lifecycle
  status: 'active' | 'inactive' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastDeployed?: string;
  deploymentCount: number;
}

export interface SecretBinding {
  id: string;
  secretReferenceId: string;
  secretName: string;
  secretPath: string;
  providerType: 'vault' | 'aws' | 'azure';
  
  // Environment variable mapping
  envVarName: string;
  envVarValue?: string; // Computed value, not stored
  envVarType: 'string' | 'number' | 'boolean' | 'json' | 'file';
  
  // Transformation and validation
  transformation?: ValueTransformation;
  validation?: ValueValidation;
  
  // Access control
  accessLevel: 'read' | 'write' | 'read-write';
  required: boolean;
  
  // Metadata
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Runtime behavior
  refreshInterval?: number; // seconds, 0 = no refresh
  lastRefreshed?: string;
  refreshCount: number;
  
  // Error handling
  errorHandling: ErrorHandling;
  lastError?: string;
  errorCount: number;
}

export interface ValueTransformation {
  type: 'none' | 'base64' | 'json' | 'template' | 'custom';
  template?: string; // For template type
  customScript?: string; // For custom type
  parameters?: Record<string, any>;
}

export interface ValueValidation {
  type: 'none' | 'regex' | 'json' | 'custom';
  pattern?: string; // For regex type
  schema?: any; // For JSON validation
  customScript?: string; // For custom validation
  required: boolean;
  minLength?: number;
  maxLength?: number;
  allowedValues?: string[];
}

export interface ErrorHandling {
  strategy: 'fail-fast' | 'retry' | 'fallback' | 'ignore';
  maxRetries?: number;
  retryDelay?: number; // seconds
  fallbackValue?: string;
  logErrors: boolean;
  notifyOnError: boolean;
  notificationChannels?: string[];
}

export interface RuntimeConfig {
  // Deployment configuration
  deploymentStrategy: 'rolling' | 'recreate' | 'blue-green' | 'canary';
  replicas: number;
  resources: ResourceRequirements;
  
  // Environment variables
  envVars: EnvironmentVariable[];
  
  // Volume mounts
  volumeMounts: VolumeMount[];
  
  // Security context
  securityContext: SecurityContext;
  
  // Health checks
  healthChecks: HealthCheck[];
  
  // Monitoring and logging
  monitoring: MonitoringConfig;
  logging: LoggingConfig;
}

export interface ResourceRequirements {
  cpu: {
    request: string;
    limit: string;
  };
  memory: {
    request: string;
    limit: string;
  };
  storage?: {
    request: string;
    limit: string;
  };
}

export interface EnvironmentVariable {
  name: string;
  value?: string;
  valueFrom?: {
    secretKeyRef?: {
      name: string;
      key: string;
    };
    configMapKeyRef?: {
      name: string;
      key: string;
    };
    fieldRef?: {
      fieldPath: string;
    };
    resourceFieldRef?: {
      containerName: string;
      resource: string;
    };
  };
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  subPath?: string;
  readOnly: boolean;
}

export interface SecurityContext {
  runAsUser?: number;
  runAsGroup?: number;
  runAsNonRoot?: boolean;
  fsGroup?: number;
  capabilities?: {
    add: string[];
    drop: string[];
  };
  seccompProfile?: {
    type: string;
    localhostProfile?: string;
  };
}

export interface HealthCheck {
  type: 'http' | 'tcp' | 'command' | 'grpc';
  path?: string; // For HTTP
  port?: number; // For TCP/HTTP
  command?: string[]; // For command
  initialDelaySeconds: number;
  periodSeconds: number;
  timeoutSeconds: number;
  successThreshold: number;
  failureThreshold: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    port: number;
    path: string;
  };
  tracing: {
    enabled: boolean;
    sampler: number;
    backend: string;
  };
  alerting: {
    enabled: boolean;
    rules: AlertRule[];
  };
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  output: 'stdout' | 'stderr' | 'file';
  filePath?: string;
  maxSize?: string;
  maxFiles?: number;
  retention: number; // days
}

export interface ValidationStatus {
  status: 'valid' | 'invalid' | 'warning' | 'unknown';
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastValidated: string;
  validationDuration: number; // milliseconds
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  severity: 'warning' | 'info';
  suggestion?: string;
}

// Request/Response interfaces
export interface CreateBindingRequest {
  name: string;
  description?: string;
  serverId: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  namespace: string;
  project?: string;
  secretBindings: CreateSecretBindingRequest[];
  runtimeConfig: Partial<RuntimeConfig>;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  tags?: string[];
}

export interface CreateSecretBindingRequest {
  secretReferenceId: string;
  envVarName: string;
  envVarType: 'string' | 'number' | 'boolean' | 'json' | 'file';
  transformation?: Partial<ValueTransformation>;
  validation?: Partial<ValueValidation>;
  accessLevel: 'read' | 'write' | 'read-write';
  required: boolean;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  refreshInterval?: number;
  errorHandling: Partial<ErrorHandling>;
}

export interface UpdateBindingRequest {
  name?: string;
  description?: string;
  environment?: 'development' | 'staging' | 'production' | 'testing';
  namespace?: string;
  project?: string;
  secretBindings?: UpdateSecretBindingRequest[];
  runtimeConfig?: Partial<RuntimeConfig>;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  tags?: string[];
}

export interface UpdateSecretBindingRequest {
  id: string;
  envVarName?: string;
  envVarType?: 'string' | 'number' | 'boolean' | 'json' | 'file';
  transformation?: Partial<ValueTransformation>;
  validation?: Partial<ValueValidation>;
  accessLevel?: 'read' | 'write' | 'read-write';
  required?: boolean;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  refreshInterval?: number;
  errorHandling?: Partial<ErrorHandling>;
}

export interface BindingFilter {
  // Basic filters
  name?: string;
  serverId?: string;
  serverType?: 'mcp-server' | 'mcp-client' | 'custom';
  environment?: 'development' | 'staging' | 'production' | 'testing';
  namespace?: string;
  project?: string;
  
  // Status filters
  status?: 'active' | 'inactive' | 'draft' | 'archived';
  healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
  validationStatus?: 'valid' | 'invalid' | 'warning' | 'unknown';
  
  // Secret binding filters
  hasSecretBinding?: boolean;
  secretCategory?: string;
  secretPriority?: 'low' | 'medium' | 'high' | 'critical';
  
  // Date filters
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  lastDeployedAfter?: string;
  lastDeployedBefore?: string;
  
  // Label and annotation filters
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  tags?: string[];
  
  // Pagination
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BindingSearchResult {
  bindings: MCPServerBinding[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: BindingSearchFacets;
}

export interface BindingSearchFacets {
  serverTypes: FacetCount[];
  environments: FacetCount[];
  namespaces: FacetCount[];
  projects: FacetCount[];
  statuses: FacetCount[];
  healthStatuses: FacetCount[];
  validationStatuses: FacetCount[];
  tags: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

// Deployment interfaces
export interface DeploymentRequest {
  bindingId: string;
  environment: string;
  namespace: string;
  dryRun?: boolean;
  force?: boolean;
  rollbackOnFailure?: boolean;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back';
  message: string;
  errors?: string[];
  warnings?: string[];
  resources?: DeployedResource[];
  rollbackInfo?: RollbackInfo;
}

export interface DeployedResource {
  type: string;
  name: string;
  namespace: string;
  status: string;
  message?: string;
}

export interface RollbackInfo {
  previousDeploymentId: string;
  reason: string;
  timestamp: string;
  resources: DeployedResource[];
}

// Export types for use in other modules
export type {
  MCPServerBinding,
  SecretBinding,
  ValueTransformation,
  ValueValidation,
  ErrorHandling,
  RuntimeConfig,
  ResourceRequirements,
  EnvironmentVariable,
  VolumeMount,
  SecurityContext,
  HealthCheck,
  MonitoringConfig,
  AlertRule,
  LoggingConfig,
  ValidationStatus,
  ValidationError,
  ValidationWarning
};
