import { api, ApiResponse, PaginatedResponse } from './api';

export interface Binding {
  id: string;
  name: string;
  targetType: 'mcp-server' | 'agent' | 'notebook' | 'job';
  targetId: string;
  targetName: string;
  secretId: string;
  secretName: string;
  secretPath: string;
  envVarName: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  required: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUsed?: string;
}

export interface CreateBindingRequest {
  name: string;
  targetType: 'mcp-server' | 'agent' | 'notebook' | 'job';
  targetId: string;
  secretId: string;
  envVarName: string;
  required?: boolean;
}

export interface UpdateBindingRequest {
  name?: string;
  envVarName?: string;
  required?: boolean;
}

export interface BindingTarget {
  id: string;
  name: string;
  type: 'mcp-server' | 'agent' | 'notebook' | 'job';
  namespace: string;
  status: string;
  bindings: number;
}

export interface BindingValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: Array<{
    bindingId: string;
    envVarName: string;
    conflictType: 'duplicate' | 'policy' | 'permission';
  }>;
}

export class BindingsService {
  private static readonly BASE_URL = '/bindings';

  // Get all bindings
  static async getBindings(
    page: number = 1,
    perPage: number = 50,
    filters?: {
      targetType?: string;
      targetId?: string;
      secretId?: string;
      status?: string;
    }
  ): Promise<PaginatedResponse<Binding>> {
    const params = filters ? { ...filters } : {};
    return api.getPaginated<Binding>(this.BASE_URL, page, perPage, { params });
  }

  // Get binding by ID
  static async getBinding(id: string): Promise<ApiResponse<Binding>> {
    return api.get<Binding>(`${this.BASE_URL}/${id}`);
  }

  // Create new binding
  static async createBinding(data: CreateBindingRequest): Promise<ApiResponse<Binding>> {
    return api.post<Binding>(this.BASE_URL, data);
  }

  // Update binding
  static async updateBinding(id: string, data: UpdateBindingRequest): Promise<ApiResponse<Binding>> {
    return api.put<Binding>(`${this.BASE_URL}/${id}`, data);
  }

  // Delete binding
  static async deleteBinding(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // Get bindings for a target
  static async getTargetBindings(targetId: string): Promise<ApiResponse<Binding[]>> {
    return api.get<Binding[]>(`${this.BASE_URL}/target/${targetId}`);
  }

  // Get bindings for a secret
  static async getSecretBindings(secretId: string): Promise<ApiResponse<Binding[]>> {
    return api.get<Binding[]>(`${this.BASE_URL}/secret/${secretId}`);
  }

  // Validate binding
  static async validateBinding(data: CreateBindingRequest): Promise<ApiResponse<BindingValidation>> {
    return api.post<BindingValidation>(`${this.BASE_URL}/validate`, data);
  }

  // Get available targets
  static async getAvailableTargets(
    targetType?: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<BindingTarget>> {
    const params = targetType ? { type: targetType } : {};
    return api.getPaginated<BindingTarget>(`${this.BASE_URL}/targets`, page, perPage, { params });
  }

  // Search targets
  static async searchTargets(
    query: string,
    targetType?: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<BindingTarget>> {
    const params = { q: query, ...(targetType && { type: targetType }) };
    return api.getPaginated<BindingTarget>(`${this.BASE_URL}/targets/search`, page, perPage, { params });
  }

  // Get binding statistics
  static async getBindingStats(): Promise<ApiResponse<{
    totalBindings: number;
    activeBindings: number;
    errorBindings: number;
    bindingsByTargetType: Record<string, number>;
    bindingsByStatus: Record<string, number>;
  }>> {
    return api.get(`${this.BASE_URL}/stats`);
  }

  // Bulk operations
  static async bulkCreateBindings(
    bindings: CreateBindingRequest[]
  ): Promise<ApiResponse<{
    created: number;
    errors: Array<{
      index: number;
      error: string;
    }>;
  }>> {
    return api.post(`${this.BASE_URL}/bulk/create`, { bindings });
  }

  static async bulkDeleteBindings(bindingIds: string[]): Promise<ApiResponse<{
    deleted: number;
    errors: string[];
  }>> {
    return api.post(`${this.BASE_URL}/bulk/delete`, { bindingIds });
  }

  // Test binding resolution
  static async testBindingResolution(id: string): Promise<ApiResponse<{
    success: boolean;
    resolved: boolean;
    error?: string;
    metadata?: {
      secretPath: string;
      provider: string;
      lastRotated: string;
    };
  }>> {
    return api.post(`${this.BASE_URL}/${id}/test-resolution`);
  }

  // Get binding usage history
  static async getBindingUsageHistory(
    id: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<{
    timestamp: string;
    action: string;
    target: string;
    outcome: string;
    correlationId: string;
  }>> {
    return api.getPaginated(`${this.BASE_URL}/${id}/usage`, page, perPage);
  }

  // Export bindings
  static async exportBindings(
    format: 'json' | 'yaml' | 'csv',
    filters?: {
      targetType?: string;
      targetId?: string;
      secretId?: string;
      status?: string;
    }
  ): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    const params = { format, ...filters };
    return api.post(`${this.BASE_URL}/export`, params);
  }

  // Import bindings
  static async importBindings(
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

  // Get binding templates
  static async getBindingTemplates(): Promise<ApiResponse<{
    templates: Array<{
      id: string;
      name: string;
      description: string;
      targetType: string;
      bindings: Array<{
        secretId: string;
        envVarName: string;
        required: boolean;
      }>;
    }>;
  }>> {
    return api.get(`${this.BASE_URL}/templates`);
  }

  // Apply binding template
  static async applyBindingTemplate(
    templateId: string,
    targetId: string
  ): Promise<ApiResponse<{
    applied: number;
    errors: string[];
  }>> {
    return api.post(`${this.BASE_URL}/templates/${templateId}/apply`, {
      targetId,
    });
  }
}

export default BindingsService;
