import { api, ApiResponse, PaginatedResponse } from './api';

export interface Provider {
  id: string;
  name: string;
  type: 'vault' | 'aws' | 'azure';
  status: 'healthy' | 'warning' | 'critical' | 'disconnected';
  authMethod: string;
  address: string;
  scopes: string[];
  lastHealthCheck: string;
  secretCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateProviderRequest {
  name: string;
  type: 'vault' | 'aws' | 'azure';
  authMethod: string;
  address: string;
  scopes: string[];
  config: Record<string, any>;
}

export interface UpdateProviderRequest {
  name?: string;
  authMethod?: string;
  address?: string;
  scopes?: string[];
  config?: Record<string, any>;
}

export interface ProviderHealth {
  status: 'healthy' | 'warning' | 'critical' | 'disconnected';
  lastCheck: string;
  responseTime: number;
  error?: string;
}

export interface ProviderSecret {
  id: string;
  name: string;
  path: string;
  version: string;
  lastRotated: string;
  labels: Record<string, string>;
  metadata: Record<string, any>;
}

export class ProvidersService {
  private static readonly BASE_URL = '/providers';

  // Get all providers
  static async getProviders(
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<Provider>> {
    return api.getPaginated<Provider>(this.BASE_URL, page, perPage);
  }

  // Get provider by ID
  static async getProvider(id: string): Promise<ApiResponse<Provider>> {
    return api.get<Provider>(`${this.BASE_URL}/${id}`);
  }

  // Create new provider
  static async createProvider(data: CreateProviderRequest): Promise<ApiResponse<Provider>> {
    return api.post<Provider>(this.BASE_URL, data);
  }

  // Update provider
  static async updateProvider(id: string, data: UpdateProviderRequest): Promise<ApiResponse<Provider>> {
    return api.put<Provider>(`${this.BASE_URL}/${id}`, data);
  }

  // Delete provider
  static async deleteProvider(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // Test provider connection
  static async testConnection(id: string): Promise<ApiResponse<ProviderHealth>> {
    return api.post<ProviderHealth>(`${this.BASE_URL}/${id}/test`);
  }

  // Get provider health
  static async getProviderHealth(id: string): Promise<ApiResponse<ProviderHealth>> {
    return api.get<ProviderHealth>(`${this.BASE_URL}/${id}/health`);
  }

  // List secrets from provider
  static async listProviderSecrets(
    id: string,
    path?: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<ProviderSecret>> {
    const params = path ? { path } : {};
    return api.getPaginated<ProviderSecret>(
      `${this.BASE_URL}/${id}/secrets`,
      page,
      perPage,
      { params }
    );
  }

  // Get provider statistics
  static async getProviderStats(id: string): Promise<ApiResponse<{
    totalSecrets: number;
    activeSecrets: number;
    lastSync: string;
    syncStatus: 'success' | 'failed' | 'in_progress';
  }>> {
    return api.get(`${this.BASE_URL}/${id}/stats`);
  }

  // Sync provider secrets
  static async syncProviderSecrets(id: string): Promise<ApiResponse<{
    syncedCount: number;
    errors: string[];
  }>> {
    return api.post(`${this.BASE_URL}/${id}/sync`);
  }

  // Get provider types
  static async getProviderTypes(): Promise<ApiResponse<{
    types: Array<{
      type: string;
      name: string;
      description: string;
      authMethods: string[];
      features: string[];
    }>;
  }>> {
    return api.get(`${this.BASE_URL}/types`);
  }

  // Get auth methods for provider type
  static async getAuthMethods(providerType: string): Promise<ApiResponse<{
    authMethods: Array<{
      method: string;
      name: string;
      description: string;
      configSchema: Record<string, any>;
    }>;
  }>> {
    return api.get(`${this.BASE_URL}/types/${providerType}/auth-methods`);
  }

  // Validate provider configuration
  static async validateConfig(
    type: string,
    authMethod: string,
    config: Record<string, any>
  ): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    return api.post(`${this.BASE_URL}/validate-config`, {
      type,
      authMethod,
      config,
    });
  }
}

export default ProvidersService;
