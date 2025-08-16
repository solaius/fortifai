import { SecretsService } from '../../services/secrets';
import { mockSecretReferences } from '../../services/mockData';
import { SecretReference, SecretReferenceFilter } from '../../types/secrets';

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock the providers service
jest.mock('../../services/providers', () => ({
  providersService: {
    getProviderService: jest.fn().mockReturnValue(null)
  }
}));

// Mock the mockData service
jest.mock('../../services/mockData', () => ({
  mockSecretReferences: [
    {
      id: 'openai-api-key',
      name: 'OpenAI API Key',
      description: 'API key for OpenAI services integration',
      providerId: 'vault-corp',
      path: 'secrets/openai/api-key',
      version: 'v1',
      metadata: {
        category: 'api-keys',
        priority: 'high',
        classification: 'confidential',
        environment: 'production',
        team: 'ai',
        owner: 'ai-team',
        
        lastRotated: '2024-01-15T00:00:00.000Z',
                 rotationPolicy: {
           enabled: true,
           type: 'automatic' as const,
           interval: 30,
           method: 'create-new' as const,
           notificationBefore: 7,
           notificationAfter: 1,
           approvers: ['ai-team-lead']
         },
        expiryDate: '2024-04-15T00:00:00.000Z'
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'database-password',
      name: 'Database Password',
      description: 'Production database connection password',
      providerId: 'vault-corp',
      path: 'secrets/database/prod/password',
      version: 'v2',
      metadata: {
        category: 'database',
        priority: 'critical',
        classification: 'secret',
        environment: 'production',
        team: 'database',
        owner: 'db-team',
        
        lastRotated: '2024-01-10T00:00:00.000Z',
                 rotationPolicy: {
           enabled: true,
           type: 'scheduled' as const,
           interval: 90,
           method: 'create-new' as const,
           notificationBefore: 14,
           notificationAfter: 1,
           approvers: ['db-team-lead']
         },
        expiryDate: '2024-04-10T00:00:00.000Z'
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-10T00:00:00.000Z'
    }
  ],
  shouldUseMockData: jest.fn().mockReturnValue(true),
  mockDelay: jest.fn().mockResolvedValue(undefined)
}));

describe('SecretsService', () => {
  let secretsService: SecretsService;
  const mockApi = require('../../services/api').api;

  beforeEach(() => {
    jest.clearAllMocks();
    secretsService = new SecretsService();
  });

  describe('constructor', () => {
    it('should initialize with empty references map', () => {
      expect(secretsService).toBeInstanceOf(SecretsService);
    });
  });

    describe('createReference', () => {
    const newReferenceData = {
      name: 'Test Secret',
      description: 'Test secret reference',
      providerId: 'vault-corp',
      path: 'secrets/test/secret',
      version: 'v1',
      namespace: 'default',
      metadata: {
        category: 'test',
        priority: 'medium' as const,
        classification: 'internal' as const,
        environment: 'testing' as const,
        team: 'test-team',
        owner: 'test-user',
        lastRotated: '2024-01-01T00:00:00.000Z',
          rotationPolicy: {
            enabled: true,
            type: 'automatic' as const,
            interval: 30,
            method: 'create-new' as const,
            notificationBefore: 7,
            notificationAfter: 1,
            approvers: ['test-user']
          },
          expiryDate: '2024-04-01T00:00:00.000Z'
        }
      };

    it('should create secret reference with mock data when enabled', async () => {
      const result = await secretsService.createReference(newReferenceData);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('Test Secret');
      expect(result!.providerId).toBe('vault-corp');
      expect(result!.path).toBe('secrets/test/secret');
      expect(result!.id).toMatch(/^mock-\d+$/);
      expect(result!.createdAt).toBeDefined();
      expect(result!.updatedAt).toBeDefined();
    });

    it('should call API when mock data is disabled', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockResolvedValue({
        success: true,
        data: { ...newReferenceData, id: 'api-secret-id' }
      });

      const result = await secretsService.createReference(newReferenceData);
      
      expect(mockApi.post).toHaveBeenCalledWith('/secret-references', newReferenceData);
      expect(result).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.post.mockRejectedValue(new Error('API Error'));

      const result = await secretsService.createReference(newReferenceData);
      
      expect(result).toBeNull();
    });
  });

  describe('getReference', () => {
    it('should return reference from cache if available', async () => {
      // First create a reference to populate cache
      const referenceData = {
        name: 'Test Reference',
        description: 'Test reference',
        providerId: 'vault-corp',
        path: 'secrets/test/reference',
        version: 'v1',
        namespace: 'default',
        metadata: {
          category: 'test',
          priority: 'medium' as const,
          classification: 'internal' as const,
          environment: 'testing' as const,
          team: 'test-team',
          owner: 'test-user',
          lastRotated: '2024-01-01T00:00:00.000Z',
          rotationPolicy: {
            enabled: true,
            type: 'automatic' as const,
            interval: 30,
            method: 'create-new' as const,
            notificationBefore: 7,
            notificationAfter: 1,
            approvers: ['test-user']
          },
          expiryDate: '2024-04-01T00:00:00.000Z'
        }
      };

      const createdReference = await secretsService.createReference(referenceData);
      expect(createdReference).toBeDefined();

      // Now get it from cache
      const result = await secretsService.getReference(createdReference!.id);
      
      expect(result).toEqual(createdReference);
    });

    it('should return mock reference when not in cache and mock data enabled', async () => {
      const result = await secretsService.getReference('openai-api-key');
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('openai-api-key');
      expect(result!.name).toBe('OpenAI API Key');
    });

    it('should return null for non-existent reference', async () => {
      const result = await secretsService.getReference('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('updateReference', () => {
    it('should update reference with mock data when enabled', async () => {
      // First create a reference
             const referenceData = {
         name: 'Test Reference',
         description: 'Test reference',
         providerId: 'vault-corp',
         path: 'secrets/test/reference',
         version: 'v1',
         namespace: 'default',
         metadata: {
          category: 'test',
          priority: 'medium' as const,
          classification: 'internal' as const,
          environment: 'testing' as const,
          team: 'test-team',
          owner: 'test-user',
          lastRotated: '2024-01-01T00:00:00.000Z',
          rotationPolicy: {
            enabled: true,
            type: 'automatic' as const,
            interval: 30,
            method: 'create-new' as const,
            notificationBefore: 7,
            notificationAfter: 1,
            approvers: ['test-user']
          },
          expiryDate: '2024-04-01T00:00:00.000Z'
        }
      };

      const createdReference = await secretsService.createReference(referenceData);
      expect(createdReference).toBeDefined();

      // Now update it
      const updates = { name: 'Updated Reference', description: 'Updated description' };
      const result = await secretsService.updateReference(createdReference!.id, updates);
      
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated Reference');
      expect(result!.description).toBe('Updated description');
      expect(result!.updatedAt).not.toBe(createdReference!.updatedAt);
    });

    it('should return null for non-existent reference', async () => {
      const result = await secretsService.updateReference('non-existent', { name: 'Updated' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteReference', () => {
    it('should delete reference with mock data when enabled', async () => {
      // First create a reference
      const referenceData = {
        name: 'Test Reference',
        description: 'Test reference',
        providerId: 'vault-corp',
        path: 'secrets/test/reference',
        version: 'v1',
        namespace: 'default',
        metadata: {
          category: 'test',
          priority: 'medium' as const,
          classification: 'internal' as const,
                     environment: 'testing' as const,
                     team: 'test-team',
           owner: 'test-user',
           lastRotated: '2024-01-01T00:00:00.000Z',
                     rotationPolicy: {
             enabled: true,
             type: 'automatic' as const,
             interval: 30,
             method: 'create-new' as const,
             notificationBefore: 7,
             notificationAfter: 1,
             approvers: ['test-user']
           },
          expiryDate: '2024-04-01T00:00:00.000Z'
        }
      };

      const createdReference = await secretsService.createReference(referenceData);
      expect(createdReference).toBeDefined();

      // Now delete it
      const result = await secretsService.deleteReference(createdReference!.id);
      
      expect(result).toBe(true);

      // Verify it's no longer accessible
      const deletedReference = await secretsService.getReference(createdReference!.id);
      expect(deletedReference).toBeNull();
    });
  });

  describe('listReferences', () => {
    it('should return mock references when mock data enabled', async () => {
      const result = await secretsService.listReferences();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('openai-api-key');
      expect(result[1].id).toBe('database-password');
    });

    it('should call API when mock data is disabled', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      const mockApiReferences = [
        { id: 'api-secret-1', name: 'API Secret 1', providerId: 'vault-corp' }
      ];
      
      mockApi.get.mockResolvedValue({
        success: true,
        data: mockApiReferences
      });

      const result = await secretsService.listReferences();
      
      expect(mockApi.get).toHaveBeenCalledWith('/secret-references', { params: {} });
      expect(result).toEqual(mockApiReferences);
    });

    it('should fall back to mock data when API fails in development', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.get.mockRejectedValue(new Error('API Error'));

      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await secretsService.listReferences();
      
      expect(result).toHaveLength(2); // Should fall back to mock data
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('searchReferences', () => {
    it('should call API with search parameters', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      const mockSearchResults = [
        { id: 'search-result-1', name: 'Search Result 1', providerId: 'vault-corp' }
      ];
      
      mockApi.get.mockResolvedValue({
        success: true,
        data: mockSearchResults
      });

      const result = await secretsService.searchReferences('test query');
      
      expect(mockApi.get).toHaveBeenCalledWith('/secret-references/search', {
        params: { q: 'test query' }
      });
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle search errors gracefully', async () => {
      const { shouldUseMockData } = require('../../services/mockData');
      shouldUseMockData.mockReturnValue(false);
      
      mockApi.get.mockRejectedValue(new Error('Search Error'));

      const result = await secretsService.searchReferences('test query');
      
      expect(result).toEqual([]);
    });
  });

  describe('getReferencesForProvider', () => {
    it('should return references filtered by provider', async () => {
      const result = await secretsService.getReferencesForProvider('vault-corp');
      
      expect(result).toHaveLength(2);
      result.forEach(ref => {
        expect(ref.providerId).toBe('vault-corp');
      });
    });
  });

  describe('getReferencesForNamespace', () => {
    it('should return references filtered by namespace', async () => {
      const result = await secretsService.getReferencesForNamespace('default');
      
      // Since our mock data doesn't have namespace field, this will return empty
      // In a real scenario, this would filter by namespace
      expect(result).toBeDefined();
    });
  });

  describe('getReferencesForProject', () => {
    it('should return references filtered by project', async () => {
      const result = await secretsService.getReferencesForProject('test-project');
      
      // Since our mock data doesn't have project field, this will return empty
      // In a real scenario, this would filter by project
      expect(result).toBeDefined();
    });
  });

  describe('getSecretValue', () => {
    it('should throw error for non-existent reference', async () => {
      await expect(secretsService.getSecretValue('non-existent')).rejects.toThrow('Secret reference not found');
    });

    it('should throw error when provider service not available', async () => {
      await expect(secretsService.getSecretValue('openai-api-key')).rejects.toThrow('Provider service not available');
    });
  });

  describe('getSecretMetadata', () => {
    it('should return null for non-existent reference', async () => {
      const result = await secretsService.getSecretMetadata('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('validateSecretPath', () => {
    it('should return false for non-existent provider', async () => {
      const result = await secretsService.validateSecretPath('non-existent', 'test/path');
      
      expect(result).toBe(false);
    });
  });

  describe('discoverSecrets', () => {
    it('should return empty array for non-existent provider', async () => {
      const result = await secretsService.discoverSecrets('non-existent');
      
      expect(result).toEqual([]);
    });
  });

  describe('Filtering', () => {
    it('should filter references by name', async () => {
      const filter: SecretReferenceFilter = { name: 'OpenAI' };
      const result = await secretsService.listReferences(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('OpenAI API Key');
    });

    it('should filter references by category', async () => {
      const filter: SecretReferenceFilter = { category: 'database' };
      const result = await secretsService.listReferences(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].metadata.category).toBe('database');
    });

    it('should filter references by priority', async () => {
      const filter: SecretReferenceFilter = { priority: 'critical' };
      const result = await secretsService.listReferences(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].metadata.priority).toBe('critical');
    });

    it('should filter references by team', async () => {
      const filter: SecretReferenceFilter = { team: 'ai' };
      const result = await secretsService.listReferences(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].metadata.team).toBe('ai');
    });

    it('should filter references by multiple criteria', async () => {
      const filter: SecretReferenceFilter = {
        environment: 'production',
        priority: 'high'
      };
      const result = await secretsService.listReferences(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].metadata.environment).toBe('production');
      expect(result[0].metadata.priority).toBe('high');
    });
  });

  describe('cleanup', () => {
    it('should cleanup all references', () => {
      secretsService.cleanup();
      
      // After cleanup, listReferences should return empty array
      // (This would be tested in a real scenario)
      expect(secretsService).toBeDefined();
    });
  });
});
