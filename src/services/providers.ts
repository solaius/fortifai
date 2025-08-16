import { api } from './api';
import { 
  Provider, 
  VaultProvider, 
  AWSProvider, 
  AzureProvider, 
  ProviderCreateRequest, 
  ProviderUpdateRequest,
  ProviderHealth,
  ProviderTestResult,
  ProviderType
} from '../types/providers';
import VaultService from './providers/vault';

export class ProvidersService {
  private providers: Map<string, Provider> = new Map();
  private vaultServices: Map<string, VaultService> = new Map();

  constructor() {
    this.loadProviders();
  }

  // CRUD Operations
  async createProvider(request: ProviderCreateRequest): Promise<Provider | null> {
    try {
      const response = await api.post('/providers', request);
      
      if (response.success && response.data) {
        const provider = response.data as Provider;
        this.providers.set(provider.id, provider);
        
        // Initialize provider-specific service if needed
        if (provider.type === 'vault') {
          this.initializeVaultService(provider as VaultProvider);
        }
        
        return provider;
      }
      return null;
    } catch (error) {
      console.error('Failed to create provider:', error);
      return null;
    }
  }

  async getProvider(id: string): Promise<Provider | null> {
    try {
      // Check cache first
      if (this.providers.has(id)) {
        return this.providers.get(id)!;
      }

      const response = await api.get(`/providers/${id}`);
      
      if (response.success && response.data) {
        const provider = response.data as Provider;
        this.providers.set(provider.id, provider);
        return provider;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get provider ${id}:`, error);
      return null;
    }
  }

  async updateProvider(id: string, request: ProviderUpdateRequest): Promise<Provider | null> {
    try {
      const response = await api.put(`/providers/${id}`, request);
      
      if (response.success && response.data) {
        const updatedProvider = response.data as Provider;
        this.providers.set(id, updatedProvider);
        
        // Reinitialize provider service if config changed
        if (updatedProvider.type === 'vault') {
          this.initializeVaultService(updatedProvider as VaultProvider);
        }
        
        return updatedProvider;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update provider ${id}:`, error);
      return null;
    }
  }

  async deleteProvider(id: string): Promise<boolean> {
    try {
      const response = await api.delete(`/providers/${id}`);
      
      if (response.success) {
        this.providers.delete(id);
        this.vaultServices.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete provider ${id}:`, error);
      return false;
    }
  }

  async listProviders(): Promise<Provider[]> {
    try {
      const response = await api.get('/providers');
      
      if (response.success && response.data) {
        const providers = response.data as Provider[];
        
        // Update cache
        providers.forEach(provider => {
          this.providers.set(provider.id, provider);
          
          // Initialize provider services
          if (provider.type === 'vault') {
            this.initializeVaultService(provider as VaultProvider);
          }
        });
        
        return providers;
      }
      return [];
    } catch (error) {
      console.error('Failed to list providers:', error);
      return [];
    }
  }

  // Provider-specific operations
  async testProviderConnection(id: string): Promise<ProviderTestResult> {
    const provider = await this.getProvider(id);
    if (!provider) {
      return {
        success: false,
        message: 'Provider not found',
        error: 'Provider not found'
      };
    }

    try {
      switch (provider.type) {
        case 'vault':
          return await this.testVaultConnection(provider as VaultProvider);
        case 'aws':
          return await this.testAWSConnection(provider as AWSProvider);
        case 'azure':
          return await this.testAzureConnection(provider as AzureProvider);
        default:
          return {
            success: false,
            message: 'Unsupported provider type',
            error: `Provider type ${provider.type} not supported`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getProviderHealth(id: string): Promise<ProviderHealth | null> {
    const provider = await this.getProvider(id);
    if (!provider) {
      return null;
    }

    try {
      switch (provider.type) {
        case 'vault':
          return await this.getVaultHealth(provider as VaultProvider);
        case 'aws':
          return await this.getAWSHealth(provider as AWSProvider);
        case 'azure':
          return await this.getAzureHealth(provider as AzureProvider);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to get health for provider ${id}:`, error);
      return null;
    }
  }

  // Vault-specific operations
  private async testVaultConnection(provider: VaultProvider): Promise<ProviderTestResult> {
    const vaultService = this.vaultServices.get(provider.id);
    if (!vaultService) {
      return {
        success: false,
        message: 'Vault service not initialized',
        error: 'Service not initialized'
      };
    }

    // Authenticate with the provider
    const authSuccess = await this.authenticateVaultProvider(provider);
    if (!authSuccess) {
      return {
        success: false,
        message: 'Vault authentication failed',
        error: 'Invalid credentials or configuration'
      };
    }

    // Test connection
    return await vaultService.testConnection();
  }

  private async getVaultHealth(provider: VaultProvider): Promise<ProviderHealth | null> {
    const vaultService = this.vaultServices.get(provider.id);
    if (!vaultService) {
      return null;
    }

    return await vaultService.getHealth();
  }

  private async authenticateVaultProvider(provider: VaultProvider): Promise<boolean> {
    const vaultService = this.vaultServices.get(provider.id);
    if (!vaultService) {
      return false;
    }

    try {
      switch (provider.auth.method) {
        case 'approle':
          if (provider.auth.appRole) {
            return await vaultService.authenticateWithAppRole(
              provider.auth.appRole.roleId,
              provider.auth.appRole.secretId
            );
          }
          break;
        case 'kubernetes':
          if (provider.auth.kubernetes) {
            return await vaultService.authenticateWithKubernetes(
              provider.auth.kubernetes.role,
              provider.auth.kubernetes.jwt,
              provider.auth.kubernetes.mountPath
            );
          }
          break;
        case 'token':
          if (provider.auth.token) {
            return await vaultService.authenticateWithToken(provider.auth.token);
          }
          break;
      }
      return false;
    } catch (error) {
      console.error(`Vault authentication failed for provider ${provider.id}:`, error);
      return false;
    }
  }

  // AWS-specific operations
  private async testAWSConnection(provider: AWSProvider): Promise<ProviderTestResult> {
    // TODO: Implement AWS connection testing
    return {
      success: false,
      message: 'AWS connection testing not yet implemented',
      error: 'Not implemented'
    };
  }

  private async getAWSHealth(provider: AWSProvider): Promise<ProviderHealth | null> {
    // TODO: Implement AWS health checking
    return null;
  }

  // Azure-specific operations
  private async testAzureConnection(provider: AzureProvider): Promise<ProviderTestResult> {
    // TODO: Implement Azure connection testing
    return {
      success: false,
      message: 'Azure connection testing not yet implemented',
      error: 'Not implemented'
    };
  }

  private async getAzureHealth(provider: AzureProvider): Promise<ProviderHealth | null> {
    // TODO: Implement Azure health checking
    return null;
  }

  // Service initialization
  private initializeVaultService(provider: VaultProvider): void {
    const vaultService = new VaultService(provider.config);
    this.vaultServices.set(provider.id, vaultService);
  }

  // Utility methods
  private async loadProviders(): Promise<void> {
    try {
      await this.listProviders();
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  }

  getProviderService(id: string): VaultService | null {
    return this.vaultServices.get(id) || null;
  }

  // Health monitoring
  async monitorAllProviders(): Promise<Map<string, ProviderHealth>> {
    const healthMap = new Map<string, ProviderHealth>();
    
    for (const [id, provider] of this.providers) {
      const health = await this.getProviderHealth(id);
      if (health) {
        healthMap.set(id, health);
      }
    }
    
    return healthMap;
  }

  // Cleanup
  cleanup(): void {
    this.vaultServices.forEach(service => {
      service.logout();
    });
    this.vaultServices.clear();
    this.providers.clear();
  }
}

// Export singleton instance
export const providersService = new ProvidersService();
export default providersService;
