import { api } from './api';
import { 
  SecretReference, 
  CreateSecretReferenceRequest, 
  UpdateSecretReferenceRequest, 
  SecretReferenceFilter, 
  SecretReferenceSearchResult 
} from '../types/secrets';
import { providersService } from './providers';
import VaultService from './providers/vault';

export class SecretsService {
  private references: Map<string, SecretReference> = new Map();

  constructor() {
    this.loadReferences();
  }

  // CRUD Operations
  async createReference(request: CreateSecretReferenceRequest): Promise<SecretReference | null> {
    try {
      // Validate provider exists and is accessible
      const provider = await providersService.getProvider(request.providerId);
      if (!provider) {
        throw new Error('Provider not found or not accessible');
      }

      // Validate the secret path exists in the provider
      const pathExists = await this.validateSecretPath(request.providerId, request.path);
      if (!pathExists) {
        throw new Error('Secret path not found in provider');
      }

      const response = await api.post('/secret-references', request);
      
      if (response.success && response.data) {
        const reference = response.data as SecretReference;
        this.references.set(reference.id, reference);
        return reference;
      }
      return null;
    } catch (error) {
      console.error('Failed to create secret reference:', error);
      throw error;
    }
  }

  async getReference(id: string): Promise<SecretReference | null> {
    try {
      // Check cache first
      if (this.references.has(id)) {
        return this.references.get(id)!;
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
    try {
      const response = await api.put(`/secret-references/${id}`, request);
      
      if (response.success && response.data) {
        const updatedReference = response.data as SecretReference;
        this.references.set(id, updatedReference);
        return updatedReference;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update secret reference ${id}:`, error);
      throw error;
    }
  }

  async deleteReference(id: string): Promise<boolean> {
    try {
      const response = await api.delete(`/secret-references/${id}`);
      
      if (response.success) {
        this.references.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete secret reference ${id}:`, error);
      throw error;
    }
  }

  async listReferences(filter?: SecretReferenceFilter): Promise<SecretReferenceSearchResult> {
    try {
      const params = this.buildFilterParams(filter);
      const response = await api.get('/secret-references', { params });
      
      if (response.success && response.data) {
        const result = response.data as SecretReferenceSearchResult;
        
        // Update cache
        result.references.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        return result;
      }
      
      return {
        references: [],
        total: 0,
        page: 1,
        perPage: 50,
        totalPages: 0,
        facets: {
          providers: [],
          categories: [],
          classifications: [],
          environments: [],
          teams: [],
          tags: []
        }
      };
    } catch (error) {
      console.error('Failed to list secret references:', error);
      throw error;
    }
  }

  // Search and Discovery
  async searchReferences(query: string, filter?: SecretReferenceFilter): Promise<SecretReferenceSearchResult> {
    try {
      const params = {
        q: query,
        ...this.buildFilterParams(filter)
      };
      
      const response = await api.get('/secret-references/search', { params });
      
      if (response.success && response.data) {
        const result = response.data as SecretReferenceSearchResult;
        
        // Update cache
        result.references.forEach(reference => {
          this.references.set(reference.id, reference);
        });
        
        return result;
      }
      
      return {
        references: [],
        total: 0,
        page: 1,
        perPage: 50,
        totalPages: 0,
        facets: {
          providers: [],
          categories: [],
          classifications: [],
          environments: [],
          teams: [],
          tags: []
        }
      };
    } catch (error) {
      console.error('Failed to search secret references:', error);
      throw error;
    }
  }

  async getReferencesByProvider(providerId: string, filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      const filterWithProvider = { ...filter, providerId };
      const result = await this.listReferences(filterWithProvider);
      return result.references;
    } catch (error) {
      console.error(`Failed to get references for provider ${providerId}:`, error);
      return [];
    }
  }

  async getReferencesByNamespace(namespace: string, filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      const filterWithNamespace = { ...filter, namespace };
      const result = await this.listReferences(filterWithNamespace);
      return result.references;
    } catch (error) {
      console.error(`Failed to get references for namespace ${namespace}:`, error);
      return [];
    }
  }

  async getReferencesByProject(project: string, filter?: SecretReferenceFilter): Promise<SecretReference[]> {
    try {
      const filterWithProject = { ...filter, project };
      const result = await this.listReferences(filterWithProject);
      return result.references;
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

  // Validation and Discovery
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
