# RBAC Quick Start Guide

This guide provides a quick introduction to using the FortifAI RBAC system for access control in secrets management.

## 🚀 Getting Started

### Installation and Setup

The RBAC system is already included in the FortifAI project. No additional installation is required.

### Basic Imports

```typescript
import { rbacService } from '../services/rbac';
import { policyEngineService } from '../services/policyEngine';
import { policyVersioningService } from '../services/policyVersioning';
```

## 🔐 Basic Role Management

### Creating Your First Role

```typescript
// Create a developer role with basic permissions
const developerRole = await rbacService.createRole({
  name: 'developer',
  displayName: 'Developer',
  description: 'Standard developer role with read access to development secrets',
  permissions: ['perm-secrets-read', 'perm-bindings-read'],
  metadata: {
    category: 'operational',
    priority: 400,
    tags: ['development', 'engineer'],
    labels: { tier: 'standard' }
  }
});

console.log('Created role:', developerRole.name);
```

### Assigning Roles to Users

```typescript
// Check if a user has specific roles
const userRoles = ['developer', 'project-admin'];

if (rbacService.hasRole(userRoles, 'developer')) {
  console.log('User has developer role');
}

if (rbacService.hasAnyRole(userRoles, ['developer', 'admin'])) {
  console.log('User has at least one of the specified roles');
}

if (rbacService.hasAllRoles(userRoles, ['developer', 'project-admin'])) {
  console.log('User has all required roles');
}
```

### Managing Permissions

```typescript
// Get all available permissions
const permissions = await rbacService.getPermissions();

// Find specific permissions
const readPermissions = permissions.filter(p => p.action === 'read');
const secretPermissions = permissions.filter(p => p.resource === 'secrets');

console.log('Read permissions:', readPermissions.length);
console.log('Secret permissions:', secretPermissions.length);
```

## 🚦 Policy Management

### Creating Your First Policy

```typescript
// Create a policy that allows developers to read development secrets
const devPolicy = await policyVersioningService.createPolicyWithVersioning({
  name: 'developer-dev-access',
  displayName: 'Developer Development Access',
  description: 'Allow developers to read development secrets',
  effect: 'allow',
  priority: 100,
  rules: [
    {
      type: 'role',
      value: ['developer'],
      operator: 'in'
    },
    {
      type: 'namespace',
      value: 'development',
      operator: 'equals'
    }
  ],
  targets: {
    resources: ['secrets'],
    actions: ['read'],
    pathPrefixes: ['kv/data/dev/'],
    targetTypes: ['mcp-server', 'notebook']
  }
}, 'Initial creation of developer access policy');

console.log('Policy created:', devPolicy.policy.id);
console.log('Version created:', devPolicy.version.version);
```

### Evaluating Access Policies

```typescript
// Create an access request
const accessRequest = {
  requestId: 'req-123',
  timestamp: new Date().toISOString(),
  user: {
    id: 'user-123',
    username: 'john.doe',
    roles: ['developer'],
    groups: ['backend-team'],
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

// Evaluate the access request
const result = await policyEngineService.evaluatePolicy(accessRequest);

if (result.decision === 'allow') {
  console.log('Access granted:', result.reason);
  console.log('Applied policies:', result.appliedPolicies.length);
} else {
  console.log('Access denied:', result.reason);
}
```

## 🧪 Policy Testing

### Running Policy Simulations

```typescript
// Create test cases for your policy
const testCases = [
  {
    id: 'test-1',
    name: 'Developer Access Test',
    description: 'Test developer accessing development secrets',
    user: {
      id: 'test-user-1',
      username: 'test-developer',
      roles: ['developer'],
      groups: ['test-team'],
      namespace: 'development',
      attributes: {}
    },
    action: 'read',
    resource: {
      type: 'secrets',
      id: 'test-secret',
      name: 'test-db-creds',
      path: 'kv/data/dev/test-creds',
      namespace: 'development',
      attributes: {}
    },
    environment: {
      namespace: 'development',
      environment: 'development',
      timestamp: new Date().toISOString(),
      attributes: {}
    },
    expectedDecision: 'allow'
  },
  {
    id: 'test-2',
    name: 'Developer Production Deny Test',
    description: 'Test developer being denied access to production secrets',
    user: {
      id: 'test-user-2',
      username: 'test-developer',
      roles: ['developer'],
      groups: ['test-team'],
      namespace: 'development',
      attributes: {}
    },
    action: 'read',
    resource: {
      type: 'secrets',
      id: 'prod-secret',
      name: 'prod-db-creds',
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
    expectedDecision: 'deny'
  }
];

// Run the simulation
const simulation = await policyEngineService.runPolicySimulation({
  name: 'Developer Access Policy Test',
  description: 'Test developer access policies',
  policies: [devPolicy.policy],
  testCases
});

console.log('Simulation completed:', simulation.status);
console.log('Test results:', simulation.results);
console.log('Summary:', simulation.summary);
```

## 📚 Policy Versioning

### Tracking Policy Changes

```typescript
// Get policy version history
const versions = await policyVersioningService.getPolicyVersionHistory(devPolicy.policy.id);

console.log('Policy versions:', versions.length);
versions.forEach(version => {
  console.log(`Version ${version.version}: ${version.changeType} - ${version.changeSummary}`);
});

// Compare versions
if (versions.length > 1) {
  const comparison = await policyVersioningService.comparePolicyVersions(
    devPolicy.policy.id,
    1,
    2
  );
  
  console.log('Changes between versions:', comparison.changes);
}
```

### Updating Policies

```typescript
// Update the policy to add more restrictive rules
const updatedPolicy = await policyVersioningService.updatePolicyWithVersioning(
  devPolicy.policy.id,
  {
    description: 'Updated developer access policy with additional restrictions',
    priority: 150,
    rules: [
      {
        type: 'role',
        value: ['developer'],
        operator: 'in'
      },
      {
        type: 'namespace',
        value: 'development',
        operator: 'equals'
      },
      {
        type: 'time',
        value: '09:00-17:00',
        operator: 'in'
      }
    ]
  },
  'Added time-based restrictions for developer access'
);

console.log('Policy updated to version:', updatedPolicy.policy.version);
```

## 🔒 Security Best Practices

### Role Design Principles

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Role Hierarchy**: Use hierarchical roles for complex organizations
3. **Temporary Access**: Implement time-limited roles for contractors
4. **Regular Review**: Periodically review and update role assignments

### Policy Design Patterns

1. **Default Deny**: Start with deny-all and explicitly allow access
2. **Environment Isolation**: Separate policies for dev/staging/production
3. **Resource Grouping**: Group related resources under common policies
4. **Audit Requirements**: Include audit logging in all policies

### Example: Production Access Policy

```typescript
// Create a production access policy with strict controls
const prodPolicy = await policyVersioningService.createPolicyWithVersioning({
  name: 'production-access',
  displayName: 'Production Access Control',
  description: 'Strict production access with MFA and approval requirements',
  effect: 'allow',
  priority: 200,
  rules: [
    {
      type: 'role',
      value: ['prod-admin', 'prod-engineer'],
      operator: 'in'
    },
    {
      type: 'namespace',
      value: 'production',
      operator: 'equals'
    }
  ],
  targets: {
    resources: ['secrets'],
    actions: ['read', 'bind'],
    pathPrefixes: ['kv/data/prod/'],
    targetTypes: ['mcp-server', 'notebook']
  },
  conditions: [
    {
      type: 'time',
      value: {
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      operator: 'in'
    },
    {
      type: 'risk',
      value: {
        maxRiskLevel: 'medium',
        requireMFA: true
      },
      operator: 'lte'
    }
  ]
}, 'Initial creation of production access policy');
```

## 📊 Monitoring and Metrics

### Access Decision Monitoring

```typescript
// Monitor policy evaluation performance
const cacheStats = policyEngineService.getCacheStats();
console.log('Cache hit rate:', cacheStats.hitRate);
console.log('Cache size:', cacheStats.size);

// Clear cache if needed
policyEngineService.clearCache();
```

### Policy Coverage Analysis

```typescript
// Analyze policy coverage
const policies = await rbacService.getPolicies();
const activePolicies = policies.filter(p => p.status === 'active');

console.log('Total policies:', policies.length);
console.log('Active policies:', activePolicies.length);

// Check policy distribution by effect
const allowPolicies = activePolicies.filter(p => p.effect === 'allow');
const denyPolicies = activePolicies.filter(p => p.effect === 'deny');

console.log('Allow policies:', allowPolicies.length);
console.log('Deny policies:', denyPolicies.length);
```

## 🔄 Common Use Cases

### Multi-Tenant Access Control

```typescript
// Create tenant-specific roles
const tenantRoles = ['tenant-admin', 'tenant-user', 'tenant-viewer'];

// Create tenant isolation policy
const tenantPolicy = await policyVersioningService.createPolicyWithVersioning({
  name: 'tenant-isolation',
  displayName: 'Tenant Data Isolation',
  description: 'Ensure tenants can only access their own data',
  effect: 'allow',
  priority: 300,
  rules: [
    {
      type: 'role',
      value: tenantRoles,
      operator: 'in'
    }
  ],
  targets: {
    resources: ['secrets', 'bindings'],
    actions: ['read', 'write', 'delete'],
    pathPrefixes: ['kv/data/tenant-${user.tenant}/'],
    targetTypes: ['mcp-server', 'notebook', 'agent']
  }
}, 'Tenant isolation policy creation');
```

### Time-Based Access Control

```typescript
// Create business hours policy
const businessHoursPolicy = await policyVersioningService.createPolicyWithVersioning({
  name: 'business-hours-access',
  displayName: 'Business Hours Access',
  description: 'Restrict access to business hours only',
  effect: 'allow',
  priority: 400,
  rules: [
    {
      type: 'role',
      value: ['developer', 'analyst'],
      operator: 'in'
    }
  ],
  targets: {
    resources: ['secrets'],
    actions: ['read', 'bind'],
    pathPrefixes: ['kv/data/dev/', 'kv/data/staging/']
  },
  conditions: [
    {
      type: 'time',
      value: {
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      operator: 'in'
    }
  ]
}, 'Business hours access policy creation');
```

## 🚨 Troubleshooting

### Common Issues

1. **Policy Conflicts**: Check policy priorities and effects
2. **Cache Issues**: Clear policy engine cache if results seem incorrect
3. **Version Mismatches**: Ensure you're working with the latest policy versions
4. **Permission Denials**: Verify role assignments and policy rules

### Debug Mode

```typescript
// Enable detailed logging for policy evaluation
const debugRequest = {
  ...accessRequest,
  metadata: {
    ...accessRequest.metadata,
    debug: true,
    logLevel: 'verbose'
  }
};

const debugResult = await policyEngineService.evaluatePolicy(debugRequest);
console.log('Debug info:', debugResult.metadata);
```

## 📚 Next Steps

### Advanced Topics

- [RBAC API Reference](../api/rbac.md)
- [Policy Design Patterns](../patterns/policy-patterns.md)
- [RBAC Best Practices](../best-practices/rbac-practices.md)
- [Security Testing Guide](../testing/security-testing.md)

### Integration Examples

- [OpenShift Integration](../integrations/openshift.md)
- [Kubernetes Admission Webhooks](../integrations/kubernetes.md)
- [Monitoring and Alerting](../monitoring/overview.md)

### Community Resources

- [GitHub Issues](https://github.com/fortifai/fortifai/issues)
- [Discord Community](https://discord.gg/fortifai)
- [Documentation Wiki](https://docs.fortifai.com)
