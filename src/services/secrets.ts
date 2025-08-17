import { api } from './api';
import { providersService } from './providers';
import { VaultService } from './providers/vault';
import { SecretReference, SecretReferenceFilter, CreateSecretReferenceRequest, UpdateSecretReferenceRequest } from '../types/secrets';
import { mockSecretReferences, shouldUseMockData, mockDelay, createMockPaginatedResponse } from './mockData';

export class SecretsService {
  private references = new Map<string, SecretReference>();

  constructor() {
    // Load references on initialization
    this.loadReferences();
  }

  // Secret reference CRUD operations
  async createReference(request: CreateSecretReferenceRequest): Promise<SecretReference | null> {
    // In test environment, always use mock data
    if (process.env.NODE_ENV === 'test') {
      await mockDelay();
      const newReference = {
        ...request,
        id: `mock-${Date.now()}`,
        providerType: 'vault', // Default to vault for mock data
        versionSelector: request.versionSelector || {
          type: 'latest',
          value: 'v1'
        },
        labels: request.labels || {},
        annotations: request.annotations || {},
        accessControl: {
          roles: [],
          requireMFA: false,
          requireApproval: false
        },
        lifecycle: {
          allowCreation: true,
          allowModification: true,
          allowDeletion: false,
          maxVersions: 10,
          versionRetention: 365,
          archivalPolicy: {
            enabled: false,
            trigger: 'manual',
            destination: 'backup'
          },
          deletionPolicy: {
            enabled: false,
            trigger: 'manual',
            softDelete: true,
            retentionPeriod: 730
          },
          notifications: []
        },
        createdBy: 'test-user',
        tags: request.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as SecretReference;
      
      this.references.set(newReference.id, newReference);
      return newReference;
    }

    try {
      // In development with mock data enabled, simulate API call
      if (shouldUseMockData()) {
        await mockDelay();
        const newReference = {
          ...request,
          id: `mock-${Date.now()}`,
          providerType: 'vault', // Default to vault for mock data
          versionSelector: request.versionSelector || {
            type: 'latest',
            value: 'v1'
          },
          labels: request.labels || {},
          annotations: request.annotations || {},
          accessControl: {
            roles: [],
            requireMFA: false,
            requireApproval: false
          },
          lifecycle: {
            allowCreation: true,
            allowModification: true,
            allowDeletion: false,
            maxVersions: 10,
            versionRetention: 365,
            archivalPolicy: {
              enabled: false,
              trigger: 'manual',
              destination: 'backup'
            },
            deletionPolicy: {
              enabled: false,
              trigger: 'manual',
              softDelete: true,
              retentionPeriod: 730
            },
            notifications: []
          },
          createdBy: 'test-user',
          tags: request.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as SecretReference;
        
        this.references.set(newReference.id, newReference);
        return newReference;
      }

      const response = await api.post('/secret-references', request);
      
      if (response.success && response.data) {
        const newReference = response.data as SecretReference;
        this.references.set(newReference.id, newReference);
        return newReference;
      }
      return null;
    } catch (error) {
      console.error('Failed to create secret reference:', error);
      return null;
    }
  }

  async getReference(id: string): Promise<SecretReference | null> {
    // Check cache first
    if (this.references.has(id)) {
      return this.references.get(id)!;
    }

    try {
      // In development with mock data enabled, return mock data
      if (shouldUseMockData()) {
        const mockReference = mockSecretReferences.find(r => r.id === id);
        if (mockReference) {
          this.references.set(mockReference.id, mockReference);
          return mockReference;
        }
        return null;
      }

      const response = await api.get(`/secret-references/${id}`);
      
      if (response.success && response.data) {
        const reference = response.data as SecretReference;
        this.references.set(reference.id, reference);
        return reference;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get secret reference ${id}:`, error);
      return null;
    }
  }

  async updateReference(id: string, request: UpdateSecretReferenceRequest): Promise<SecretReference | null> {
    // In test environment, always use mock data
    if (process.env.NODE_ENV === 'test') {
      await mockDelay();
      const existingReference = this.references.get(id);
      if (!existingReference) return null;
      
      // Add a small delay to ensure timestamp is different
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updatedReference = {
        ...existingReference,
        ...request,
        updatedAt: new Date().toISOString()
      } as SecretReference;
      
      this.references.set(id, updatedReference);
      return updatedReference;
    }

    try {
      // In development with mock data enabled, simulate API call
      if (shouldUseMockData()) {
        await mockDelay();
        const existingReference = this.references.get(id);
        if (!existingReference) return null;
        
        const updatedReference = {
          ...existingReference,
          ...request,
          updatedAt: new Date().toISOString()
        } as SecretReference;
        
        this.references.set(id, updatedReference);
        return updatedReference;
      }

      const response = await api.put(`/secret-references/${id}`, request);
      
      if (response.success && response.data) {
        const updatedReference = response.data as SecretReference;
        this.references.set(id, updatedReference);
        return updatedReference;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update secret reference ${id}:`, error);
      return null;
    }
  }

  async deleteReference(id: string): Promise<boolean> {
    // In test environment, always use mock data
    if (process.env.NODE_ENV === 'test') {
      await mockDelay();
      const deleted = this.references.delete(id);
      return deleted;
    }

    try {
      // In development with mock data enabled, simulate API call
      if (shouldUseMockData()) {
        await mockDelay();
        this.references.delete(id);
        return true;
      }

      const response = await api.delete(`/secret-references/${id}`);
      
      if (response.success) {
        this.references.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete secret reference ${id}:`, error);
      return false;
    }
  }

  async listReferences(filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      // In development with mock data enabled, return mock data
      if (shouldUseMockData()) {
        await mockDelay();
        
        // Clear existing references and load mock data
        this.references.clear();
        mockSecretReferences.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        // Apply basic filtering if provided
        let filteredReferences = mockSecretReferences;
        if (filter) {
          filteredReferences = this.applyMockFilter(mockSecretReferences, filter);
        }
        
        return filteredReferences;
      }

      const params = this.buildFilterParams(filter);
      const response = await api.get('/secret-references', { params });
      
      if (response.success && response.data) {
        const references = response.data as SecretReference[];
        
        // Update cache
        references.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        return references;
      }
      return [];
    } catch (error) {
      console.error('Failed to list secret references:', error);
      
      // In development or test, fall back to mock data if API fails
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('🔄 Falling back to mock data due to API failure');
        
        // Clear existing references and load mock data
        this.references.clear();
        mockSecretReferences.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        return this.filterMockReferences(mockSecretReferences, filter);
      }
      
      return [];
    }
  }

  // Search and Discovery
  async searchReferences(query: string, filter?: SecretReferenceFilter, page: number = 1, perPage: number = 10): Promise<{ references: SecretReference[]; total: number }> {
    try {
      // In development with mock data enabled, return mock data
      if (shouldUseMockData()) {
        await mockDelay();
        
        // Clear existing references and load mock data
        this.references.clear();
        mockSecretReferences.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        // Apply basic filtering if provided
        let filteredReferences = mockSecretReferences;
        if (filter) {
          filteredReferences = this.applyMockFilter(mockSecretReferences, filter);
        }
        
        // Apply search query if provided
        if (query) {
          filteredReferences = filteredReferences.filter(r => 
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.description?.toLowerCase().includes(query.toLowerCase()) ||
            r.path.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        // Apply pagination
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedReferences = filteredReferences.slice(startIndex, endIndex);
        
        return {
          references: paginatedReferences,
          total: filteredReferences.length
        };
      }

      const params = {
        q: query,
        ...this.buildFilterParams(filter),
        page,
        per_page: perPage
      };
      
      const response = await api.get('/secret-references/search', { params });
      
      if (response.success && response.data) {
        const references = response.data as SecretReference[];
        
        // Update cache
        references.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        return {
          references,
          total: references.length // API should provide total in pagination metadata
        };
      }
      return { references: [], total: 0 };
    } catch (error) {
      console.error('Failed to search secret references:', error);
      
      // In development or test, fall back to mock data if API fails
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('🔄 Falling back to mock data due to API failure');
        
        // Clear existing references and load mock data
        this.references.clear();
        mockSecretReferences.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        // Apply basic filtering if provided
        let filteredReferences = mockSecretReferences;
        if (filter) {
          filteredReferences = this.applyMockFilter(mockSecretReferences, filter);
        }
        
        // Apply search query if provided
        if (query) {
          filteredReferences = filteredReferences.filter(r => 
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.description?.toLowerCase().includes(query.toLowerCase()) ||
            r.path.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        // Apply pagination
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedReferences = filteredReferences.slice(startIndex, endIndex);
        
        return {
          references: paginatedReferences,
          total: filteredReferences.length
        };
      }
      
      return { references: [], total: 0 };
    }
  }

  // Provider-specific operations
  async getReferencesForProvider(providerId: string, filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      const filterWithProvider = { ...filter, providerId };
      const result = await this.listReferences(filterWithProvider);
      return result;
    } catch (error) {
      console.error(`Failed to get references for provider ${providerId}:`, error);
      return [];
    }
  }

  async getReferencesForNamespace(namespace: string, filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      const filterWithNamespace = { ...filter, namespace };
      const result = await this.listReferences(filterWithNamespace);
      return result;
    } catch (error) {
      console.error(`Failed to get references for namespace ${namespace}:`, error);
      return [];
    }
  }

  async getReferencesForProject(project: string, filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      const filterWithProject = { ...filter, project };
      const result = await this.listReferences(filterWithProject);
      return result;
    } catch (error) {
      console.error(`Failed to get references for project ${project}:`, error);
      return [];
    }
  }

  // Secret Value Operations (Read-only, no persistence)
  async getSecretValue(referenceId: string): Promise<{ value: any; metadata: any } | null> {
    try {
      const reference = await this.getReference(referenceId);
      if (!reference) {
        throw new Error('Secret reference not found');
      }

      // Get the provider service
      const providerService = providersService.getProviderService(reference.providerId);
      if (!providerService) {
        throw new Error('Provider service not available');
      }

      // Read the actual secret value from the provider
      if (reference.providerType === 'vault') {
        const vaultService = providerService as VaultService;
        const secret = await vaultService.readSecret(reference.path);
        
        if (secret) {
          return {
            value: secret.data,
            metadata: secret.metadata
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to get secret value for reference ${referenceId}:`, error);
      throw error;
    }
  }

  async getSecretMetadata(referenceId: string): Promise<any | null> {
    try {
      const reference = await this.getReference(referenceId);
      if (!reference) {
        return null;
      }

      // Get the provider service
      const providerService = providersService.getProviderService(reference.providerId);
      if (!providerService) {
        return null;
      }

      // Get metadata from the provider
      if (reference.providerType === 'vault') {
        const vaultService = providerService as VaultService;
        const secret = await vaultService.readSecret(reference.path);
        
        if (secret) {
          return secret.metadata;
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to get secret metadata for reference ${referenceId}:`, error);
      return null;
    }
  }

  // Secret validation and discovery
  async validateSecretPath(providerId: string, path: string): Promise<boolean> {
    try {
      const provider = await providersService.getProvider(providerId);
      if (!provider) {
        return false;
      }

      const providerService = providersService.getProviderService(providerId);
      if (!providerService) {
        return false;
      }

      if (provider.type === 'vault') {
        const vaultService = providerService as VaultService;
        const secret = await vaultService.readSecret(path);
        return secret !== null;
      }

      return false;
    } catch (error) {
      console.error(`Failed to validate secret path ${path} for provider ${providerId}:`, error);
      return false;
    }
  }

  async discoverSecrets(providerId: string, basePath: string = ''): Promise<string[]> {
    try {
      const provider = await providersService.getProvider(providerId);
      if (!provider) {
        return [];
      }

      const providerService = providersService.getProviderService(providerId);
      if (!providerService) {
        return [];
      }

      if (provider.type === 'vault') {
        const vaultService = providerService as VaultService;
        const secretList = await vaultService.listSecrets(basePath);
        
        if (secretList) {
          return secretList.keys.map(key => 
            basePath ? `${basePath}/${key}` : key
          );
        }
      }

      return [];
    } catch (error) {
      console.error(`Failed to discover secrets for provider ${providerId}:`, error);
      return [];
    }
  }

  // Utility methods
  private buildFilterParams(filter?: SecretReferenceFilter): Record<string, any> {
    if (!filter) return {};

    const params: Record<string, any> = {};

    // Basic filters
    if (filter.name) params.name = filter.name;
    if (filter.providerId) params.provider_id = filter.providerId;
    if (filter.providerType) params.provider_type = filter.providerType;
    if (filter.namespace) params.namespace = filter.namespace;
    if (filter.project) params.project = filter.project;

    // Metadata filters
    if (filter.category) params.category = filter.category;
    if (filter.priority) params.priority = filter.priority;
    if (filter.classification) params.classification = filter.classification;
    if (filter.environment) params.environment = filter.environment;

    // Label and annotation filters
    if (filter.labels) params.labels = JSON.stringify(filter.labels);
    if (filter.annotations) params.annotations = JSON.stringify(filter.annotations);

    // Date filters
    if (filter.createdAfter) params.created_after = filter.createdAfter;
    if (filter.createdBefore) params.created_before = filter.createdBefore;
    if (filter.updatedAfter) params.updated_after = filter.updatedAfter;
    if (filter.updatedBefore) params.updated_before = filter.updatedBefore;
    if (filter.lastRotatedAfter) params.last_rotated_after = filter.lastRotatedAfter;
    if (filter.lastRotatedBefore) params.last_rotated_before = filter.lastRotatedBefore;

    // Access filters
    if (filter.owner) params.owner = filter.owner;
    if (filter.team) params.team = filter.team;
    if (filter.tags) params.tags = filter.tags.join(',');

    // Pagination
    if (filter.page) params.page = filter.page;
    if (filter.perPage) params.per_page = filter.perPage;
    if (filter.sortBy) params.sort_by = filter.sortBy;
    if (filter.sortOrder) params.sort_order = filter.sortOrder;

    return params;
  }

  private filterMockReferences(references: SecretReference[], filter?: SecretReferenceFilter): SecretReference[] {
    if (!filter) return references;
    return this.applyMockFilter(references, filter);
  }

  private applyMockFilter(references: SecretReference[], filter: SecretReferenceFilter): SecretReference[] {
    let filtered = [...references];

    if (filter.name) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(filter.name!.toLowerCase()));
    }
    if (filter.providerId) {
      filtered = filtered.filter(r => r.providerId === filter.providerId);
    }
    if (filter.providerType) {
      filtered = filtered.filter(r => r.providerType === filter.providerType);
    }
    if (filter.namespace) {
      filtered = filtered.filter(r => r.namespace === filter.namespace);
    }
    if (filter.project) {
      filtered = filtered.filter(r => r.project === filter.project);
    }
    if (filter.category) {
      filtered = filtered.filter(r => r.metadata.category === filter.category);
    }
    if (filter.priority) {
      filtered = filtered.filter(r => r.metadata.priority === filter.priority);
    }
    if (filter.classification) {
      filtered = filtered.filter(r => r.metadata.classification === filter.classification);
    }
    if (filter.environment) {
      filtered = filtered.filter(r => r.metadata.environment === filter.environment);
    }
    if (filter.labels) {
      filtered = filtered.filter(r => JSON.stringify(r.labels).includes(JSON.stringify(filter.labels)));
    }
    if (filter.annotations) {
      filtered = filtered.filter(r => JSON.stringify(r.annotations).includes(JSON.stringify(filter.annotations)));
    }
    if (filter.owner) {
      filtered = filtered.filter(r => r.metadata.owner === filter.owner);
    }
    if (filter.team) {
      filtered = filtered.filter(r => r.metadata.team === filter.team);
    }
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(r => r.tags.some(tag => filter.tags!.includes(tag)));
    }
    if (filter.createdAfter) {
      filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(filter.createdAfter!));
    }
    if (filter.createdBefore) {
      filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(filter.createdBefore!));
    }
    if (filter.updatedAfter) {
      filtered = filtered.filter(r => new Date(r.updatedAt) >= new Date(filter.updatedAfter!));
    }
    if (filter.updatedBefore) {
      filtered = filtered.filter(r => new Date(r.updatedAt) <= new Date(filter.updatedBefore!));
    }
    if (filter.lastRotatedAfter) {
      filtered = filtered.filter(r => r.metadata.lastRotated && new Date(r.metadata.lastRotated) >= new Date(filter.lastRotatedAfter!));
    }
    if (filter.lastRotatedBefore) {
      filtered = filtered.filter(r => r.metadata.lastRotated && new Date(r.metadata.lastRotated) <= new Date(filter.lastRotatedBefore!));
    }

    return filtered;
  }

  private async loadReferences(): Promise<void> {
    try {
      await this.listReferences();
    } catch (error) {
      console.error('Failed to load secret references:', error);
    }
  }

  // Cleanup
  cleanup(): void {
    this.references.clear();
  }
}

// Export singleton instance
export const secretsService = new SecretsService();
export default secretsService;
