import { api, ApiResponse, PaginatedResponse } from './api';

export interface SecretReference {
  id: string;
  name: string;
  path: string;
  providerId: string;
  providerName: string;
  providerType: 'vault' | 'aws' | 'azure';
  version: string;
  labels: Record<string, string>;
  status: 'active' | 'inactive' | 'expired';
  lastRotated: string;
  bindings: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateSecretReferenceRequest {
  name: string;
  path: string;
  providerId: string;
  version?: string;
  labels?: Record<string, string>;
}

export interface UpdateSecretReferenceRequest {
  name?: string;
  version?: string;
  labels?: Record<string, string>;
}

export interface SecretMetadata {
  id: string;
  name: string;
  path: string;
  version: string;
  lastRotated: string;
  labels: Record<string, string>;
  metadata: Record<string, any>;
  tags: string[];
  description?: string;
  owner?: string;
}

export interface SecretVersion {
  version: string;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, any>;
}

export class SecretsService {
  private static readonly BASE_URL = '/secrets';

  // Get all secret references
  static async getSecretReferences(
    page: number = 1,
    perPage: number = 50,
    filters?: {
      providerId?: string;
      status?: string;
      labels?: Record<string, string>;
    }
  ): Promise<PaginatedResponse<SecretReference>> {
    const params = filters ? { ...filters } : {};
    return api.getPaginated<SecretReference>(this.BASE_URL, page, perPage, { params });
  }

  // Get secret reference by ID
  static async getSecretReference(id: string): Promise<ApiResponse<SecretReference>> {
    return api.get<SecretReference>(`${this.BASE_URL}/${id}`);
  }

  // Create new secret reference
  static async createSecretReference(data: CreateSecretReferenceRequest): Promise<ApiResponse<SecretReference>> {
    return api.post<SecretReference>(this.BASE_URL, data);
  }

  // Update secret reference
  static async updateSecretReference(id: string, data: UpdateSecretReferenceRequest): Promise<ApiResponse<SecretReference>> {
    return api.put<SecretReference>(`${this.BASE_URL}/${id}`, data);
  }

  // Delete secret reference
  static async deleteSecretReference(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // Get secret metadata (without value)
  static async getSecretMetadata(id: string): Promise<ApiResponse<SecretMetadata>> {
    return api.get<SecretMetadata>(`${this.BASE_URL}/${id}/metadata`);
  }

  // Get secret versions
  static async getSecretVersions(id: string): Promise<ApiResponse<SecretVersion[]>> {
    return api.get<SecretVersion[]>(`${this.BASE_URL}/${id}/versions`);
  }

  // Search secrets
  static async searchSecrets(
    query: string,
    page: number = 1,
    perPage: number = 50,
    filters?: {
      providerId?: string;
      status?: string;
      labels?: Record<string, string>;
    }
  ): Promise<PaginatedResponse<SecretReference>> {
    const params = { q: query, ...filters };
    return api.getPaginated<SecretReference>(`${this.BASE_URL}/search`, page, perPage, { params });
  }

  // Get secret bindings
  static async getSecretBindings(id: string): Promise<ApiResponse<{
    bindings: Array<{
      id: string;
      targetType: string;
      targetName: string;
      envVarName: string;
      status: string;
    }>;
  }>> {
    return api.get(`${this.BASE_URL}/${id}/bindings`);
  }

  // Validate secret reference
  static async validateSecretReference(
    providerId: string,
    path: string,
    version?: string
  ): Promise<ApiResponse<{
    valid: boolean;
    exists: boolean;
    accessible: boolean;
    metadata?: SecretMetadata;
    error?: string;
  }>> {
    return api.post(`${this.BASE_URL}/validate`, {
      providerId,
      path,
      version,
    });
  }

  // Discover secrets from provider
  static async discoverSecrets(
    providerId: string,
    path?: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<SecretMetadata>> {
    const params = path ? { path } : {};
    return api.getPaginated<SecretMetadata>(
      `${this.BASE_URL}/discover/${providerId}`,
      page,
      perPage,
      { params }
    );
  }

  // Get secret statistics
  static async getSecretStats(): Promise<ApiResponse<{
    totalSecrets: number;
    activeSecrets: number;
    expiredSecrets: number;
    secretsByProvider: Record<string, number>;
    secretsByStatus: Record<string, number>;
  }>> {
    return api.get(`${this.BASE_URL}/stats`);
  }

  // Bulk operations
  static async bulkUpdateLabels(
    secretIds: string[],
    labels: Record<string, string>
  ): Promise<ApiResponse<{
    updated: number;
    errors: string[];
  }>> {
    return api.post(`${this.BASE_URL}/bulk/update-labels`, {
      secretIds,
      labels,
    });
  }

  static async bulkDelete(secretIds: string[]): Promise<ApiResponse<{
    deleted: number;
    errors: string[];
  }>> {
    return api.post(`${this.BASE_URL}/bulk/delete`, {
      secretIds,
    });
  }

  // Export secrets
  static async exportSecrets(
    format: 'json' | 'yaml' | 'csv',
    filters?: {
      providerId?: string;
      status?: string;
      labels?: Record<string, string>;
    }
  ): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    const params = { format, ...filters };
    return api.post(`${this.BASE_URL}/export`, params);
  }

  // Import secrets
  static async importSecrets(
    file: File,
    options?: {
      overwrite?: boolean;
      dryRun?: boolean;
    }
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return api.post(`${this.BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default SecretsService;
