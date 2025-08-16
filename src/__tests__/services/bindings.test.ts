import { BindingsService } from '../../services/bindings';
import { CreateBindingRequest, MCPServerBinding, SecretBinding } from '../../types/bindings';

// Mock the API module
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock the mockData module
jest.mock('../../services/mockData', () => ({
  mockBindings: [
    {
      id: 'mcp-server-1',
      name: 'Production MCP Server',
      description: 'Main MCP server for production workloads',
      serverId: 'mcp-prod-01',
      serverName: 'mcp-prod-01',
      serverType: 'mcp-server',
      secretId: 'openai-api-key',
      envVarName: 'OPENAI_API_KEY',
      provider: 'vault-corp',
      status: 'active',
      required: true,
      environment: 'production',
      namespace: 'default',
      secretBindings: [
        {
          id: 'secret-binding-1',
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
          refreshInterval: 0,
          refreshCount: 0,
          errorHandling: {
            strategy: 'fail-fast',
            logErrors: true,
            notifyOnError: false
          },
          errorCount: 0
        }
      ],
      runtimeConfig: {
        timeout: 30,
        retries: 3,
        healthCheck: {
          enabled: true,
          interval: 60,
          timeout: 10
        }
      },
      validationStatus: 'valid',
      lastValidation: new Date().toISOString(),
      healthStatus: 'healthy',
      labels: {},
      annotations: {},
      tags: ['mcp', 'production', 'openai'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
      createdBy: 'ai-team',
      deploymentCount: 1
    },
    {
      id: 'notebook-binding-1',
      name: 'Data Science Notebook',
      description: 'Jupyter notebook for data analysis',
      serverId: 'ds-notebook-01',
      serverName: 'ds-notebook-01',
      serverType: 'mcp-server',
      secretId: 'database-password',
      envVarName: 'DB_PASSWORD',
      provider: 'vault-corp',
      status: 'active',
      required: true,
      environment: 'production',
      namespace: 'default',
      secretBindings: [
        {
          id: 'secret-binding-2',
          secretReferenceId: 'database-password',
          secretName: 'Database Password',
          secretPath: 'secrets/database/prod/password',
          providerType: 'vault',
          envVarName: 'DB_PASSWORD',
          envVarType: 'string',
          accessLevel: 'read',
          required: true,
          category: 'database',
          priority: 'critical',
          refreshInterval: 0,
          refreshCount: 0,
          errorHandling: {
            strategy: 'fail-fast',
            logErrors: true,
            notifyOnError: false
          },
          errorCount: 0
        }
      ],
      runtimeConfig: {
        timeout: 30,
        retries: 3,
        healthCheck: {
          enabled: true,
          interval: 60,
          timeout: 10
        }
      },
      validationStatus: 'valid',
      lastValidation: new Date().toISOString(),
      healthStatus: 'healthy',
      labels: {},
      annotations: {},
      tags: ['notebook', 'database', 'production'],
      createdAt: new Date('2024-01-10').toISOString(),
      updatedAt: new Date('2024-01-10').toISOString(),
      createdBy: 'ds-team',
      deploymentCount: 1
    }
  ],
  shouldUseMockData: jest.fn().mockReturnValue(true),
  mockDelay: jest.fn().mockResolvedValue(undefined)
}));

describe('BindingsService', () => {
  let bindingsService: BindingsService;
  const mockApi = require('../../services/api').api;

  beforeEach(() => {
    jest.clearAllMocks();
    bindingsService = new BindingsService();
  });

  describe('constructor', () => {
    it('should initialize with empty bindings map', () => {
      expect(bindingsService).toBeInstanceOf(BindingsService);
    });
  });

  describe('createBinding', () => {
    const newBindingData: CreateBindingRequest = {
      name: 'Test Binding',
      description: 'Test binding',
      serverId: 'test-mcp-01',
      environment: 'testing',
      namespace: 'default',
      secretBindings: [
        {
          secretReferenceId: 'openai-api-key', // Use a valid secret reference ID
          envVarName: 'TEST_ENV_VAR',
          envVarType: 'string',
          accessLevel: 'read',
          required: true,
          priority: 'medium',
          errorHandling: {
            strategy: 'fail-fast',
            logErrors: true,
            notifyOnError: false
          }
        }
      ],
      runtimeConfig: {
        replicas: 1,
        deploymentStrategy: 'rolling',
        resources: {
          cpu: { request: '100m', limit: '200m' },
          memory: { request: '128Mi', limit: '256Mi' }
        },
        envVars: [],
        volumeMounts: [],
        securityContext: {},
        healthChecks: [],
        monitoring: { 
          enabled: false, 
          metrics: { port: 8080, path: '/metrics' }, 
          tracing: { enabled: false, sampler: 1.0, backend: 'jaeger' },
          alerting: { enabled: false, rules: [] }
        },
        logging: { 
          level: 'info', 
          format: 'json',
          output: 'stdout',
          retention: 30
        }
      }
    };

    it('should create binding with mock data when enabled', async () => {
      const result = await bindingsService.createBinding(newBindingData);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('Test Binding');
      expect(result!.serverId).toBe('test-mcp-01');
      expect(result!.id).toMatch(/^mock-\d+$/);
      expect(result!.createdAt).toBeDefined();
      expect(result!.updatedAt).toBeDefined();
    });

    it('should call API when mock data is disabled', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockResolvedValue({
        success: true,
        data: { ...newBindingData, id: 'api-binding-id' }
      });

      const result = await bindingsService.createBinding(newBindingData);
      
      expect(mockApi.post).toHaveBeenCalledWith('/bindings', newBindingData);
      expect(result).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockRejectedValue(new Error('API Error'));

      const result = await bindingsService.createBinding(newBindingData);
      
      expect(result).toBeNull();
    });
  });

  describe('getBinding', () => {
    it('should return binding from cache if available', async () => {
      // First create a binding to populate cache
      const bindingData: CreateBindingRequest = {
        name: 'Test Binding',
        description: 'Test binding',
        serverId: 'test-mcp',
        environment: 'testing',
        namespace: 'default',
        secretBindings: [
          {
            secretReferenceId: 'openai-api-key', // Use a valid secret reference ID
            envVarName: 'TEST_VAR',
            envVarType: 'string',
            accessLevel: 'read',
            required: true,
            priority: 'medium',
            errorHandling: {
              strategy: 'fail-fast',
              logErrors: true,
              notifyOnError: false
            }
          }
        ],
        runtimeConfig: {}
      };

      const createdBinding = await bindingsService.createBinding(bindingData);
      expect(createdBinding).toBeDefined();

      // Now get it from cache
      const result = await bindingsService.getBinding(createdBinding!.id);
      
      expect(result).toEqual(createdBinding);
    });

    it('should return mock binding when not in cache and mock data enabled', async () => {
      const result = await bindingsService.getBinding('mcp-server-1');
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('mcp-server-1');
      expect(result!.name).toBe('Production MCP Server');
    });

    it('should return null for non-existent binding', async () => {
      const result = await bindingsService.getBinding('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('updateBinding', () => {
    it('should update binding with mock data when enabled', async () => {
      // First create a binding
      const bindingData: CreateBindingRequest = {
        name: 'Test Binding',
        description: 'Test binding',
        serverId: 'test-mcp',
        environment: 'testing',
        namespace: 'default',
        secretBindings: [
          {
            secretReferenceId: 'openai-api-key', // Use a valid secret reference ID
            envVarName: 'TEST_VAR',
            envVarType: 'string',
            accessLevel: 'read',
            required: true,
            priority: 'medium',
            errorHandling: {
              strategy: 'fail-fast',
              logErrors: true,
              notifyOnError: false
            }
          }
        ],
        runtimeConfig: {}
      };

      const createdBinding = await bindingsService.createBinding(bindingData);
      expect(createdBinding).toBeDefined();

      // Now update it
      const updates = { name: 'Updated Binding' };
      const result = await bindingsService.updateBinding(createdBinding!.id, updates);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated Binding');
    });

    it('should return null for non-existent binding', async () => {
      const result = await bindingsService.updateBinding('non-existent', { name: 'Updated' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteBinding', () => {
    it('should delete binding with mock data when enabled', async () => {
      // First create a binding
      const bindingData: CreateBindingRequest = {
        name: 'Test Binding',
        description: 'Test binding',
        serverId: 'test-mcp',
        environment: 'testing',
        namespace: 'default',
        secretBindings: [
          {
            secretReferenceId: 'openai-api-key', // Use a valid secret reference ID
            envVarName: 'TEST_VAR',
            envVarType: 'string',
            accessLevel: 'read',
            required: true,
            priority: 'medium',
            errorHandling: {
              strategy: 'fail-fast',
              logErrors: true,
              notifyOnError: false
            }
          }
        ],
        runtimeConfig: {}
      };

      const createdBinding = await bindingsService.createBinding(bindingData);
      expect(createdBinding).toBeDefined();

      // Now delete it
      const result = await bindingsService.deleteBinding(createdBinding!.id);
      
      expect(result).toBe(true);

      // Verify it's no longer accessible
      const deletedBinding = await bindingsService.getBinding(createdBinding!.id);
      expect(deletedBinding).toBeNull();
    });

    it('should return false for non-existent binding', async () => {
      const result = await bindingsService.deleteBinding('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('listBindings', () => {
    it('should return mock bindings when mock data enabled', async () => {
      const result = await bindingsService.listBindings();
      
      expect(result.bindings).toHaveLength(2);
      expect(result.bindings[0].id).toBe('mcp-server-1');
      expect(result.bindings[1].id).toBe('notebook-binding-1');
    });

    it('should call API when mock data is disabled', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      const mockApiBindings = [
        { id: 'api-binding-1', name: 'API Binding 1', serverId: 'test-server' }
      ];
      
      mockApi.get.mockResolvedValue({
        success: true,
        data: mockApiBindings
      });

      const result = await bindingsService.listBindings();
      
      expect(mockApi.get).toHaveBeenCalledWith('/bindings', { params: {} });
      expect(result).toEqual(mockApiBindings);
    });

    it('should fall back to mock data when API fails in development', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.get.mockRejectedValue(new Error('API Error'));

      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await bindingsService.listBindings();
      
      expect(result).toHaveLength(2); // Should fall back to mock data
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('searchBindings', () => {
    it('should search bindings with query and filters', async () => {
      const filters = { environment: 'production' as const };
      const result = await bindingsService.searchBindings('mcp', filters);
      
      expect(result).toBeDefined();
      expect(result.bindings).toHaveLength(2);
      expect(result.bindings[0].id).toBe('mcp-server-1');
      expect(result.bindings[1].id).toBe('notebook-binding-1');
      expect(result.total).toBe(2);
    });

    it('should search bindings with query only', async () => {
      const result = await bindingsService.searchBindings('mcp');
      
      expect(result).toBeDefined();
      expect(result.bindings).toHaveLength(2);
      expect(result.bindings[0].name).toBe('Production MCP Server');
      expect(result.bindings[1].name).toBe('Notebook Binding');
    });
  });

  describe('validateBinding', () => {
    it('should validate binding configuration', async () => {
      const binding = await bindingsService.getBinding('mcp-server-1');
      expect(binding).toBeDefined();

      const result = await bindingsService.validateBinding(binding!.id);
      
      expect(result).toBeDefined();
      expect(result!.status).toBe('valid');
    });

    it('should return null for non-existent binding', async () => {
      const result = await bindingsService.validateBinding('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('deployBinding', () => {
    it('should deploy binding to target environment', async () => {
      const binding = await bindingsService.getBinding('mcp-server-1');
      expect(binding).toBeDefined();

      const deploymentRequest = {
        bindingId: binding!.id,
        environment: 'production',
        namespace: 'default',
        force: false
      };

      const result = await bindingsService.deployBinding(deploymentRequest);
      
      expect(result).toBeDefined();
      expect(result!.success).toBe(true);
    });

    it('should return null for non-existent binding', async () => {
      const deploymentRequest = {
        bindingId: 'non-existent',
        environment: 'production',
        namespace: 'default',
        force: false
      };

      const result = await bindingsService.deployBinding(deploymentRequest);
      
      expect(result).toBeNull();
    });
  });

  describe('getBindingHealth', () => {
    it('should return binding health status', async () => {
      const binding = await bindingsService.getBinding('mcp-server-1');
      expect(binding).toBeDefined();

      const result = await bindingsService.getBindingHealth(binding!.id);
      
      expect(result).toBeDefined();
      expect(result!.status).toBe('healthy');
    });

    it('should return null for non-existent binding', async () => {
      const result = await bindingsService.getBindingHealth('non-existent');
      
      expect(result).toBeNull();
    });
  });
});
