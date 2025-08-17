# RBAC (Role-Based Access Control) API Documentation

This document provides comprehensive documentation for the FortifAI RBAC system, including role management, permission handling, policy evaluation, and versioning capabilities.

## 🎯 Overview

The FortifAI RBAC system provides comprehensive role-based access control for secrets management, including:

- **Role Management**: Create, update, and manage user roles with associated permissions
- **Permission System**: Granular permissions for resources, actions, and scopes
- **Policy Engine**: Deterministic policy evaluation with conflict resolution
- **Policy Versioning**: Complete audit trail and version management for policies
- **Policy Simulation**: Test policies before deployment with comprehensive simulation tools

## 🏗️ RBAC Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        RBAC Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  RBACService  │  PolicyEngineService  │  PolicyVersioningService │
├─────────────────────────────────────────────────────────────────┤
│                    Policy Evaluation                            │
├─────────────────────────────────────────────────────────────────┤
│  Policy Rules  │  Policy Targets  │  Policy Conditions        │
├─────────────────────────────────────────────────────────────────┤
│                    Access Control                              │
├─────────────────────────────────────────────────────────────────┤
│  Role Checks  │  Permission Validation  │  Policy Enforcement   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Services

- **`RBACService`**: Manages roles, permissions, and policies
- **`PolicyEngineService`**: Evaluates policies and makes access decisions
- **`PolicyVersioningService`**: Handles policy versioning and audit trails

## 🔐 Role Management API

### RBACService Class

The `RBACService` provides comprehensive role and permission management capabilities.

#### Service Interface

```typescript
class RBACService {
  // Role Management
  async getRoles(filter?: RoleFilter): Promise<Role[]>
  async getRole(roleId: string): Promise<Role | null>
  async createRole(request: CreateRoleRequest): Promise<Role>
  async updateRole(roleId: string, request: UpdateRoleRequest): Promise<Role>
  async deleteRole(roleId: string): Promise<boolean>
  
  // Permission Management
  async getPermissions(): Promise<Permission[]>
  async getPermission(permissionId: string): Promise<Permission | null>
  
  // Policy Management
  async getPolicies(filter?: PolicyFilter): Promise<Policy[]>
  async getPolicy(policyId: string): Promise<Policy | null>
  
  // Utility Methods
  hasRole(userRoles: string[], roleName: string): boolean
  hasAnyRole(userRoles: string[], roleNames: string[]): boolean
  hasAllRoles(userRoles: string[], roleNames: string[]): boolean
  getRolesByCategory(roles: Role[], category: string): Role[]
  getSystemRoles(roles: Role[]): Role[]
  getDefaultRoles(roles: Role[]): Role[]
}
```

#### Data Types

##### Role

```typescript
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isDefault: boolean;
  metadata: RoleMetadata;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface RoleMetadata {
  category: string;
  priority: number;
  tags: string[];
  labels: Record<string, string>;
  annotations: Record<string, any>;
}
```

##### Permission

```typescript
interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  metadata: PermissionMetadata;
}

interface PermissionScope {
  type: 'global' | 'namespace' | 'project' | 'resource';
  namespace?: string;
  project?: string;
  resourceId?: string;
  conditions?: PermissionCondition[];
}
```

##### Policy

```typescript
interface Policy {
  id: string;
  name: string;
  displayName: string;
  description: string;
  effect: PolicyEffect;
  priority: number;
  status: PolicyStatus;
  rules: PolicyRule[];
  targets: PolicyTarget;
  conditions: PolicyCondition[];
  metadata: PolicyMetadata;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

type PolicyEffect = 'allow' | 'deny';
type PolicyStatus = 'active' | 'inactive' | 'draft' | 'deprecated';
```

#### Request/Response Types

##### CreateRoleRequest

```typescript
interface CreateRoleRequest {
  name: string;
  displayName: string;
  description: string;
  permissions: string[]; // Permission IDs
  metadata?: Partial<RoleMetadata>;
}
```

##### UpdateRoleRequest

```typescript
interface UpdateRoleRequest {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  metadata?: Partial<RoleMetadata>;
}
```

##### RoleFilter

```typescript
interface RoleFilter {
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
```

#### Usage Examples

##### Creating a New Role

```typescript
import { rbacService } from '../services/rbac';

const newRole = await rbacService.createRole({
  name: 'ml-engineer',
  displayName: 'ML Engineer',
  description: 'Specialized role for machine learning workloads',
  permissions: ['perm-secrets-read', 'perm-bindings-read'],
  metadata: {
    category: 'specialized',
    priority: 600,
    tags: ['ml', 'ai', 'engineer'],
    labels: { tier: 'specialist' }
  }
});
```

##### Filtering Roles

```typescript
// Get all system roles
const systemRoles = await rbacService.getRoles({ isSystem: true });

// Get roles by category
const adminRoles = await rbacService.getRoles({ category: 'administrative' });

// Get roles with pagination
const roles = await rbacService.getRoles({ 
  page: 1, 
  perPage: 10, 
  sortBy: 'name', 
  sortOrder: 'asc' 
});
```

##### Checking User Roles

```typescript
const userRoles = ['org-admin', 'project-admin'];

// Check if user has specific role
if (rbacService.hasRole(userRoles, 'org-admin')) {
  // User has org-admin role
}

// Check if user has any of multiple roles
if (rbacService.hasAnyRole(userRoles, ['org-admin', 'project-admin'])) {
  // User has at least one of the specified roles
}

// Check if user has all required roles
if (rbacService.hasAllRoles(userRoles, ['org-admin', 'project-admin'])) {
  // User has all required roles
}
```

## 🚦 Policy Engine API

### PolicyEngineService Class

The `PolicyEngineService` provides deterministic policy evaluation with conflict resolution and caching.

#### Service Interface

```typescript
class PolicyEngineService {
  // Policy Evaluation
  async evaluatePolicy(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult>
  
  // Policy Simulation
  async runPolicySimulation(simulationRequest: PolicySimulationRequest): Promise<PolicySimulationResult>
  
  // Cache Management
  clearCache(): void
  getCacheStats(): CacheStats
}
```

#### Data Types

##### PolicyEvaluationRequest

```typescript
interface PolicyEvaluationRequest {
  requestId: string;
  timestamp: string;
  user: UserContext;
  action: string;
  resource: ResourceContext;
  environment: EnvironmentContext;
}

interface UserContext {
  id: string;
  username: string;
  roles: string[];
  groups: string[];
  namespace: string;
  project?: string;
  attributes: Record<string, any>;
}

interface ResourceContext {
  type: string;
  id?: string;
  name?: string;
  provider?: string;
  path?: string;
  namespace?: string;
  project?: string;
  attributes: Record<string, any>;
}

interface EnvironmentContext {
  namespace: string;
  project?: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  timestamp: string;
  attributes: Record<string, any>;
}
```

##### PolicyEvaluationResult

```typescript
interface PolicyEvaluationResult {
  requestId: string;
  decision: PolicyDecision;
  reason: string;
  appliedPolicies: AppliedPolicy[];
  metadata: EvaluationMetadata;
  timestamp: string;
}

type PolicyDecision = 'allow' | 'deny' | 'not-applicable' | 'error';

interface AppliedPolicy {
  policyId: string;
  policyName: string;
  effect: PolicyEffect;
  priority: number;
  matchedRules: string[];
  reason: string;
}

interface EvaluationMetadata {
  evaluationTime: number; // milliseconds
  policiesEvaluated: number;
  rulesEvaluated: number;
  cacheHit: boolean;
  version: string;
}
```

##### PolicySimulationRequest

```typescript
interface PolicySimulationRequest {
  name: string;
  description?: string;
  policies: Policy[];
  testCases: PolicyTestCase[];
  metadata?: Record<string, any>;
}

interface PolicyTestCase {
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
```

#### Usage Examples

##### Evaluating Access Policy

```typescript
import { policyEngineService } from '../services/policyEngine';

const request: PolicyEvaluationRequest = {
  requestId: 'req-123',
  timestamp: new Date().toISOString(),
  user: {
    id: 'user-123',
    username: 'developer',
    roles: ['developer', 'secret-viewer'],
    groups: ['dev-team'],
    namespace: 'development',
    attributes: { team: 'backend' }
  },
  action: 'read',
  resource: {
    type: 'secrets',
    id: 'secret-456',
    name: 'database-credentials',
    path: 'kv/data/dev/db-creds',
    namespace: 'development',
    attributes: { environment: 'dev' }
  },
  environment: {
    namespace: 'development',
    environment: 'development',
    timestamp: new Date().toISOString(),
    attributes: { cluster: 'dev-cluster' }
  }
};

const result = await policyEngineService.evaluatePolicy(request);

if (result.decision === 'allow') {
  console.log('Access granted:', result.reason);
  console.log('Applied policies:', result.appliedPolicies);
} else {
  console.log('Access denied:', result.reason);
}
```

##### Running Policy Simulation

```typescript
const simulationRequest: PolicySimulationRequest = {
  name: 'Production Access Test',
  description: 'Test production access policies',
  policies: [productionPolicy, securityPolicy],
  testCases: [
    {
      id: 'test-1',
      name: 'Admin Production Access',
      description: 'Test admin user accessing production secrets',
      user: {
        id: 'admin-1',
        username: 'admin',
        roles: ['org-admin'],
        groups: ['admin-team'],
        namespace: 'default',
        attributes: {}
      },
      action: 'read',
      resource: {
        type: 'secrets',
        id: 'prod-secret',
        name: 'production-db-creds',
        path: 'kv/data/prod/db-creds',
        namespace: 'production',
        attributes: {}
      },
      environment: {
        namespace: 'production',
        environment: 'production',
        timestamp: new Date().toISOString(),
        attributes: {}
      },
      expectedDecision: 'allow'
    }
  ]
};

const simulation = await policyEngineService.runPolicySimulation(simulationRequest);

console.log('Simulation completed:', simulation.status);
console.log('Results:', simulation.results);
console.log('Summary:', simulation.summary);
```

## 📚 Policy Versioning API

### PolicyVersioningService Class

The `PolicyVersioningService` provides comprehensive policy versioning, change tracking, and audit trail capabilities.

#### Service Interface

```typescript
class PolicyVersioningService {
  // Version Management
  async createPolicyVersion(
    policyId: string,
    policy: Policy,
    changeSummary: string,
    changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated',
    metadata?: Partial<VersionMetadata>
  ): Promise<PolicyVersion>
  
  async getPolicyVersionHistory(policyId: string): Promise<PolicyVersion[]>
  async getPolicyVersion(policyId: string, versionNumber: number): Promise<PolicyVersion | null>
  async getLatestPolicyVersion(policyId: string): Promise<PolicyVersion | null>
  
  // Version Comparison
  async comparePolicyVersions(
    policyId: string,
    version1: number,
    version2: number
  ): Promise<PolicyVersionComparison>
  
  // Version Restoration
  async restorePolicyVersion(
    policyId: string,
    versionNumber: number,
    reason: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<Policy>
  
  // Audit Trail
  async getPolicyAuditTrail(
    policyId: string,
    startDate?: string,
    endDate?: string,
    changeTypes?: string[]
  ): Promise<PolicyVersion[]>
  
  // Lifecycle Management
  async createPolicyWithVersioning(
    policyData: CreatePolicyRequest,
    changeSummary: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<{ policy: Policy; version: PolicyVersion }>
  
  async updatePolicyWithVersioning(
    policyId: string,
    policyData: UpdatePolicyRequest,
    changeSummary: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<{ policy: Policy; version: PolicyVersion }>
  
  async deletePolicyWithVersioning(
    policyId: string,
    reason: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<PolicyVersion>
}
```

#### Data Types

##### PolicyVersion

```typescript
interface PolicyVersion {
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

interface VersionMetadata {
  reason: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  reviewRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string[];
}
```

##### PolicyVersionComparison

```typescript
interface PolicyVersionComparison {
  policyId: string;
  version1: number;
  version2: number;
  changes: PolicyChange[];
  summary: string;
  timestamp: string;
}

interface PolicyChange {
  field: string;
  oldValue: string;
  newValue: string;
  type: 'added' | 'removed' | 'modified';
}
```

#### Usage Examples

##### Creating Policy with Versioning

```typescript
import { policyVersioningService } from '../services/policyVersioning';

const policyData: CreatePolicyRequest = {
  name: 'finance-access',
  displayName: 'Finance Team Access',
  description: 'Allow finance team to access financial secrets',
  effect: 'allow',
  priority: 100,
  rules: [
    {
      type: 'role',
      value: ['finance-admin', 'finance-user'],
      operator: 'in'
    },
    {
      type: 'namespace',
      value: 'finance',
      operator: 'equals'
    }
  ],
  targets: {
    resources: ['secrets'],
    actions: ['read', 'bind'],
    pathPrefixes: ['kv/data/finance/']
  }
};

const { policy, version } = await policyVersioningService.createPolicyWithVersioning(
  policyData,
  'Initial creation of finance access policy'
);

console.log('Policy created:', policy.id);
console.log('Version created:', version.version);
```

##### Updating Policy with Versioning

```typescript
const updateData: UpdatePolicyRequest = {
  description: 'Updated description for finance policy',
  priority: 110
};

const { policy: updatedPolicy, version: newVersion } = await policyVersioningService.updatePolicyWithVersioning(
  policyId,
  updateData,
  'Updated description and priority'
);

console.log('Policy updated to version:', updatedPolicy.version);
console.log('New version record:', newVersion.version);
```

##### Comparing Policy Versions

```typescript
const comparison = await policyVersioningService.comparePolicyVersions(
  policyId,
  1,
  2
);

console.log('Changes between versions:', comparison.changes);
comparison.changes.forEach(change => {
  console.log(`${change.field}: ${change.oldValue} → ${change.newValue}`);
});
```

##### Restoring Previous Version

```typescript
const restoredPolicy = await policyVersioningService.restorePolicyVersion(
  policyId,
  1,
  'Rollback due to security issue'
);

console.log('Policy restored to version:', restoredPolicy.version);
console.log('Restoration reason:', 'Rollback due to security issue');
```

##### Getting Audit Trail

```typescript
const auditTrail = await policyVersioningService.getPolicyAuditTrail(
  policyId,
  '2024-01-01',
  '2024-12-31',
  ['created', 'updated', 'deleted']
);

console.log('Policy change history:');
auditTrail.forEach(version => {
  console.log(`Version ${version.version}: ${version.changeType} - ${version.changeSummary}`);
  console.log(`  Changed by: ${version.createdBy}`);
  console.log(`  Changed at: ${version.createdAt}`);
});
```

## 🔧 Policy Rules and Conditions

### Policy Rules

Policy rules define the conditions under which a policy applies.

#### Rule Types

```typescript
interface PolicyRule {
  id: string;
  type: 'user' | 'role' | 'group' | 'namespace' | 'project' | 'resource' | 'time' | 'custom';
  value: string | string[] | number | boolean;
  operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'contains' | 'starts-with' | 'ends-with' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte';
  metadata?: Record<string, any>;
}
```

#### Rule Examples

```typescript
// Role-based rule
{
  id: 'rule-1',
  type: 'role',
  value: ['admin', 'manager'],
  operator: 'in'
}

// Namespace-based rule
{
  id: 'rule-2',
  type: 'namespace',
  value: 'production',
  operator: 'equals'
}

// Time-based rule
{
  id: 'rule-3',
  type: 'time',
  value: '09:00-17:00',
  operator: 'in'
}

// Custom rule
{
  id: 'rule-4',
  type: 'custom',
  value: 'business-hours',
  operator: 'equals',
  metadata: {
    customFunction: 'isBusinessHours',
    timezone: 'UTC'
  }
}
```

### Policy Targets

Policy targets define what resources and actions the policy applies to.

```typescript
interface PolicyTarget {
  resources: string[];
  actions: string[];
  pathPrefixes?: string[];
  targetTypes?: string[];
  providers?: string[];
  namespaces?: string[];
  projects?: string[];
}
```

#### Target Examples

```typescript
// Target all secrets with read access
{
  resources: ['secrets'],
  actions: ['read'],
  targetTypes: ['mcp-server', 'notebook']
}

// Target specific path patterns
{
  resources: ['secrets'],
  actions: ['read', 'bind'],
  pathPrefixes: ['kv/data/finance/', 'kv/data/hr/'],
  targetTypes: ['mcp-server']
}

// Target specific providers
{
  resources: ['secrets'],
  actions: ['manage'],
  providers: ['aws', 'azure'],
  targetTypes: ['mcp-server']
}
```

### Policy Conditions

Policy conditions provide additional constraints for policy evaluation.

```typescript
interface PolicyCondition {
  id: string;
  type: 'time' | 'location' | 'device' | 'network' | 'risk' | 'custom';
  value: string | number | boolean | Record<string, any>;
  operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  metadata?: Record<string, any>;
}
```

#### Condition Examples

```typescript
// Time-based condition
{
  id: 'condition-1',
  type: 'time',
  value: {
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'UTC',
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  operator: 'in'
}

// Risk-based condition
{
  id: 'condition-2',
  type: 'risk',
  value: {
    maxRiskLevel: 'medium',
    requireMFA: true
  },
  operator: 'lte'
}

// Custom condition
{
  id: 'condition-3',
  type: 'custom',
  value: 'high-value-secret',
  operator: 'equals',
  metadata: {
    customFunction: 'isHighValueSecret',
    requireApproval: true
  }
}
```

## 🎯 Policy Evaluation Logic

### Evaluation Process

The policy engine follows a deterministic evaluation process:

1. **Policy Collection**: Gather all applicable policies based on targets
2. **Policy Sorting**: Sort policies by priority (higher priority first)
3. **Rule Evaluation**: Evaluate each policy's rules against the request context
4. **Condition Checking**: Apply additional conditions if rules match
5. **Decision Making**: Apply policy effects (allow/deny) with conflict resolution
6. **Result Caching**: Cache results for performance optimization

### Conflict Resolution

When multiple policies apply to the same request:

- **Deny Override**: Deny policies take precedence over allow policies
- **Priority Order**: Higher priority policies override lower priority ones
- **Explicit Override**: Explicit deny policies override implicit allow policies

### Caching Strategy

The policy engine implements intelligent caching:

- **Request-based Caching**: Cache results based on request parameters
- **TTL-based Expiration**: Cache entries expire after 5 minutes
- **LRU Eviction**: Least recently used entries are evicted when cache is full
- **Cache Invalidation**: Cache is cleared when policies are updated

## 🧪 Testing and Validation

### Policy Testing

The RBAC system provides comprehensive testing capabilities:

```typescript
// Test individual policy evaluation
const testRequest: PolicyEvaluationRequest = { /* ... */ };
const result = await policyEngineService.evaluatePolicy(testRequest);

// Run comprehensive policy simulation
const simulation = await policyEngineService.runPolicySimulation({
  name: 'Security Policy Test',
  policies: [securityPolicy],
  testCases: [/* ... */]
});
```

### Test Case Design

Effective test cases should cover:

- **Happy Path**: Normal access scenarios
- **Edge Cases**: Boundary conditions and edge cases
- **Security Scenarios**: Privilege escalation attempts
- **Conflict Resolution**: Multiple policy conflicts
- **Performance**: High-load scenarios

## 🔒 Security Considerations

### Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Regular Review**: Periodically review and update policies
3. **Audit Logging**: Maintain comprehensive audit trails
4. **Testing**: Test policies before deployment
5. **Version Control**: Use policy versioning for change management

### Security Features

- **Immutable Audit Logs**: All policy changes are permanently recorded
- **Policy Validation**: Policies are validated before activation
- **Conflict Detection**: Automatic detection of policy conflicts
- **Risk Assessment**: Built-in risk assessment for policy changes

## 📊 Monitoring and Metrics

### Key Metrics

- **Policy Evaluation Time**: Average time for policy evaluation
- **Cache Hit Rate**: Percentage of cache hits vs. misses
- **Policy Coverage**: Percentage of resources covered by policies
- **Access Decisions**: Distribution of allow/deny decisions
- **Policy Conflicts**: Number of policy conflicts detected

### Monitoring Integration

The RBAC system integrates with:

- **Prometheus**: Metrics collection and alerting
- **OpenTelemetry**: Distributed tracing and observability
- **Audit Logs**: Comprehensive audit trail for compliance
- **Webhooks**: Real-time notifications for policy changes

## 🚀 Performance Optimization

### Optimization Strategies

1. **Intelligent Caching**: Cache frequently accessed policy decisions
2. **Policy Indexing**: Index policies by resource type and action
3. **Parallel Evaluation**: Evaluate multiple policies concurrently
4. **Lazy Loading**: Load policy details on-demand
5. **Batch Processing**: Process multiple requests in batches

### Performance Benchmarks

- **Single Policy Evaluation**: < 1ms
- **Complex Policy Evaluation**: < 5ms
- **Policy Simulation (100 test cases)**: < 100ms
- **Cache Hit Response**: < 0.1ms

## 🔄 Migration and Upgrades

### Version Compatibility

The RBAC system maintains backward compatibility:

- **Policy Format**: Policies remain compatible across versions
- **API Interfaces**: Core APIs remain stable
- **Data Migration**: Automatic migration of existing policies
- **Rollback Support**: Easy rollback to previous versions

### Upgrade Process

1. **Backup**: Backup existing policies and configurations
2. **Testing**: Test new version in staging environment
3. **Migration**: Run migration scripts
4. **Validation**: Validate migrated policies
5. **Rollback**: Rollback plan if issues arise

## 📚 Additional Resources

### Related Documentation

- [API Overview](../README.md)
- [Architecture Guide](../../architecture/README.md)
- [Testing Guide](../../testing/README.md)
- [Security Guide](../../security/README.md)

### Examples and Tutorials

- [RBAC Quick Start Guide](../../getting-started/rbac-quickstart.md)
- [Policy Design Patterns](../../patterns/policy-patterns.md)
- [RBAC Best Practices](../../best-practices/rbac-practices.md)

### Support and Community

- [GitHub Issues](https://github.com/fortifai/fortifai/issues)
- [Discord Community](https://discord.gg/fortifai)
- [Documentation Wiki](https://docs.fortifai.com)
