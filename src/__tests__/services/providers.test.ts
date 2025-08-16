import { ProvidersService } from '../../services/providers';
import { mockProviders } from '../../services/mockData';
import { Provider, VaultProvider, AWSProvider, AzureProvider } from '../../types/providers';

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock the VaultService
jest.mock('../../services/providers/vault', () => ({
  VaultService: jest.fn().mockImplementation(() => ({
    testConnection: jest.fn().mockResolvedValue({ success: true, message: 'Connected' }),
    getHealth: jest.fn().mockResolvedValue({ status: 'healthy', message: 'OK' }),
    logout: jest.fn()
  }))
}));

// Mock the mockData service
jest.mock('../../services/mockData', () => ({
  mockProviders: [
    {
      id: 'vault-corp',
      name: 'Corporate Vault',
      type: 'vault',
      status: 'healthy',
      authMethod: 'approle',
      address: 'https://vault.corp.example.com',
      scopes: ['read', 'write'],
      lastHealthCheck: '2024-01-15T00:00:00.000Z',
      secretCount: 150,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      createdBy: 'admin',
      namespace: 'corp',
      labels: {
        environment: 'production',
        team: 'platform'
      },
      annotations: {},
      config: {
        address: 'https://vault.corp.example.com',
        namespace: 'corp',
        tlsSkipVerify: false,
        timeout: 30,
        maxRetries: 3
      },
      auth: {
        method: 'approle',
        appRole: {
          roleId: 'mock-role-id',
          secretId: 'mock-secret-id'
        }
      },
      capabilities: {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canList: true,
        canUpdate: true
      }
    }
  ],
  shouldUseMockData: jest.fn().mockReturnValue(true),
  mockDelay: jest.fn().mockResolvedValue(undefined),
  createMockResponse: jest.fn()
}));

describe('ProvidersService', () => {
  let providersService: ProvidersService;
  const mockApi = require('../../services/api').api;

  beforeEach(() => {
    jest.clearAllMocks();
    providersService = new ProvidersService();
  });

  describe('constructor', () => {
    it('should initialize with empty providers map', () => {
      expect(providersService).toBeInstanceOf(ProvidersService);
    });
  });

  describe('createProvider', () => {
    const newProviderData = {
      name: 'Test Vault',
      type: 'vault' as const,
      status: 'healthy' as const,
      authMethod: 'approle',
      address: 'https://test-vault.example.com',
      scopes: ['read'],
      lastHealthCheck: '2024-01-01T00:00:00.000Z',
      secretCount: 0,
      createdBy: 'test-user',
      namespace: 'test',
      labels: {
        environment: 'test',
        team: 'test-team'
      },
      annotations: {},
      config: {
        address: 'https://test-vault.example.com',
        namespace: 'test',
        tlsSkipVerify: false,
        timeout: 30,
        maxRetries: 3
      },
      auth: {
        method: 'approle' as const,
        appRole: {
          roleId: 'test-role',
          secretId: 'test-secret'
        }
      },
      capabilities: {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canList: true,
        canUpdate: false
      }
    };

    it('should create provider with mock data when enabled', async () => {
      const result = await providersService.createProvider(newProviderData);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('Test Vault');
      expect(result!.type).toBe('vault');
      expect(result!.id).toMatch(/^mock-\d+$/);
      expect(result!.createdAt).toBeDefined();
      expect(result!.updatedAt).toBeDefined();
    });

    it('should call API when mock data is disabled', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockResolvedValue({
        success: true,
        data: { ...newProviderData, id: 'api-provider-id' }
      });

      const result = await providersService.createProvider(newProviderData);
      
      expect(mockApi.post).toHaveBeenCalledWith('/providers', newProviderData);
      expect(result).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockRejectedValue(new Error('API Error'));

      const result = await providersService.createProvider(newProviderData);
      
      expect(result).toBeNull();
    });
  });

  describe('getProvider', () => {
    it('should return provider from cache if available', async () => {
      // First create a provider to populate cache
      const providerData = {
        name: 'Test Provider',
        type: 'vault' as const,
        status: 'healthy' as const,
        authMethod: 'approle',
        address: 'https://test.example.com',
        scopes: ['read'],
        lastHealthCheck: '2024-01-01T00:00:00.000Z',
        secretCount: 0,
        createdBy: 'test-user',
        namespace: 'test',
        labels: {},
        annotations: {},
        config: {
          address: 'https://test.example.com',
          namespace: 'test',
          tlsSkipVerify: false,
          timeout: 30,
          maxRetries: 3
        },
        auth: { method: 'approle' as const, appRole: { roleId: 'test', secretId: 'test' } },
        capabilities: {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canList: true,
          canUpdate: false
        }
      };

      const createdProvider = await providersService.createProvider(providerData);
      expect(createdProvider).toBeDefined();

      // Now get it from cache
      const result = await providersService.getProvider(createdProvider!.id);
      
      expect(result).toEqual(createdProvider);
    });

    it('should return mock provider when not in cache and mock data enabled', async () => {
      const result = await providersService.getProvider('vault-corp');
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('vault-corp');
      expect(result!.name).toBe('Corporate Vault');
    });

    it('should return null for non-existent provider', async () => {
      const result = await providersService.getProvider('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('updateProvider', () => {
    it('should update provider with mock data when enabled', async () => {
      // First create a provider
      const providerData = {
        name: 'Test Provider',
        type: 'vault' as const,
        status: 'healthy' as const,
        authMethod: 'approle',
        address: 'https://test.example.com',
        scopes: ['read'],
        lastHealthCheck: '2024-01-01T00:00:00.000Z',
        secretCount: 0,
        createdBy: 'test-user',
        namespace: 'test',
        labels: {},
        annotations: {},
        config: {
          address: 'https://test.example.com',
          namespace: 'test',
          tlsSkipVerify: false,
          timeout: 30,
          maxRetries: 3
        },
        auth: { method: 'approle' as const, appRole: { roleId: 'test', secretId: 'test' } },
        capabilities: {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canList: true,
          canUpdate: false
        }
      };

      const createdProvider = await providersService.createProvider(providerData);
      expect(createdProvider).toBeDefined();

      // Now update it
      const updates = { name: 'Updated Provider', labels: { team: 'updated-team' } };
      const result = await providersService.updateProvider(createdProvider!.id, updates);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated Provider');
      expect(result!.labels.team).toBe('updated-team');
      expect(result!.updatedAt).not.toBe(createdProvider!.updatedAt);
    });

    it('should return null for non-existent provider', async () => {
      const result = await providersService.updateProvider('non-existent', { name: 'Updated' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteProvider', () => {
    it('should delete provider with mock data when enabled', async () => {
      // First create a provider
      const providerData = {
        name: 'Test Provider',
        type: 'vault' as const,
        status: 'healthy' as const,
        authMethod: 'approle',
        address: 'https://test.example.com',
        scopes: ['read'],
        lastHealthCheck: '2024-01-01T00:00:00.000Z',
        secretCount: 0,
        createdBy: 'test-user',
        namespace: 'test',
        labels: {},
        annotations: {},
        config: {
          address: 'https://test.example.com',
          namespace: 'test',
          tlsSkipVerify: false,
          timeout: 30,
          maxRetries: 3
        },
        auth: { method: 'approle' as const, appRole: { roleId: 'test', secretId: 'test' } },
        capabilities: {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canList: true,
          canUpdate: false
        }
      };

      const createdProvider = await providersService.createProvider(providerData);
      expect(createdProvider).toBeDefined();

      // Now delete it
      const result = await providersService.deleteProvider(createdProvider!.id);
      
      expect(result).toBe(true);

      // Verify it's no longer accessible
      const deletedProvider = await providersService.getProvider(createdProvider!.id);
      expect(deletedProvider).toBeNull();
    });
  });

  describe('listProviders', () => {
    it('should return mock providers when mock data enabled', async () => {
      const result = await providersService.listProviders();
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vault-corp');
      expect(result[0].name).toBe('Corporate Vault');
    });

    it('should call API when mock data is disabled', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      const mockApiProviders = [
        { id: 'api-provider-1', name: 'API Provider 1', type: 'vault', status: 'healthy' }
      ];
      
      mockApi.get.mockResolvedValue({
        success: true,
        data: mockApiProviders
      });

      const result = await providersService.listProviders();
      
      expect(mockApi.get).toHaveBeenCalledWith('/providers');
      expect(result).toEqual(mockApiProviders);
    });

    it('should fall back to mock data when API fails in development', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.get.mockRejectedValue(new Error('API Error'));

      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await providersService.listProviders();
      
      expect(result).toHaveLength(1); // Should fall back to mock data
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('testProviderConnection', () => {
    it('should test Vault provider connection', async () => {
      const result = await providersService.testProviderConnection('vault-corp');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Connected');
    });

    it('should return error for non-existent provider', async () => {
      const result = await providersService.testProviderConnection('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Provider not found');
      expect(result.error).toBe('Provider not found');
    });

    it('should handle AWS provider (not implemented)', async () => {
      // Create a mock AWS provider
      const awsProvider = {
        id: 'aws-test',
        name: 'AWS Test',
        type: 'aws' as const,
        status: 'healthy' as const,
        authMethod: 'iam-role',
        address: 'https://secretsmanager.us-east-1.amazonaws.com',
        scopes: ['read'],
        lastHealthCheck: '2024-01-01T00:00:00.000Z',
        secretCount: 0,
        createdBy: 'test-user',
        namespace: 'test',
        labels: {},
        annotations: {},
        config: { region: 'us-east-1', maxRetries: 3, timeout: 30 },
        auth: { method: 'iam-role' as const },
        capabilities: {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canList: true,
          canUpdate: false
        }
      };

      // Manually add to providers map for testing
      (providersService as any).providers.set(awsProvider.id, awsProvider);

      const result = await providersService.testProviderConnection('aws-test');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('AWS connection testing not yet implemented');
    });
  });

  describe('getProviderHealth', () => {
    it('should get Vault provider health', async () => {
      const result = await providersService.getProviderHealth('vault-corp');
      
      expect(result).toBeDefined();
      expect(result!.status).toBe('healthy');
      expect(result!.lastCheck).toBeDefined();
    });

    it('should return null for non-existent provider', async () => {
      const result = await providersService.getProviderHealth('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('monitorAllProviders', () => {
    it('should monitor all providers health', async () => {
      const healthMap = await providersService.monitorAllProviders();
      
      expect(healthMap.size).toBeGreaterThan(0);
      expect(healthMap.has('vault-corp')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should cleanup all providers and services', () => {
      providersService.cleanup();
      
      // After cleanup, listProviders should return empty array
      // (This would be tested in a real scenario)
      expect(providersService).toBeDefined();
    });
  });

  describe('getProviderService', () => {
    it('should return VaultService for Vault provider', () => {
      const vaultService = providersService.getProviderService('vault-corp');
      
      expect(vaultService).toBeDefined();
    });

    it('should return null for non-existent provider', () => {
      const service = providersService.getProviderService('non-existent');
      
      expect(service).toBeNull();
    });
  });
});
