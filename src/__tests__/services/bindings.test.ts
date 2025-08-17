import { BindingsService } from '../../services/bindings';
import { CreateBindingRequest, MCPServerBinding, SecretBinding } from '../../types/bindings';

// Mock the API module with proper response structure
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock the secrets service
jest.mock('../../services/secrets', () => ({
  secretsService: {
    getReference: jest.fn(),
    listReferences: jest.fn(),
    createReference: jest.fn(),
    updateReference: jest.fn(),
    deleteReference: jest.fn()
  }
}));

// Mock the providers service
jest.mock('../../services/providers', () => ({
  providersService: {
    getProvider: jest.fn(),
    listProviders: jest.fn(),
    createProvider: jest.fn(),
    updateProvider: jest.fn(),
    deleteProvider: jest.fn()
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
        deploymentStrategy: 'rolling',
        replicas: 1,
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
      },
      validationStatus: {
        status: 'valid',
        errors: [],
        warnings: [],
        lastValidated: new Date().toISOString(),
        validationDuration: 100
      },
      lastValidation: new Date().toISOString(),
      healthStatus: 'healthy',
      labels: {},
      annotations: {},
      tags: ['mcp', 'production', 'openai'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
      createdBy: 'ai-team',
      deploymentCount: 1
    }
  ],
  shouldUseMockData: jest.fn().mockReturnValue(true),
  mockDelay: jest.fn().mockResolvedValue(undefined)
}));

describe('BindingsService', () => {
  let bindingsService: BindingsService;
  const mockApi = require('../../services/api').api;
  const mockSecretsService = require('../../services/secrets').secretsService;
  const mockProvidersService = require('../../services/providers').providersService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Force mock data to be used in tests
    const { shouldUseMockData } = require('../../services/mockData');
    shouldUseMockData.mockReturnValue(true);
    
    // Setup default service mocks
    mockSecretsService.getReference.mockImplementation((id: string) => {
      if (id === 'openai-api-key') {
        return {
          id: 'openai-api-key',
          name: 'OpenAI API Key',
          description: 'API key for OpenAI services',
          secretPath: 'secrets/openai/api-key',
          providerType: 'vault',
          category: 'api-keys',
          priority: 'high',
          required: true,
          accessLevel: 'read',
          refreshInterval: 0,
          errorHandling: {
            strategy: 'fail-fast',
            logErrors: true,
            notifyOnError: false
          }
        };
      }
      return null;
    });

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
          secretReferenceId: 'openai-api-key',
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
      // Mock successful API response
      const mockBinding: MCPServerBinding = {
        id: 'test-binding-1',
        name: 'Test Binding',
        description: 'Test binding',
        serverId: 'test-mcp-01',
        serverName: 'test-mcp-01',
        serverType: 'mcp-server',
        status: 'active',
        environment: 'testing',
        namespace: 'default',
        secretBindings: [
          {
            id: 'secret-binding-test-1',
            secretReferenceId: 'openai-api-key',
            secretName: 'OpenAI API Key',
            secretPath: 'secrets/openai/api-key',
            providerType: 'vault',
            envVarName: 'TEST_ENV_VAR',
            envVarType: 'string',
            accessLevel: 'read',
            required: true,
            category: 'api-keys',
            priority: 'medium',
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
          deploymentStrategy: 'rolling',
          replicas: 1,
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
        },
        validationStatus: {
          status: 'valid',
          errors: [],
          warnings: [],
          lastValidated: new Date().toISOString(),
          validationDuration: 100
        },
        lastValidation: new Date().toISOString(),
        healthStatus: 'healthy',
        labels: {},
        annotations: {},
        tags: ['test', 'mcp'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test-user',
        deploymentCount: 0
      };

      mockApi.post.mockResolvedValue({
        success: true,
        data: mockBinding
      });

      const result = await bindingsService.createBinding(newBindingData);
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('test-binding-1');
      expect(result!.name).toBe('Test Binding');
      expect(mockApi.post).toHaveBeenCalledWith('/mcp-bindings', newBindingData);
    });

    it('should handle API errors gracefully', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockRejectedValue(new Error('API Error'));

      await expect(bindingsService.createBinding(newBindingData)).rejects.toThrow('API Error');
    });
  });

  describe('getBinding', () => {
    it('should return mock binding when not in cache and mock data enabled', async () => {
      const { mockBindings } = require('../../services/mockData');
      
      const result = await bindingsService.getBinding('mcp-server-1');
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('mcp-server-1');
      expect(result!.name).toBe('Production MCP Server');
    });
  });

  describe('listBindings', () => {
    it('should return mock bindings when mock data enabled', async () => {
      const { mockBindings } = require('../../services/mockData');
      
      const result = await bindingsService.listBindings();
      
      expect(result).toBeDefined();
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0].id).toBe('mcp-server-1');
      expect(result.bindings[0].name).toBe('Production MCP Server');
    });
  });
});
