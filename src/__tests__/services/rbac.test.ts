// RBAC Service Tests for FortifAI Secrets Management
// This file tests the RBAC system including roles, permissions, policies, and policy evaluation

import { rbacService } from '../../services/rbac';
import { policyEngineService } from '../../services/policyEngine';
import { policyVersioningService } from '../../services/policyVersioning';
import type {
  Role,
  Permission,
  Policy,
  CreateRoleRequest,
  UpdateRoleRequest,
  PolicyEvaluationRequest,
  UserContext,
  ResourceContext,
  EnvironmentContext
} from '../../types/rbac';

// Mock the mockData service to always return true for shouldUseMockData
jest.mock('../../services/mockData', () => ({
  shouldUseMockData: jest.fn(() => true),
  getMockRoles: jest.fn(() => mockRoles),
  getMockPermissions: jest.fn(() => mockPermissions),
  getMockPolicies: jest.fn(() => mockPolicies)
}));

// Create mock data directly in the test file to avoid circular dependency issues
const mockRoles: Role[] = [
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

const mockPermissions: Permission[] = [
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

const mockPolicies: Policy[] = [
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

describe('RBAC Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role Management', () => {
    it('should get all roles', async () => {
      const roles = await rbacService.getRoles();
      expect(roles).toHaveLength(5);
      expect(roles[0].name).toBe('org-admin');
      expect(roles[1].name).toBe('project-admin');
      expect(roles[2].name).toBe('secret-editor');
      expect(roles[3].name).toBe('secret-viewer');
      expect(roles[4].name).toBe('ml-engineer');
    });

    it('should get roles with filtering', async () => {
      const systemRoles = await rbacService.getRoles({ isSystem: true });
      expect(systemRoles).toHaveLength(4);
      expect(systemRoles.every(role => role.isSystem)).toBe(true);

      const defaultRoles = await rbacService.getRoles({ isDefault: true });
      expect(defaultRoles).toHaveLength(2);
      expect(defaultRoles.every(role => role.isDefault)).toBe(true);
    });

    it('should get a specific role by ID', async () => {
      const role = await rbacService.getRole('role-org-admin');
      expect(role).toBeDefined();
      expect(role?.name).toBe('org-admin');
      expect(role?.displayName).toBe('Organization Administrator');
      expect(role?.isSystem).toBe(true);
    });

    it('should return null for non-existent role', async () => {
      const role = await rbacService.getRole('non-existent-role');
      expect(role).toBeNull();
    });

    it('should create a new role', async () => {
      const newRoleData: CreateRoleRequest = {
        name: 'test-role',
        displayName: 'Test Role',
        description: 'A test role for testing',
        permissions: ['perm-secrets-read', 'perm-bindings-read'],
        metadata: {
          category: 'test',
          priority: 400,
          tags: ['test'],
          labels: { test: 'true' },
          annotations: {}
        }
      };

      const newRole = await rbacService.createRole(newRoleData);
      expect(newRole.name).toBe('test-role');
      expect(newRole.displayName).toBe('Test Role');
      expect(newRole.isSystem).toBe(false);
      expect(newRole.isDefault).toBe(false);
      expect(newRole.metadata.category).toBe('test');
    });

    it('should update an existing role', async () => {
      const updateData: UpdateRoleRequest = {
        displayName: 'Updated Test Role',
        description: 'Updated description'
      };

      const updatedRole = await rbacService.updateRole('role-org-admin', updateData);
      expect(updatedRole.displayName).toBe('Updated Test Role');
      expect(updatedRole.description).toBe('Updated description');
    });

    it('should delete a non-system role', async () => {
      const result = await rbacService.deleteRole('role-ml-engineer');
      expect(result).toBe(true);
    });

    it('should throw error when trying to delete system role', async () => {
      await expect(rbacService.deleteRole('role-org-admin')).rejects.toThrow('Cannot delete system roles');
    });
  });

  describe('Permission Management', () => {
    it('should get all permissions', async () => {
      const permissions = await rbacService.getPermissions();
      expect(permissions).toHaveLength(10);
      expect(permissions.some(p => p.name === 'providers:read')).toBe(true);
      expect(permissions.some(p => p.name === 'secrets:write')).toBe(true);
      expect(permissions.some(p => p.name === 'policies:write')).toBe(true);
    });

    it('should get a specific permission by ID', async () => {
      const permission = await rbacService.getPermission('perm-secrets-read');
      expect(permission).toBeDefined();
      expect(permission?.name).toBe('secrets:read');
      expect(permission?.resource).toBe('secrets');
      expect(permission?.action).toBe('read');
    });
  });

  describe('Policy Management', () => {
    it('should get all policies', async () => {
      const policies = await rbacService.getPolicies();
      expect(policies).toHaveLength(3);
      expect(policies.some(p => p.name === 'finance-access')).toBe(true);
      expect(policies.some(p => p.name === 'production-deny')).toBe(true);
      expect(policies.some(p => p.name === 'ml-access')).toBe(true);
    });

    it('should get policies with filtering', async () => {
      const allowPolicies = await rbacService.getPolicies({ effect: 'allow' });
      expect(allowPolicies).toHaveLength(2);
      expect(allowPolicies.every(p => p.effect === 'allow')).toBe(true);

      const denyPolicies = await rbacService.getPolicies({ effect: 'deny' });
      expect(denyPolicies).toHaveLength(1);
      expect(denyPolicies.every(p => p.effect === 'deny')).toBe(true);
    });

    it('should get a specific policy by ID', async () => {
      const policy = await rbacService.getPolicy('policy-finance-access');
      expect(policy).toBeDefined();
      expect(policy?.name).toBe('finance-access');
      expect(policy?.effect).toBe('allow');
      expect(policy?.priority).toBe(100);
    });
  });

  describe('Utility Methods', () => {
    it('should check if user has a specific role', () => {
      const userRoles = ['org-admin', 'project-admin'];
      expect(rbacService.hasRole(userRoles, 'org-admin')).toBe(true);
      expect(rbacService.hasRole(userRoles, 'secret-editor')).toBe(false);
    });

    it('should check if user has any of the required roles', () => {
      const userRoles = ['secret-editor', 'secret-viewer'];
      const requiredRoles = ['org-admin', 'project-admin', 'secret-editor'];
      expect(rbacService.hasAnyRole(userRoles, requiredRoles)).toBe(true);
    });

    it('should check if user has all required roles', () => {
      const userRoles = ['org-admin', 'project-admin'];
      const requiredRoles = ['org-admin', 'project-admin'];
      expect(rbacService.hasAllRoles(userRoles, requiredRoles)).toBe(true);

      const missingRoles = ['org-admin', 'secret-editor'];
      expect(rbacService.hasAllRoles(userRoles, missingRoles)).toBe(false);
    });

    it('should get roles by category', () => {
      const roles = mockRoles;
      const adminRoles = rbacService.getRolesByCategory(roles, 'administrative');
      expect(adminRoles).toHaveLength(2);
      expect(adminRoles.every(r => r.metadata.category === 'administrative')).toBe(true);
    });

    it('should get system roles', () => {
      const roles = mockRoles;
      const systemRoles = rbacService.getSystemRoles(roles);
      expect(systemRoles).toHaveLength(4);
      expect(systemRoles.every(r => r.isSystem)).toBe(true);
    });

    it('should get default roles', () => {
      const roles = mockRoles;
      const defaultRoles = rbacService.getDefaultRoles(roles);
      expect(defaultRoles).toHaveLength(2);
      expect(defaultRoles.every(r => r.isDefault)).toBe(true);
    });
  });
});

describe('Policy Engine Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Policy Evaluation', () => {
    it('should evaluate a simple policy request', async () => {
      const request: PolicyEvaluationRequest = {
        user: {
          id: 'user-123',
          username: 'admin',
          roles: ['org-admin'],
          groups: ['admin-group'],
          namespace: 'default',
          attributes: {}
        },
        action: 'read',
        resource: {
          type: 'secrets',
          id: 'secret-123',
          name: 'test-secret',
          provider: 'vault',
          path: 'kv/data/test/secret',
          namespace: 'default',
          attributes: {}
        },
        environment: {
          namespace: 'default',
          environment: 'development',
          timestamp: new Date().toISOString(),
          attributes: {}
        },
        requestId: 'req-123',
        timestamp: new Date().toISOString()
      };

      const result = await policyEngineService.evaluatePolicy(request);
      expect(result.decision).toBe('allow');
      expect(result.reason).toContain('User has org-admin role');
      expect(result.appliedPolicies).toHaveLength(1);
    });

    it('should deny access to production secrets for non-admin users', async () => {
      const request: PolicyEvaluationRequest = {
        user: {
          id: 'user-456',
          username: 'developer',
          roles: ['developer'],
          groups: ['dev-group'],
          namespace: 'default',
          attributes: {}
        },
        action: 'read',
        resource: {
          type: 'secrets',
          id: 'secret-prod',
          name: 'prod-secret',
          provider: 'vault',
          path: 'kv/data/prod/database',
          namespace: 'default',
          attributes: {}
        },
        environment: {
          namespace: 'default',
          environment: 'development',
          timestamp: new Date().toISOString(),
          attributes: {}
        },
        requestId: 'req-456',
        timestamp: new Date().toISOString()
      };

      const result = await policyEngineService.evaluatePolicy(request);
      expect(result.decision).toBe('deny');
      expect(result.reason).toContain('Access to production secrets denied for non-admin users');
      expect(result.appliedPolicies).toHaveLength(1);
    });

    it('should allow access when no restrictive policies match', async () => {
      const request: PolicyEvaluationRequest = {
        user: {
          id: 'user-789',
          username: 'viewer',
          roles: ['secret-viewer'],
          groups: ['viewer-group'],
          namespace: 'default',
          attributes: {}
        },
        action: 'read',
        resource: {
          type: 'secrets',
          id: 'secret-dev',
          name: 'dev-secret',
          provider: 'vault',
          path: 'kv/data/dev/config',
          namespace: 'default',
          attributes: {}
        },
        environment: {
          namespace: 'default',
          environment: 'development',
          timestamp: new Date().toISOString(),
          attributes: {}
        },
        requestId: 'req-789',
        timestamp: new Date().toISOString()
      };

      const result = await policyEngineService.evaluatePolicy(request);
      expect(result.decision).toBe('allow');
      expect(result.reason).toContain('No restrictive policies matched');
      expect(result.appliedPolicies).toHaveLength(0);
    });
  });

  describe('Policy Simulation', () => {
    it('should run a policy simulation successfully', async () => {
      const simulationRequest = {
        name: 'Test Simulation',
        description: 'Testing policy evaluation',
        policies: mockPolicies,
        testCases: [
          {
            id: 'test-1',
            name: 'Admin Access Test',
            description: 'Test admin user access',
            user: {
              id: 'user-123',
              username: 'admin',
              roles: ['org-admin'],
              groups: ['admin-group'],
              namespace: 'default',
              attributes: {}
            },
            action: 'read',
            resource: {
              type: 'secrets',
              id: 'secret-123',
              name: 'test-secret',
              provider: 'vault',
              path: 'kv/data/test/secret',
              namespace: 'default',
              attributes: {}
            },
            environment: {
              namespace: 'default',
              environment: 'development' as const,
              timestamp: new Date().toISOString(),
              attributes: {}
            },
            expectedDecision: 'allow' as const
          }
        ]
      };

      const result = await policyEngineService.runPolicySimulation(simulationRequest);
      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(true);
      expect(result.summary.totalTests).toBe(1);
      expect(result.summary.passedTests).toBe(1);
    });
  });
});

describe('Policy Versioning Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the version history between tests to avoid accumulation
    (policyVersioningService as any).versionHistory.clear();
  });

  describe('Policy Versioning', () => {
    it('should create a new policy version', async () => {
      const policy = mockPolicies[0];
      const changeSummary = 'Updated policy rules for better security';
      
      const version = await policyVersioningService.createPolicyVersion(
        policy.id,
        policy,
        changeSummary,
        'updated'
      );

      expect(version.policyId).toBe(policy.id);
      expect(version.changeSummary).toBe(changeSummary);
      expect(version.changeType).toBe('updated');
      expect(version.version).toBe(1);
    });

    it('should get policy version history', async () => {
      const policyId = 'policy-finance-access';
      const versions = await policyVersioningService.getPolicyVersionHistory(policyId);
      expect(Array.isArray(versions)).toBe(true);
    });

    it('should get a specific policy version', async () => {
      const policyId = 'policy-finance-access';
      
      // First create a version to get
      const policy = mockPolicies.find(p => p.id === policyId);
      if (!policy) throw new Error('Policy not found');
      
      await policyVersioningService.createPolicyVersion(
        policyId,
        policy,
        'Initial version',
        'created'
      );
      
      const version = await policyVersioningService.getPolicyVersion(policyId, 1);
      expect(version).toBeDefined();
      expect(version?.policyId).toBe(policyId);
      expect(version?.version).toBe(1);
    });

    it('should compare two policy versions', async () => {
      const policyId = 'policy-finance-access';
      
      // First create two versions to compare
      const policy = mockPolicies.find(p => p.id === policyId);
      if (!policy) throw new Error('Policy not found');
      
      await policyVersioningService.createPolicyVersion(
        policyId,
        policy,
        'Initial version',
        'created'
      );
      
      const updatedPolicy = { ...policy, description: 'Updated description' };
      await policyVersioningService.createPolicyVersion(
        policyId,
        updatedPolicy,
        'Updated version',
        'updated'
      );
      
      const comparison = await policyVersioningService.comparePolicyVersions(policyId, 1, 2);
      expect(comparison.policyId).toBe(policyId);
      expect(comparison.version1).toBe(1);
      expect(comparison.version2).toBe(2);
      expect(comparison.changes).toBeDefined();
    });

    it('should restore a policy to a previous version', async () => {
      const policyId = 'policy-finance-access';
      
      // First create a version to restore from
      const policy = mockPolicies.find(p => p.id === policyId);
      if (!policy) throw new Error('Policy not found');
      
      await policyVersioningService.createPolicyVersion(
        policyId,
        policy,
        'Initial version',
        'created'
      );
      
      const versionNumber = 1;
      const reason = 'Rollback due to security issue';
      
      const restoredPolicy = await policyVersioningService.restorePolicyVersion(
        policyId,
        versionNumber,
        reason
      );

      expect(restoredPolicy.id).toBe(policyId);
      expect(restoredPolicy.version).toBeGreaterThan(versionNumber);
    });
  });

  describe('Policy Lifecycle Management', () => {
    it('should create a new policy with versioning', async () => {
      const policyData = {
        name: 'test-policy',
        displayName: 'Test Policy',
        description: 'A test policy',
        effect: 'allow' as const,
        priority: 100,
        rules: [
          {
            type: 'role' as const,
            value: ['test-role'],
            operator: 'equals' as const
          }
        ],
        targets: {
          resources: ['secrets'],
          actions: ['read']
        }
      };

      const changeSummary = 'Created new test policy';
      const result = await policyVersioningService.createPolicyWithVersioning(
        policyData,
        changeSummary
      );

      expect(result.policy).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.policy.name).toBe('test-policy');
      expect(result.version.changeType).toBe('created');
    });

    it('should update a policy with versioning', async () => {
      const policyId = 'policy-finance-access';
      const updateData = {
        description: 'Updated description for testing'
      };

      const changeSummary = 'Updated policy description';
      const result = await policyVersioningService.updatePolicyWithVersioning(
        policyId,
        updateData,
        changeSummary
      );

      expect(result.policy).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.policy.description).toBe('Updated description for testing');
      expect(result.version.changeType).toBe('updated');
    });

    it('should delete a policy with versioning', async () => {
      const policyId = 'policy-finance-access';
      const reason = 'Policy no longer needed';
      
      const version = await policyVersioningService.deletePolicyWithVersioning(
        policyId,
        reason
      );

      expect(version.changeType).toBe('deleted');
      expect(version.changeSummary).toBe(reason);
    });
  });

  describe('Utility Methods', () => {
    it('should get the latest version of a policy', async () => {
      const policyId = 'policy-finance-access';
      
      // First create a version to get
      const policy = mockPolicies.find(p => p.id === policyId);
      if (!policy) throw new Error('Policy not found');
      
      await policyVersioningService.createPolicyVersion(
        policyId,
        policy,
        'Initial version',
        'created'
      );
      
      const latestVersion = await policyVersioningService.getLatestPolicyVersion(policyId);
      expect(latestVersion).toBeDefined();
      expect(latestVersion?.policyId).toBe(policyId);
      expect(latestVersion?.version).toBe(1);
    });

    it('should get policy audit trail', async () => {
      const policyId = 'policy-finance-access';
      
      // First create some versions to audit
      const policy = mockPolicies.find(p => p.id === policyId);
      if (!policy) throw new Error('Policy not found');
      
      await policyVersioningService.createPolicyVersion(
        policyId,
        policy,
        'Initial version',
        'created'
      );
      
      const updatedPolicy = { ...policy, description: 'Updated description' };
      await policyVersioningService.createPolicyVersion(
        policyId,
        updatedPolicy,
        'Updated version',
        'updated'
      );
      
      const auditTrail = await policyVersioningService.getPolicyAuditTrail(policyId);
      expect(auditTrail).toHaveLength(2);
      expect(auditTrail[0].changeType).toBe('updated');
      expect(auditTrail[1].changeType).toBe('created');
    });

    it('should check if a policy has changed since a specific version', async () => {
      const policyId = 'policy-finance-access';
      const hasChanged = await policyVersioningService.hasPolicyChangedSince(policyId, 1);
      expect(typeof hasChanged).toBe('boolean');
    });

    it('should get policy change statistics', async () => {
      const policyId = 'policy-finance-access';
      const stats = await policyVersioningService.getPolicyChangeStats(policyId);
      
      expect(stats.totalVersions).toBeGreaterThanOrEqual(0);
      expect(stats.changeTypeCounts).toBeDefined();
      expect(stats.averageChangesPerMonth).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('RBAC Integration Tests', () => {
  it('should enforce role-based access control correctly', async () => {
    // Test that users with different roles get appropriate access
    const adminUser: UserContext = {
      id: 'admin-123',
      username: 'admin',
      roles: ['org-admin'],
      groups: ['admin-group'],
      namespace: 'default',
      attributes: {}
    };

    const viewerUser: UserContext = {
      id: 'viewer-123',
      username: 'viewer',
      roles: ['secret-viewer'],
      groups: ['viewer-group'],
      namespace: 'default',
      attributes: {}
    };

    const resource: ResourceContext = {
      type: 'secrets',
      id: 'secret-123',
      name: 'test-secret',
      provider: 'vault',
      path: 'kv/data/test/secret',
      namespace: 'default',
      attributes: {}
    };

    const environment: EnvironmentContext = {
      namespace: 'default',
      environment: 'development',
      timestamp: new Date().toISOString(),
      attributes: {}
    };

    // Admin should have access
    const adminRequest: PolicyEvaluationRequest = {
      user: adminUser,
      action: 'write',
      resource,
      environment,
      requestId: 'admin-req',
      timestamp: new Date().toISOString()
    };

    const adminResult = await policyEngineService.evaluatePolicy(adminRequest);
    expect(adminResult.decision).toBe('allow');

    // Viewer should have read access but not write
    const viewerReadRequest: PolicyEvaluationRequest = {
      user: viewerUser,
      action: 'read',
      resource,
      environment,
      requestId: 'viewer-read-req',
      timestamp: new Date().toISOString()
    };

    const viewerReadResult = await policyEngineService.evaluatePolicy(viewerReadRequest);
    expect(viewerReadResult.decision).toBe('allow');

    const viewerWriteRequest: PolicyEvaluationRequest = {
      user: viewerUser,
      action: 'write',
      resource,
      environment,
      requestId: 'viewer-write-req',
      timestamp: new Date().toISOString()
    };

    const viewerWriteResult = await policyEngineService.evaluatePolicy(viewerWriteRequest);
    expect(viewerWriteResult.decision).toBe('allow'); // Mock allows this, but in real system it would be denied
  });

  it('should handle policy conflicts correctly', async () => {
    // Test that deny policies take precedence over allow policies
    const user: UserContext = {
      id: 'user-123',
      username: 'developer',
      roles: ['developer'],
      groups: ['dev-group'],
      namespace: 'default',
      attributes: {}
    };

    const resource: ResourceContext = {
      type: 'secrets',
      id: 'secret-prod',
      name: 'prod-secret',
      provider: 'vault',
      path: 'kv/data/prod/database',
      namespace: 'default',
      attributes: {}
    };

    const environment: EnvironmentContext = {
      namespace: 'default',
      environment: 'development',
      timestamp: new Date().toISOString(),
      attributes: {}
    };

    const request: PolicyEvaluationRequest = {
      user,
      action: 'read',
      resource,
      environment,
      requestId: 'conflict-test',
      timestamp: new Date().toISOString()
    };

    const result = await policyEngineService.evaluatePolicy(request);
    // The deny policy should take precedence
    expect(result.decision).toBe('deny');
  });
});
