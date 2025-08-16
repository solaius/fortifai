export interface SecretReference {
  id: string;
  name: string;
  description?: string;
  providerId: string;
  providerType: 'vault' | 'aws' | 'azure';
  path: string;
  version?: string;
  versionSelector: VersionSelector;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  metadata: SecretMetadata;
  accessControl: AccessControl;
  lifecycle: LifecyclePolicy;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  namespace: string;
  project?: string;
  tags: string[];
}

export interface SecretMetadata {
  // Basic information
  displayName: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Technical details
  secretType: 'password' | 'api-key' | 'certificate' | 'private-key' | 'database' | 'other';
  format: 'text' | 'json' | 'yaml' | 'binary' | 'pem' | 'p12';
  encoding: 'plaintext' | 'base64' | 'hex' | 'url-safe';
  
  // Security classification
  classification: 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';
  compliance: string[];
  dataRetention: number; // days
  
  // Operational metadata
  owner: string;
  team: string;
  costCenter?: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  
  // Rotation and maintenance
  rotationPolicy: RotationPolicy;
  lastRotated?: string;
  nextRotation?: string;
  rotationHistory: RotationEvent[];
  
  // Usage tracking
  usageCount: number;
  lastAccessed?: string;
  accessPatterns: AccessPattern[];
}

export interface VersionSelector {
  type: 'latest' | 'specific' | 'regex' | 'date' | 'label';
  value?: string;
  fallback?: string;
}

export interface AccessControl {
  // RBAC permissions
  roles: RolePermission[];
  
  // Network restrictions
  allowedNetworks?: string[];
  allowedNamespaces?: string[];
  allowedProjects?: string[];
  
  // Time-based restrictions
  accessWindows?: AccessWindow[];
  expirationDate?: string;
  
  // MFA requirements
  requireMFA: boolean;
  requireApproval: boolean;
  approvalWorkflow?: string;
}

export interface RolePermission {
  role: string;
  permissions: Permission[];
  conditions?: PermissionCondition[];
}

export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'list' 
  | 'rotate' 
  | 'export' 
  | 'audit';

export interface PermissionCondition {
  type: 'time' | 'network' | 'mfa' | 'approval' | 'custom';
  value: any;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
}

export interface LifecyclePolicy {
  // Creation and modification
  allowCreation: boolean;
  allowModification: boolean;
  allowDeletion: boolean;
  
  // Versioning
  maxVersions: number;
  versionRetention: number; // days
  
  // Archival and deletion
  archivalPolicy: ArchivalPolicy;
  deletionPolicy: DeletionPolicy;
  
  // Notifications
  notifications: NotificationRule[];
}

export interface ArchivalPolicy {
  enabled: boolean;
  trigger: 'age' | 'size' | 'manual' | 'schedule';
  ageThreshold?: number; // days
  sizeThreshold?: number; // bytes
  schedule?: string; // cron expression
  destination: 'cold-storage' | 'backup' | 'archive';
}

export interface DeletionPolicy {
  enabled: boolean;
  trigger: 'age' | 'manual' | 'schedule' | 'compliance';
  ageThreshold?: number; // days
  schedule?: string; // cron expression
  softDelete: boolean;
  retentionPeriod: number; // days
}

export interface NotificationRule {
  event: 'created' | 'modified' | 'deleted' | 'accessed' | 'rotated' | 'expired';
  channels: NotificationChannel[];
  recipients: string[];
  template?: string;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  config: Record<string, any>;
}

export interface RotationPolicy {
  enabled: boolean;
  type: 'automatic' | 'manual' | 'scheduled' | 'on-demand';
  interval?: number; // days
  schedule?: string; // cron expression
  method: 'in-place' | 'create-new' | 'gradual';
  notificationBefore: number; // days
  notificationAfter: number; // days
  approvers?: string[];
}

export interface RotationEvent {
  timestamp: string;
  version: string;
  method: 'automatic' | 'manual' | 'scheduled';
  initiatedBy: string;
  status: 'success' | 'failed' | 'in-progress';
  error?: string;
  metadata?: Record<string, any>;
}

export interface AccessPattern {
  timestamp: string;
  user: string;
  action: 'read' | 'write' | 'delete' | 'list';
  source: 'api' | 'ui' | 'cli' | 'webhook';
  userAgent?: string;
  ipAddress?: string;
  success: boolean;
  error?: string;
}

export interface AccessWindow {
  days: number[]; // 0-6, Sunday = 0
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
  exceptions?: string[]; // ISO date strings
}

// Request/Response interfaces
export interface CreateSecretReferenceRequest {
  name: string;
  description?: string;
  providerId: string;
  path: string;
  versionSelector?: VersionSelector;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  metadata: Partial<SecretMetadata>;
  accessControl?: Partial<AccessControl>;
  lifecycle?: Partial<LifecyclePolicy>;
  namespace: string;
  project?: string;
  tags?: string[];
}

export interface UpdateSecretReferenceRequest {
  name?: string;
  description?: string;
  versionSelector?: VersionSelector;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  metadata?: Partial<SecretMetadata>;
  accessControl?: Partial<AccessControl>;
  lifecycle?: Partial<LifecyclePolicy>;
  tags?: string[];
}

export interface SecretReferenceFilter {
  // Basic filters
  name?: string;
  providerId?: string;
  providerType?: 'vault' | 'aws' | 'azure';
  namespace?: string;
  project?: string;
  
  // Metadata filters
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  classification?: 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';
  environment?: 'development' | 'staging' | 'production' | 'testing';
  
  // Label and annotation filters
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  
  // Date filters
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  lastRotatedAfter?: string;
  lastRotatedBefore?: string;
  
  // Access filters
  owner?: string;
  team?: string;
  tags?: string[];
  
  // Pagination
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SecretReferenceSearchResult {
  references: SecretReference[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  providers: FacetCount[];
  categories: FacetCount[];
  classifications: FacetCount[];
  environments: FacetCount[];
  teams: FacetCount[];
  tags: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

// Export types for use in other modules
export type {
  SecretReference,
  SecretMetadata,
  VersionSelector,
  AccessControl,
  RolePermission,
  Permission,
  PermissionCondition,
  LifecyclePolicy,
  ArchivalPolicy,
  DeletionPolicy,
  NotificationRule,
  NotificationChannel,
  RotationPolicy,
  RotationEvent,
  AccessPattern,
  AccessWindow
};
