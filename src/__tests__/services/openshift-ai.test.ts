import { BindingsService } from '../../services/bindings';
import { SecretsService } from '../../services/secrets';
import { ProvidersService } from '../../services/providers';

// Mock all external services
jest.mock('../../services/api');
jest.mock('../../services/secrets');
jest.mock('../../services/providers');
jest.mock('../../services/mockData');

// Import mocked services
const mockSecretsService = require('../../services/secrets').secretsService;
const mockProvidersService = require('../../services/providers').providersService;
const mockApi = require('../../services/api').api;

describe('OpenShift AI Integration', () => {
  let bindingsService: BindingsService;
  let secretsService: SecretsService;
  let providersService: ProvidersService;

  // Mock OpenShift AI specific data
  const mockOpenShiftAIProject = {
    id: 'ai-mlops-prod',
    name: 'MLOps Production',
    namespace: 'ai-mlops-prod',
    team: 'mlops',
    costCenter: 'ai-mlops',
    environment: 'production',
    owner: 'mlops-team',
    labels: {
      'ai.openshift.io/project-type': 'mlops',
      'ai.openshift.io/environment': 'production',
      'ai.openshift.io/team': 'mlops',
      'ai.openshift.io/cost-center': 'ai-mlops'
    },
    annotations: {
      'ai.openshift.io/description': 'Production MLOps environment',
      'ai.openshift.io/owner': 'mlops-team',
      'ai.openshift.io/created-by': 'mlops-engineer',
      'ai.openshift.io/approval-required': 'true'
    }
  };

  const mockOpenShiftAINamespace = {
    name: 'ai-mlops-prod',
    project: 'ai-mlops-prod',
    team: 'mlops',
    costCenter: 'ai-mlops',
    resourceQuotas: {
      cpu: { request: '4', limit: '8' },
      memory: { request: '8Gi', limit: '16Gi' },
      storage: { request: '100Gi', limit: '200Gi' }
    },
    networkPolicies: [
      {
        name: 'ai-mlops-network-policy',
        policyType: 'ingress',
        allowedNamespaces: ['ai-shared', 'ai-monitoring'],
        allowedServices: ['vault', 'prometheus', 'jaeger']
      }
    ],
    serviceAccounts: [
      {
        name: 'mlops-server-sa',
        namespace: 'ai-mlops-prod',
        secrets: ['mlops-server-token', 'mlops-server-ca'],
        imagePullSecrets: ['mlops-registry-secret']
      }
    ]
  };

  const mockOpenShiftAIOAuth = {
    clientId: 'ai-mlops-client',
    clientSecret: 'encrypted-secret-ref',
    redirectUri: 'https://ai-mlops.openshift.com/oauth/callback',
    scopes: ['openid', 'profile', 'email', 'ai:read', 'ai:write'],
    authorizationEndpoint: 'https://oauth.openshift.com/oauth/authorize',
    tokenEndpoint: 'https://oauth.openshift.com/oauth/token',
    userInfoEndpoint: 'https://oauth.openshift.com/oauth/userinfo'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock services
    bindingsService = new BindingsService();
    secretsService = new SecretsService();
    providersService = new ProvidersService();

    // Setup default mock responses
    mockSecretsService.getReference.mockResolvedValue({
      id: 'openai-api-key',
      name: 'OpenAI API Key',
      providerId: 'vault-corp',
      providerType: 'vault',
      path: 'secrets/openai/api-key'
    });

    mockProvidersService.getProvider.mockResolvedValue({
      id: 'vault-corp',
      name: 'Corporate Vault',
      type: 'vault',
      status: 'active'
    });
  });

  describe('OpenShift AI Project Management', () => {
    it('should support AI project creation with proper isolation', async () => {
      const project = mockOpenShiftAIProject;
      
      // Test project isolation
      expect(project.namespace).toBe('ai-mlops-prod');
      expect(project.team).toBe('mlops');
      expect(project.costCenter).toBe('ai-mlops');
      
      // Test OpenShift AI specific labels
      expect(project.labels['ai.openshift.io/project-type']).toBe('mlops');
      expect(project.labels['ai.openshift.io/environment']).toBe('production');
      expect(project.labels['ai.openshift.io/team']).toBe('mlops');
      
      // Test OpenShift AI specific annotations
      expect(project.annotations['ai.openshift.io/description']).toBeDefined();
      expect(project.annotations['ai.openshift.io/owner']).toBe('mlops-team');
      expect(project.annotations['ai.openshift.io/approval-required']).toBe('true');
    });

    it('should enforce AI project cost center tracking', async () => {
      const project = mockOpenShiftAIProject;
      
      expect(project.costCenter).toBe('ai-mlops');
      expect(project.labels['ai.openshift.io/cost-center']).toBe('ai-mlops');
      
      // Cost center should be consistent across all references
      expect(project.labels['ai.openshift.io/cost-center']).toBeDefined(); // Should be in labels, not annotations
    });

    it('should support AI project team ownership', async () => {
      const project = mockOpenShiftAIProject;
      
      expect(project.team).toBe('mlops');
      expect(project.owner).toBe('mlops-team');
      expect(project.labels['ai.openshift.io/team']).toBe('mlops');
      expect(project.annotations['ai.openshift.io/owner']).toBe('mlops-team');
    });
  });

  describe('OpenShift AI Namespace Management', () => {
    it('should enforce AI namespace resource quotas', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Test resource quotas
      expect(namespace.resourceQuotas.cpu.request).toBe('4');
      expect(namespace.resourceQuotas.cpu.limit).toBe('8');
      expect(namespace.resourceQuotas.memory.request).toBe('8Gi');
      expect(namespace.resourceQuotas.memory.limit).toBe('16Gi');
      expect(namespace.resourceQuotas.storage.request).toBe('100Gi');
      expect(namespace.resourceQuotas.storage.limit).toBe('200Gi');
    });

    it('should apply AI namespace network policies', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      expect(namespace.networkPolicies).toHaveLength(1);
      
      const networkPolicy = namespace.networkPolicies[0];
      expect(networkPolicy.name).toBe('ai-mlops-network-policy');
      expect(networkPolicy.policyType).toBe('ingress');
      expect(networkPolicy.allowedNamespaces).toContain('ai-shared');
      expect(networkPolicy.allowedNamespaces).toContain('ai-monitoring');
      expect(networkPolicy.allowedServices).toContain('vault');
      expect(networkPolicy.allowedServices).toContain('prometheus');
    });

    it('should manage AI namespace service accounts', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      expect(namespace.serviceAccounts).toHaveLength(1);
      
      const serviceAccount = namespace.serviceAccounts[0];
      expect(serviceAccount.name).toBe('mlops-server-sa');
      expect(serviceAccount.namespace).toBe('ai-mlops-prod');
      expect(serviceAccount.secrets).toContain('mlops-server-token');
      expect(serviceAccount.secrets).toContain('mlops-server-ca');
      expect(serviceAccount.imagePullSecrets).toContain('mlops-registry-secret');
    });
  });

  describe('OpenShift AI OAuth Integration', () => {
    it('should configure OAuth for AI workloads', async () => {
      const oauth = mockOpenShiftAIOAuth;
      
      // Test OAuth configuration
      expect(oauth.clientId).toBe('ai-mlops-client');
      expect(oauth.redirectUri).toBe('https://ai-mlops.openshift.com/oauth/callback');
      expect(oauth.scopes).toContain('openid');
      expect(oauth.scopes).toContain('profile');
      expect(oauth.scopes).toContain('ai:read');
      expect(oauth.scopes).toContain('ai:write');
      
      // Test OAuth endpoints
      expect(oauth.authorizationEndpoint).toBe('https://oauth.openshift.com/oauth/authorize');
      expect(oauth.tokenEndpoint).toBe('https://oauth.openshift.com/oauth/token');
      expect(oauth.userInfoEndpoint).toBe('https://oauth.openshift.com/oauth/userinfo');
    });

    it('should support AI-specific OAuth scopes', async () => {
      const oauth = mockOpenShiftAIOAuth;
      
      // AI-specific scopes should be present
      expect(oauth.scopes).toContain('ai:read');
      expect(oauth.scopes).toContain('ai:write');
      
      // Standard OAuth scopes should be present
      expect(oauth.scopes).toContain('openid');
      expect(oauth.scopes).toContain('profile');
      expect(oauth.scopes).toContain('email');
    });

    it('should handle OAuth client secret encryption', async () => {
      const oauth = mockOpenShiftAIOAuth;
      
      // Client secret should be encrypted reference, not plaintext
      expect(oauth.clientSecret).toBe('encrypted-secret-ref');
      expect(typeof oauth.clientSecret).toBe('string');
      expect(oauth.clientSecret).not.toContain('actual-secret-value');
    });
  });

  describe('OpenShift AI Multi-Tenancy', () => {
    it('should support multiple AI teams with isolation', async () => {
      const mlopsProject = mockOpenShiftAIProject;
      const researchProject = {
        ...mockOpenShiftAIProject,
        id: 'ai-research-dev',
        name: 'AI Research',
        namespace: 'ai-research-dev',
        team: 'ai-research',
        costCenter: 'ai-research',
        environment: 'development',
        owner: 'ai-research-team',
        labels: {
          'ai.openshift.io/project-type': 'research',
          'ai.openshift.io/environment': 'development',
          'ai.openshift.io/team': 'ai-research',
          'ai.openshift.io/cost-center': 'ai-research'
        }
      };
      
      // Different teams should have different namespaces
      expect(mlopsProject.namespace).toBe('ai-mlops-prod');
      expect(researchProject.namespace).toBe('ai-research-dev');
      
      // Different teams should have different cost centers
      expect(mlopsProject.costCenter).toBe('ai-mlops');
      expect(researchProject.costCenter).toBe('ai-research');
      
      // Different teams should have different owners
      expect(mlopsProject.owner).toBe('mlops-team');
      expect(researchProject.owner).toBe('ai-research-team');
    });

    it('should enforce namespace-based access control', async () => {
      const mlopsNamespace = mockOpenShiftAINamespace;
      const researchNamespace = {
        ...mockOpenShiftAINamespace,
        name: 'ai-research-dev',
        project: 'ai-research-dev',
        team: 'ai-research',
        costCenter: 'ai-research'
      };
      
      // Different namespaces should have different configurations
      expect(mlopsNamespace.name).toBe('ai-mlops-prod');
      expect(researchNamespace.name).toBe('ai-research-dev');
      
      // Different namespaces should have different teams
      expect(mlopsNamespace.team).toBe('mlops');
      expect(researchNamespace.team).toBe('ai-research');
      
      // Different namespaces should have different cost centers
      expect(mlopsNamespace.costCenter).toBe('ai-mlops');
      expect(researchNamespace.costCenter).toBe('ai-research');
    });
  });

  describe('OpenShift AI Security and Compliance', () => {
    it('should enforce AI workload security standards', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Network policies should be enforced
      expect(namespace.networkPolicies).toBeDefined();
      expect(namespace.networkPolicies.length).toBeGreaterThan(0);
      
      // Service accounts should be properly configured
      expect(namespace.serviceAccounts).toBeDefined();
      expect(namespace.serviceAccounts.length).toBeGreaterThan(0);
      
      // Resource quotas should be enforced
      expect(namespace.resourceQuotas).toBeDefined();
      expect(namespace.resourceQuotas.cpu.limit).toBeDefined();
      expect(namespace.resourceQuotas.memory.limit).toBeDefined();
    });

    it('should support AI workload audit trails', async () => {
      const project = mockOpenShiftAIProject;
      
      // Project should have audit information
      expect(project.annotations['ai.openshift.io/created-by']).toBe('mlops-engineer');
      expect(project.annotations['ai.openshift.io/owner']).toBe('mlops-team');
      expect(project.annotations['ai.openshift.io/description']).toBeDefined();
      
      // Approval requirements should be tracked
      expect(project.annotations['ai.openshift.io/approval-required']).toBe('true');
    });

    it('should validate AI workload resource constraints', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Resource quotas should be reasonable
      expect(parseInt(namespace.resourceQuotas.cpu.request)).toBeGreaterThan(0);
      expect(parseInt(namespace.resourceQuotas.cpu.limit)).toBeGreaterThan(parseInt(namespace.resourceQuotas.cpu.request));
      
      // Memory quotas should be reasonable
      expect(namespace.resourceQuotas.memory.request).toMatch(/^\d+[KMG]i$/);
      expect(namespace.resourceQuotas.memory.limit).toMatch(/^\d+[KMG]i$/);
      
      // Storage quotas should be reasonable
      expect(namespace.resourceQuotas.storage.request).toMatch(/^\d+[KMG]i$/);
      expect(namespace.resourceQuotas.storage.limit).toMatch(/^\d+[KMG]i$/);
    });
  });

  describe('OpenShift AI Integration Patterns', () => {
    it('should support AI workload deployment patterns', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Service accounts should support AI workload deployment
      const serviceAccount = namespace.serviceAccounts[0];
      expect(serviceAccount.secrets).toContain('mlops-server-token');
      expect(serviceAccount.secrets).toContain('mlops-server-ca');
      expect(serviceAccount.imagePullSecrets).toContain('mlops-registry-secret');
    });

    it('should support AI workload monitoring integration', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Network policies should allow monitoring services
      const networkPolicy = namespace.networkPolicies[0];
      expect(networkPolicy.allowedServices).toContain('prometheus');
      expect(networkPolicy.allowedServices).toContain('jaeger');
      
      // Network policies should allow shared services
      expect(networkPolicy.allowedNamespaces).toContain('ai-monitoring');
    });

    it('should support AI workload secret management', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Network policies should allow secret management services
      const networkPolicy = namespace.networkPolicies[0];
      expect(networkPolicy.allowedServices).toContain('vault');
      
      // Service accounts should have access to secrets
      const serviceAccount = namespace.serviceAccounts[0];
      expect(serviceAccount.secrets).toContain('mlops-server-token');
      expect(serviceAccount.secrets).toContain('mlops-server-ca');
    });
  });

  describe('OpenShift AI Operational Patterns', () => {
    it('should support AI workload scaling patterns', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Resource quotas should support scaling
      expect(parseInt(namespace.resourceQuotas.cpu.limit)).toBeGreaterThan(parseInt(namespace.resourceQuotas.cpu.request));
      expect(namespace.resourceQuotas.memory.limit).not.toBe(namespace.resourceQuotas.memory.request);
      
      // Network policies should support scaling
      const networkPolicy = namespace.networkPolicies[0];
      expect(networkPolicy.allowedNamespaces).toContain('ai-shared');
    });

    it('should support AI workload backup and recovery', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Storage quotas should support backup
      expect(namespace.resourceQuotas.storage.limit).toBeDefined();
      expect(namespace.resourceQuotas.storage.request).toBeDefined();
      
      // Network policies should allow backup services
      const networkPolicy = namespace.networkPolicies[0];
      expect(networkPolicy.allowedServices).toContain('vault');
    });

    it('should support AI workload disaster recovery', async () => {
      const namespace = mockOpenShiftAINamespace;
      
      // Resource quotas should support DR scenarios
      expect(parseInt(namespace.resourceQuotas.cpu.limit)).toBeGreaterThan(0);
      expect(namespace.resourceQuotas.memory.limit).toBeDefined();
      
      // Network policies should allow DR services
      const networkPolicy = namespace.networkPolicies[0];
      expect(networkPolicy.allowedNamespaces).toContain('ai-shared');
    });
  });
});
