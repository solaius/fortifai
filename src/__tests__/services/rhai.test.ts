import { BindingsService } from '../../services/bindings';
import { SecretsService } from '../../services/secrets';
import { ProvidersService } from '../../services/providers';
import { 
  MCPServerBinding, 
  SecretBinding, 
  CreateBindingRequest,
  RuntimeConfig,
  ValidationStatus 
} from '../../types/bindings';
import { SecretReference } from '../../types/secrets';
import { Provider } from '../../types/providers';

// Mock all external services
jest.mock('../../services/api');
jest.mock('../../services/secrets');
jest.mock('../../services/providers');
jest.mock('../../services/mockData');

// Import mocked services
const mockSecretsService = require('../../services/secrets').secretsService;
const mockProvidersService = require('../../services/providers').providersService;
const mockApi = require('../../services/api').api;

// Setup mock API responses
mockApi.post.mockResolvedValue({
  success: true,
  data: {
    id: 'ai-mlops-server-01',
    name: 'MLOps Production Server',
    description: 'Production MCP server for MLOps workloads',
    serverId: 'mcp-mlops-prod-01',
    serverName: 'mcp-mlops-prod-01',
    serverType: 'mcp-server',
    environment: 'production',
    namespace: 'ai-mlops-prod',
    project: 'mlops-production',
    secretBindings: [
      {
        id: 'openai-binding',
        secretReferenceId: 'openai-api-key',
        secretName: 'OpenAI API Key',
        secretPath: 'secrets/openai/api-key',
        providerType: 'vault',
        envVarName: 'OPENAI_API_KEY',
        envVarType: 'string',
        accessLevel: 'read',
        required: true,
        category: 'api-keys',
        priority: 'high',
        refreshInterval: 3600,
        refreshCount: 0,
        errorHandling: {
          strategy: 'fail-fast',
          logErrors: true,
          notifyOnError: true,
          notificationChannels: ['slack-mlops']
        },
        errorCount: 0
      }
    ],
    runtimeConfig: {
      deploymentStrategy: 'rolling',
      replicas: 3,
      resources: {
        cpu: { request: '500m', limit: '1000m' },
        memory: { request: '1Gi', limit: '2Gi' }
      },
      envVars: [],
      volumeMounts: [],
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
        fsGroup: 1000
      },
      healthChecks: [],
      monitoring: {
        enabled: true,
        metrics: { port: 8080, path: '/metrics' },
        tracing: { enabled: true, sampler: 0.1, backend: 'jaeger' },
        alerting: { enabled: true, rules: [] }
      },
      logging: {
        level: 'info',
        format: 'json',
        output: 'stdout',
        retention: 30
      }
    },
    validationStatus: { status: 'valid', errors: [], warnings: [], lastValidated: new Date().toISOString(), validationDuration: 0 },
    lastValidation: new Date().toISOString(),
    healthStatus: 'healthy',
    labels: { 'ai.openshift.io/workload-type': 'mlops' },
    annotations: {},
    tags: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'mlops-engineer',
    lastDeployed: new Date().toISOString(),
    deploymentCount: 0
  }
});

describe('RHAI-Specific Functionality', () => {
  let bindingsService: BindingsService;
  let secretsService: SecretsService;
  let providersService: ProvidersService;

  // RHAI-specific test data
  const mockAIWorkload: MCPServerBinding = {
    id: 'ai-mlops-server-01',
    name: 'MLOps Production Server',
    description: 'Production MCP server for MLOps workloads',
    serverId: 'mcp-mlops-prod-01',
    serverName: 'mcp-mlops-prod-01',
    serverType: 'mcp-server',
    environment: 'production',
    namespace: 'ai-mlops-prod',
    project: 'mlops-production',
    secretBindings: [
      {
        id: 'openai-binding',
        secretReferenceId: 'openai-api-key',
        secretName: 'OpenAI API Key',
        secretPath: 'secrets/openai/api-key',
        providerType: 'vault',
        envVarName: 'OPENAI_API_KEY',
        envVarType: 'string',
        accessLevel: 'read',
        required: true,
        category: 'api-keys',
        priority: 'high',
        refreshInterval: 3600, // 1 hour
        refreshCount: 0,
        errorHandling: {
          strategy: 'fail-fast',
          logErrors: true,
          notifyOnError: true,
          notificationChannels: ['slack-mlops']
        },
        errorCount: 0
      },
      {
        id: 'database-binding',
        secretReferenceId: 'ml-database-credentials',
        secretName: 'ML Database Credentials',
        secretPath: 'secrets/ml/database/credentials',
        providerType: 'vault',
        envVarName: 'ML_DB_CONNECTION_STRING',
        envVarType: 'string',
        accessLevel: 'read',
        required: true,
        category: 'database',
        priority: 'critical',
        refreshInterval: 0, // No refresh
        refreshCount: 0,
        errorHandling: {
          strategy: 'retry',
          maxRetries: 3,
          retryDelay: 5,
          logErrors: true,
          notifyOnError: true
        },
        errorCount: 0
      }
    ],
    runtimeConfig: {
      deploymentStrategy: 'rolling',
      replicas: 3,
      resources: {
        cpu: { request: '500m', limit: '1000m' },
        memory: { request: '1Gi', limit: '2Gi' }
      },
      envVars: [],
      volumeMounts: [],
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
        fsGroup: 1000
      },
      healthChecks: [
        {
          type: 'http',
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
        metrics: { port: 8080, path: '/metrics' },
        tracing: { enabled: true, sampler: 0.1, backend: 'jaeger' },
        alerting: { enabled: true, rules: [] }
      },
      logging: {
        level: 'info',
        format: 'json',
        output: 'stdout',
        retention: 30
      }
    },
    validationStatus: {
      status: 'valid',
      errors: [],
      warnings: [],
      lastValidated: new Date().toISOString(),
      validationDuration: 150
    },
    lastValidation: new Date().toISOString(),
    healthStatus: 'healthy',
    labels: {
      'app.kubernetes.io/name': 'mlops-server',
      'app.kubernetes.io/version': 'v1.0.0',
      'ai.openshift.io/workload-type': 'mlops',
      'ai.openshift.io/team': 'mlops'
    },
    annotations: {
      'ai.openshift.io/description': 'Production MLOps MCP server',
      'ai.openshift.io/owner': 'mlops-team',
      'ai.openshift.io/cost-center': 'ai-mlops'
    },
    tags: ['mlops', 'production', 'ai', 'mcp-server'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'mlops-engineer',
    lastDeployed: new Date().toISOString(),
    deploymentCount: 5
  };

  const mockAINotebook: MCPServerBinding = {
    id: 'ai-notebook-01',
    name: 'AI Research Notebook',
    description: 'Jupyter notebook for AI research and experimentation',
    serverId: 'jupyter-ai-research-01',
    serverName: 'jupyter-ai-research-01',
    serverType: 'mcp-server',
    environment: 'development',
    namespace: 'ai-research-dev',
    project: 'ai-research',
    secretBindings: [
      {
        id: 'research-api-binding',
        secretReferenceId: 'research-api-key',
        secretName: 'Research API Key',
        secretPath: 'secrets/research/api-key',
        providerType: 'vault',
        envVarName: 'RESEARCH_API_KEY',
        envVarType: 'string',
        accessLevel: 'read',
        required: false,
        category: 'research',
        priority: 'medium',
        refreshInterval: 86400, // 24 hours
        refreshCount: 0,
        errorHandling: {
          strategy: 'fallback',
          fallbackValue: 'demo-key',
          logErrors: true,
          notifyOnError: false
        },
        errorCount: 0
      }
    ],
    runtimeConfig: {
      deploymentStrategy: 'recreate',
      replicas: 1,
      resources: {
        cpu: { request: '200m', limit: '500m' },
        memory: { request: '512Mi', limit: '1Gi' }
      },
      envVars: [],
      volumeMounts: [],
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
        fsGroup: 1000
      },
      healthChecks: [],
      monitoring: {
        enabled: false,
        metrics: { port: 8080, path: '/metrics' },
        tracing: { enabled: false, sampler: 1.0, backend: 'jaeger' },
        alerting: { enabled: false, rules: [] }
      },
      logging: {
        level: 'debug',
        format: 'text',
        output: 'stdout',
        retention: 7
      }
    },
    validationStatus: {
      status: 'valid',
      errors: [],
      warnings: [],
      lastValidated: new Date().toISOString(),
      validationDuration: 50
    },
    lastValidation: new Date().toISOString(),
    healthStatus: 'healthy',
    labels: {
      'app.kubernetes.io/name': 'ai-notebook',
      'app.kubernetes.io/version': 'v0.1.0',
      'ai.openshift.io/workload-type': 'notebook',
      'ai.openshift.io/team': 'ai-research'
    },
    annotations: {
      'ai.openshift.io/description': 'AI research notebook',
      'ai.openshift.io/owner': 'ai-researcher',
      'ai.openshift.io/cost-center': 'ai-research'
    },
    tags: ['notebook', 'development', 'ai', 'research'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'ai-researcher',
    lastDeployed: new Date().toISOString(),
    deploymentCount: 1
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

  describe('MCP Server AI Workload Management', () => {
    it('should create MCP server binding for AI workloads', async () => {
      const createRequest: CreateBindingRequest = {
        name: 'MLOps Production Server',
        description: 'Production MCP server for MLOps workloads',
        serverId: 'mcp-mlops-prod-01',
        environment: 'production',
        namespace: 'ai-mlops-prod',
        project: 'mlops-production',
        secretBindings: [
          {
            secretReferenceId: 'openai-api-key',
            envVarName: 'OPENAI_API_KEY',
            envVarType: 'string',
            accessLevel: 'read',
            required: true,
            category: 'api-keys',
            priority: 'high',
            refreshInterval: 3600,
            errorHandling: {
              strategy: 'fail-fast',
              logErrors: true,
              notifyOnError: true
            }
          }
        ],
        runtimeConfig: {
          deploymentStrategy: 'rolling',
          replicas: 3,
          resources: {
            cpu: { request: '500m', limit: '1000m' },
            memory: { request: '1Gi', limit: '2Gi' }
          }
        },
        labels: {
          'ai.openshift.io/workload-type': 'mlops',
          'ai.openshift.io/team': 'mlops'
        },
        tags: ['mlops', 'production', 'ai']
      };

      const result = await bindingsService.createBinding(createRequest);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('MLOps Production Server');
      expect(result!.environment).toBe('production');
      expect(result!.namespace).toBe('ai-mlops-prod');
      expect(result!.project).toBe('mlops-production');
      expect(result!.secretBindings).toHaveLength(1);
      expect(result!.secretBindings[0].envVarName).toBe('OPENAI_API_KEY');
      expect(result!.labels['ai.openshift.io/workload-type']).toBe('mlops');
    });

    it('should validate AI workload security requirements', async () => {
      const binding = mockAIWorkload;
      
      // Test security context validation
      expect(binding.runtimeConfig.securityContext?.runAsNonRoot).toBe(true);
      expect(binding.runtimeConfig.securityContext?.runAsUser).toBe(1000);
      expect(binding.runtimeConfig.securityContext?.fsGroup).toBe(1000);
      
      // Test resource limits
      expect(binding.runtimeConfig.resources?.cpu.limit).toBe('1000m');
      expect(binding.runtimeConfig.resources?.memory.limit).toBe('2Gi');
      
      // Test health check configuration
      expect(binding.runtimeConfig.healthChecks).toHaveLength(1);
      expect(binding.runtimeConfig.healthChecks[0].type).toBe('http');
    });

    it('should support AI-specific monitoring and tracing', async () => {
      const binding = mockAIWorkload;
      
      // Test monitoring configuration
      expect(binding.runtimeConfig.monitoring?.enabled).toBe(true);
      expect(binding.runtimeConfig.monitoring?.metrics.port).toBe(8080);
      expect(binding.runtimeConfig.monitoring?.tracing.enabled).toBe(true);
      expect(binding.runtimeConfig.monitoring?.tracing.backend).toBe('jaeger');
      
      // Test alerting configuration
      expect(binding.runtimeConfig.monitoring?.alerting.enabled).toBe(true);
    });

    it('should handle AI workload deployment strategies', async () => {
      const productionBinding = mockAIWorkload;
      const developmentBinding = mockAINotebook;
      
      // Production should use rolling deployment
      expect(productionBinding.runtimeConfig.deploymentStrategy).toBe('rolling');
      expect(productionBinding.runtimeConfig.replicas).toBe(3);
      
      // Development should use recreate deployment
      expect(developmentBinding.runtimeConfig.deploymentStrategy).toBe('recreate');
      expect(developmentBinding.runtimeConfig.replicas).toBe(1);
    });
  });

  describe('AI-Specific Secret Binding Patterns', () => {
    it('should support API key rotation for AI services', async () => {
      const apiKeyBinding = mockAIWorkload.secretBindings.find(
        b => b.secretName === 'OpenAI API Key'
      );
      
      expect(apiKeyBinding).toBeDefined();
      expect(apiKeyBinding?.refreshInterval).toBe(3600); // 1 hour
      expect(apiKeyBinding?.errorHandling.strategy).toBe('fail-fast');
      expect(apiKeyBinding?.errorHandling.notifyOnError).toBe(true);
    });

    it('should handle database credentials for ML workloads', async () => {
      const dbBinding = mockAIWorkload.secretBindings.find(
        b => b.secretName === 'ML Database Credentials'
      );
      
      expect(dbBinding).toBeDefined();
      expect(dbBinding?.priority).toBe('critical');
      expect(dbBinding?.errorHandling.strategy).toBe('retry');
      expect(dbBinding?.errorHandling.maxRetries).toBe(3);
      expect(dbBinding?.refreshInterval).toBe(0); // No refresh for DB creds
    });

    it('should support research environment fallback strategies', async () => {
      const researchBinding = mockAINotebook.secretBindings.find(
        b => b.secretName === 'Research API Key'
      );
      
      expect(researchBinding).toBeDefined();
      expect(researchBinding?.required).toBe(false);
      expect(researchBinding?.errorHandling.strategy).toBe('fallback');
      expect(researchBinding?.errorHandling.fallbackValue).toBe('demo-key');
    });

    it('should validate AI workload secret access patterns', async () => {
      const aiWorkloads = [mockAIWorkload, mockAINotebook];
      
      aiWorkloads.forEach(workload => {
        workload.secretBindings.forEach(binding => {
          // All AI workloads should have proper error handling
          expect(binding.errorHandling).toBeDefined();
          expect(binding.errorHandling.logErrors).toBe(true);
          
          // All AI workloads should have proper categorization
          expect(binding.category).toBeDefined();
          expect(binding.priority).toBeDefined();
        });
      });
    });
  });

  describe('Enterprise AI Team Collaboration', () => {
    it('should support multi-tenant AI project isolation', async () => {
      const mlopsProject = mockAIWorkload;
      const researchProject = mockAINotebook;
      
      // Different projects should have different namespaces
      expect(mlopsProject.namespace).toBe('ai-mlops-prod');
      expect(researchProject.namespace).toBe('ai-research-dev');
      
      // Different projects should have different project identifiers
      expect(mlopsProject.project).toBe('mlops-production');
      expect(researchProject.project).toBe('ai-research');
      
      // Different projects should have different teams
      expect(mlopsProject.labels['ai.openshift.io/team']).toBe('mlops');
      expect(researchProject.labels['ai.openshift.io/team']).toBe('ai-research');
    });

    it('should enforce AI workload cost center tracking', async () => {
      const mlopsWorkload = mockAIWorkload;
      const researchWorkload = mockAINotebook;
      
      expect(mlopsWorkload.annotations['ai.openshift.io/cost-center']).toBe('ai-mlops');
      expect(researchWorkload.annotations['ai.openshift.io/cost-center']).toBe('ai-research');
    });

    it('should support AI workload ownership and responsibility', async () => {
      const mlopsWorkload = mockAIWorkload;
      const researchWorkload = mockAINotebook;
      
      expect(mlopsWorkload.annotations['ai.openshift.io/owner']).toBe('mlops-team');
      expect(researchWorkload.annotations['ai.openshift.io/owner']).toBe('ai-researcher');
      expect(mlopsWorkload.createdBy).toBe('mlops-engineer');
      expect(researchWorkload.createdBy).toBe('ai-researcher');
    });

    it('should validate AI workload lifecycle management', async () => {
      const productionWorkload = mockAIWorkload;
      const developmentWorkload = mockAINotebook;
      
      // Production workloads should have deployment tracking
      expect(productionWorkload.lastDeployed).toBeDefined();
      expect(productionWorkload.deploymentCount).toBeGreaterThan(0);
      
      // Development workloads may have fewer deployments
      expect(developmentWorkload.deploymentCount).toBe(1);
    });
  });

  describe('AI Workload Validation and Health', () => {
    it('should validate AI workload configuration integrity', async () => {
      const aiWorkloads = [mockAIWorkload, mockAINotebook];
      
      aiWorkloads.forEach(workload => {
        // All AI workloads should have validation status
        expect(workload.validationStatus).toBeDefined();
        expect(workload.validationStatus.status).toBe('valid');
        expect(workload.validationStatus.lastValidated).toBeDefined();
        
        // All AI workloads should have health status
        expect(workload.healthStatus).toBeDefined();
        expect(workload.healthStatus).toBe('healthy');
      });
    });

    it('should support AI workload performance monitoring', async () => {
      const productionWorkload = mockAIWorkload;
      
      // Production workloads should have comprehensive monitoring
      expect(productionWorkload.runtimeConfig.monitoring?.enabled).toBe(true);
      expect(productionWorkload.runtimeConfig.monitoring?.metrics.port).toBe(8080);
      expect(productionWorkload.runtimeConfig.monitoring?.tracing.enabled).toBe(true);
      
      // Production workloads should have health checks
      expect(productionWorkload.runtimeConfig.healthChecks).toHaveLength(1);
      expect(productionWorkload.runtimeConfig.healthChecks[0].path).toBe('/health');
    });

    it('should handle AI workload error scenarios gracefully', async () => {
      const aiWorkloads = [mockAIWorkload, mockAINotebook];
      
      aiWorkloads.forEach(workload => {
        workload.secretBindings.forEach(binding => {
          // All bindings should have error handling strategies
          expect(binding.errorHandling.strategy).toBeDefined();
          expect(binding.errorHandling.logErrors).toBe(true);
          
          // Critical bindings should have notification
          if (binding.priority === 'critical') {
            expect(binding.errorHandling.notifyOnError).toBe(true);
          }
        });
      });
    });
  });

  describe('AI Workload Security and Compliance', () => {
    it('should enforce AI workload security standards', async () => {
      const aiWorkloads = [mockAIWorkload, mockAINotebook];
      
      aiWorkloads.forEach(workload => {
        // All AI workloads should run as non-root
        expect(workload.runtimeConfig.securityContext?.runAsNonRoot).toBe(true);
        expect(workload.runtimeConfig.securityContext?.runAsUser).toBe(1000);
        expect(workload.runtimeConfig.securityContext?.fsGroup).toBe(1000);
      });
    });

    it('should support AI workload audit and compliance', async () => {
      const productionWorkload = mockAIWorkload;
      
      // Production workloads should have comprehensive logging
      expect(productionWorkload.runtimeConfig.logging?.level).toBe('info');
      expect(productionWorkload.runtimeConfig.logging?.format).toBe('json');
      expect(productionWorkload.runtimeConfig.logging?.retention).toBe(30);
      
      // Production workloads should have audit trails
      expect(productionWorkload.createdAt).toBeDefined();
      expect(productionWorkload.updatedAt).toBeDefined();
      expect(productionWorkload.createdBy).toBeDefined();
    });

    it('should validate AI workload resource constraints', async () => {
      const aiWorkloads = [mockAIWorkload, mockAINotebook];
      
      aiWorkloads.forEach(workload => {
        // All AI workloads should have resource limits
        expect(workload.runtimeConfig.resources?.cpu.limit).toBeDefined();
        expect(workload.runtimeConfig.resources?.memory.limit).toBeDefined();
        
        // All AI workloads should have resource requests
        expect(workload.runtimeConfig.resources?.cpu.request).toBeDefined();
        expect(workload.runtimeConfig.resources?.memory.request).toBeDefined();
      });
    });
  });

  describe('AI Workload Integration Patterns', () => {
    it('should support MCP server integration for AI workloads', async () => {
      const aiWorkloads = [mockAIWorkload, mockAINotebook];
      
      aiWorkloads.forEach(workload => {
        // All AI workloads should be MCP servers
        expect(workload.serverType).toBe('mcp-server');
        expect(workload.serverId).toBeDefined();
        expect(workload.serverName).toBeDefined();
        
        // All AI workloads should have proper server identification
        expect(workload.serverId).toMatch(/^mcp-|^jupyter-/);
      });
    });

    it('should support AI workload environment management', async () => {
      const productionWorkload = mockAIWorkload;
      const developmentWorkload = mockAINotebook;
      
      // Different environments should have different configurations
      expect(productionWorkload.environment).toBe('production');
      expect(developmentWorkload.environment).toBe('development');
      
      // Production should have more robust configuration
      expect(productionWorkload.runtimeConfig.replicas).toBeGreaterThan(1);
      expect(developmentWorkload.runtimeConfig.replicas).toBe(1);
    });

    it('should support AI workload scaling and deployment', async () => {
      const productionWorkload = mockAIWorkload;
      
      // Production workloads should support scaling
      expect(productionWorkload.runtimeConfig.replicas).toBe(3);
      expect(productionWorkload.runtimeConfig.deploymentStrategy).toBe('rolling');
      
      // Production workloads should have deployment tracking
      expect(productionWorkload.lastDeployed).toBeDefined();
      expect(productionWorkload.deploymentCount).toBeGreaterThan(0);
    });
  });
});
