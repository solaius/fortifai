// RBAC Core Types for FortifAI Secrets Management
// This file defines the role-based access control system types

// ============================================================================
// CORE RBAC TYPES
// ============================================================================

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
  isDefault: boolean; // Default roles are assigned to new users
  metadata: RoleMetadata;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string; // e.g., 'secrets', 'providers', 'bindings'
  action: string; // e.g., 'read', 'write', 'delete', 'bind'
  scope: PermissionScope;
  conditions?: PermissionCondition[];
  metadata: PermissionMetadata;
}

export interface PermissionScope {
  type: 'global' | 'namespace' | 'project' | 'resource' | 'custom';
  namespace?: string;
  project?: string;
  resourceId?: string;
  customRules?: Record<string, any>;
}

export interface PermissionCondition {
  type: 'time' | 'ip' | 'user' | 'resource' | 'custom';
  operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'regex' | 'range' | 'custom';
  value: any;
  metadata?: Record<string, any>;
}

export interface RoleMetadata {
  category: string;
  priority: number;
  tags: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface PermissionMetadata {
  category: string;
  priority: number;
  tags: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

// ============================================================================
// POLICY TYPES
// ============================================================================

export interface Policy {
  id: string;
  name: string;
  displayName: string;
  description: string;
  effect: PolicyEffect;
  priority: number;
  status: PolicyStatus;
  
  // Policy rules
  rules: PolicyRule[];
  
  // Target specification
  targets: PolicyTarget;
  
  // Conditions and constraints
  conditions: PolicyCondition[];
  
  // Metadata and lifecycle
  metadata: PolicyMetadata;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export type PolicyEffect = 'allow' | 'deny';
export type PolicyStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface PolicyRule {
  id: string;
  type: 'role' | 'user' | 'group' | 'namespace' | 'project' | 'resource' | 'custom';
  value: string | string[];
  operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'regex' | 'range' | 'custom';
  metadata?: Record<string, any>;
}

export interface PolicyTarget {
  // What resources this policy applies to
  resources: string[]; // e.g., ['secrets', 'providers', 'bindings']
  actions: string[]; // e.g., ['read', 'write', 'delete', 'bind']
  
  // Resource-specific targeting
  providers?: string[];
  pathPrefixes?: string[];
  targetTypes?: string[]; // e.g., ['mcp-server', 'notebook', 'job']
  
  // Namespace and project scoping
  namespaces?: string[];
  projects?: string[];
  
  // Custom targeting rules
  customRules?: Record<string, any>;
}

export interface PolicyCondition {
  id: string;
  type: 'time' | 'ip' | 'user' | 'resource' | 'environment' | 'custom';
  operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'regex' | 'range' | 'before' | 'after' | 'custom';
  value: any;
  metadata?: Record<string, any>;
}

export interface PolicyMetadata {
  category: string;
  tags: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  compliance: ComplianceInfo;
  risk: RiskAssessment;
}

export interface ComplianceInfo {
  standards: string[]; // e.g., ['SOC2', 'ISO27001', 'GDPR']
  requirements: string[];
  controls: string[];
  evidence: string[];
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  mitigation: string[];
  reviewDate: string;
}

// ============================================================================
// POLICY EVALUATION TYPES
// ============================================================================

export interface PolicyEvaluationRequest {
  user: UserContext;
  action: string;
  resource: ResourceContext;
  environment: EnvironmentContext;
  requestId: string;
  timestamp: string;
}

export interface UserContext {
  id: string;
  username: string;
  roles: string[];
  groups: string[];
  namespace: string;
  project?: string;
  attributes: Record<string, any>;
}

export interface ResourceContext {
  type: string;
  id?: string;
  name?: string;
  provider?: string;
  path?: string;
  namespace?: string;
  project?: string;
  attributes: Record<string, any>;
}

export interface EnvironmentContext {
  namespace: string;
  project?: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  timestamp: string;
  attributes: Record<string, any>;
}

export interface PolicyEvaluationResult {
  requestId: string;
  decision: PolicyDecision;
  reason: string;
  appliedPolicies: AppliedPolicy[];
  metadata: EvaluationMetadata;
  timestamp: string;
}

export type PolicyDecision = 'allow' | 'deny' | 'not-applicable' | 'error';

export interface AppliedPolicy {
  policyId: string;
  policyName: string;
  effect: PolicyEffect;
  priority: number;
  matchedRules: string[];
  reason: string;
}

export interface EvaluationMetadata {
  evaluationTime: number; // milliseconds
  policiesEvaluated: number;
  rulesEvaluated: number;
  cacheHit: boolean;
  version: string;
}

// ============================================================================
// POLICY VERSIONING TYPES
// ============================================================================

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  content: Policy;
  changeSummary: string;
  changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  createdBy: string;
  createdAt: string;
  metadata: VersionMetadata;
}

export interface VersionMetadata {
  reason: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  reviewRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string[];
}

// ============================================================================
// POLICY SIMULATION TYPES
// ============================================================================

export interface PolicySimulationRequest {
  name: string;
  description?: string;
  policies: Policy[];
  testCases: PolicyTestCase[];
  metadata?: Record<string, any>;
}

export interface PolicyTestCase {
  id: string;
  name: string;
  description?: string;
  user: UserContext;
  action: string;
  resource: ResourceContext;
  environment: EnvironmentContext;
  expectedDecision: PolicyDecision;
  expectedReason?: string;
}

export interface PolicySimulationResult {
  simulationId: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  results: PolicyTestCaseResult[];
  summary: SimulationSummary;
  metadata: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface PolicyTestCaseResult {
  testCaseId: string;
  testCaseName: string;
  expectedDecision: PolicyDecision;
  actualDecision: PolicyDecision;
  passed: boolean;
  reason: string;
  appliedPolicies: AppliedPolicy[];
  executionTime: number;
}

export interface SimulationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  policyCoverage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// REQUEST/RESPONSE INTERFACES
// ============================================================================

export interface CreatePolicyRequest {
  name: string;
  displayName: string;
  description: string;
  effect: PolicyEffect;
  priority: number;
  rules: Omit<PolicyRule, 'id'>[];
  targets: PolicyTarget;
  conditions?: Omit<PolicyCondition, 'id'>[];
  metadata?: Partial<PolicyMetadata>;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface UpdatePolicyRequest {
  name?: string;
  displayName?: string;
  description?: string;
  effect?: PolicyEffect;
  priority?: number;
  rules?: Omit<PolicyRule, 'id'>[];
  targets?: Partial<PolicyTarget>;
  conditions?: Omit<PolicyCondition, 'id'>[];
  metadata?: Partial<PolicyMetadata>;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description: string;
  permissions: string[]; // Permission IDs
  metadata?: Partial<RoleMetadata>;
}

export interface UpdateRoleRequest {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  metadata?: Partial<RoleMetadata>;
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface PolicyFilter {
  name?: string;
  effect?: PolicyEffect;
  status?: PolicyStatus;
  priority?: number;
  resources?: string[];
  actions?: string[];
  providers?: string[];
  namespaces?: string[];
  projects?: string[];
  tags?: string[];
  createdBy?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleFilter {
  name?: string;
  isSystem?: boolean;
  isDefault?: boolean;
  category?: string;
  tags?: string[];
  createdBy?: string;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Role,
  Permission,
  PermissionScope,
  PermissionCondition,
  RoleMetadata,
  PermissionMetadata,
  Policy,
  PolicyRule,
  PolicyTarget,
  PolicyCondition,
  PolicyMetadata,
  ComplianceInfo,
  RiskAssessment,
  PolicyEvaluationRequest,
  UserContext,
  ResourceContext,
  EnvironmentContext,
  PolicyEvaluationResult,
  PolicyDecision,
  AppliedPolicy,
  EvaluationMetadata,
  PolicyVersion,
  VersionMetadata,
  PolicySimulationRequest,
  PolicyTestCase,
  PolicySimulationResult,
  PolicyTestCaseResult,
  SimulationSummary
};
