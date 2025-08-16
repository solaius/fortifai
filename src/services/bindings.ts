import { api } from './api';
import { 
  MCPServerBinding, 
  SecretBinding,
  CreateBindingRequest, 
  UpdateBindingRequest, 
  BindingFilter, 
  BindingSearchResult,
  DeploymentRequest,
  DeploymentResult,
  ValidationStatus,
  RuntimeConfig
} from '../types/bindings';
import { secretsService } from './secrets';
import { providersService } from './providers';

export class BindingsService {
  private bindings: Map<string, MCPServerBinding> = new Map();

  constructor() {
    this.loadBindings();
  }

  // CRUD Operations
  async createBinding(request: CreateBindingRequest): Promise<MCPServerBinding | null> {
    try {
      // Validate secret bindings
      const validationResult = await this.validateBindingRequest(request);
      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      const response = await api.post('/mcp-bindings', request);
      
      if (response.success && response.data) {
        const binding = response.data as MCPServerBinding;
        this.bindings.set(binding.id, binding);
        return binding;
      }
      return null;
    } catch (error) {
      console.error('Failed to create MCP binding:', error);
      throw error;
    }
  }

  async getBinding(id: string): Promise<MCPServerBinding | null> {
    try {
      // Check cache first
      if (this.bindings.has(id)) {
        return this.bindings.get(id)!;
      }

      const response = await api.get(`/mcp-bindings/${id}`);
      
      if (response.success && response.data) {
        const binding = response.data as MCPServerBinding;
        this.bindings.set(binding.id, binding);
        return binding;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get MCP binding ${id}:`, error);
      return null;
    }
  }

  async updateBinding(id: string, request: UpdateBindingRequest): Promise<MCPServerBinding | null> {
    try {
      const response = await api.put(`/mcp-bindings/${id}`, request);
      
      if (response.success && response.data) {
        const updatedBinding = response.data as MCPServerBinding;
        this.bindings.set(id, updatedBinding);
        return updatedBinding;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update MCP binding ${id}:`, error);
      throw error;
    }
  }

  async deleteBinding(id: string): Promise<boolean> {
    try {
      const response = await api.delete(`/mcp-bindings/${id}`);
      
      if (response.success) {
        this.bindings.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete MCP binding ${id}:`, error);
      throw error;
    }
  }

  async listBindings(filter?: BindingFilter): Promise<BindingSearchResult> {
    try {
      const params = this.buildFilterParams(filter);
      const response = await api.get('/mcp-bindings', { params });
      
      if (response.success && response.data) {
        const result = response.data as BindingSearchResult;
        
        // Update cache
        result.bindings.forEach(binding => {
          this.bindings.set(binding.id, binding);
        });
        
        return result;
      }
      
      return {
        bindings: [],
        total: 0,
        page: 1,
        perPage: 50,
        totalPages: 0,
        facets: {
          serverTypes: [],
          environments: [],
          namespaces: [],
          projects: [],
          statuses: [],
          healthStatuses: [],
          validationStatuses: [],
          tags: []
        }
      };
    } catch (error) {
      console.error('Failed to list MCP bindings:', error);
      throw error;
    }
  }

  // Search and Discovery
  async searchBindings(query: string, filter?: BindingFilter): Promise<BindingSearchResult> {
    try {
      const params = {
        q: query,
        ...this.buildFilterParams(filter)
      };
      
      const response = await api.get('/mcp-bindings/search', { params });
      
      if (response.success && response.data) {
        const result = response.data as BindingSearchResult;
        
        // Update cache
        result.bindings.forEach(binding => {
          this.bindings.set(binding.id, binding);
        });
        
        return result;
      }
      
      return {
        bindings: [],
        total: 0,
        page: 1,
        perPage: 50,
        totalPages: 0,
        facets: {
          serverTypes: [],
          environments: [],
          namespaces: [],
          projects: [],
          statuses: [],
          healthStatuses: [],
          validationStatuses: [],
          tags: []
        }
      };
    } catch (error) {
      console.error('Failed to search MCP bindings:', error);
      throw error;
    }
  }

  async getBindingsByServer(serverId: string, filter?: BindingFilter): Promise<MCPServerBinding[]> {
    try {
      const filterWithServer = { ...filter, serverId };
      const result = await this.listBindings(filterWithServer);
      return result.bindings;
    } catch (error) {
      console.error(`Failed to get bindings for server ${serverId}:`, error);
      return [];
    }
  }

  async getBindingsByNamespace(namespace: string, filter?: BindingFilter): Promise<MCPServerBinding[]> {
    try {
      const filterWithNamespace = { ...filter, namespace };
      const result = await this.listBindings(filterWithNamespace);
      return result.bindings;
    } catch (error) {
      console.error(`Failed to get bindings for namespace ${namespace}:`, error);
      return [];
    }
  }

  async getBindingsByProject(project: string, filter?: BindingFilter): Promise<MCPServerBinding[]> {
    try {
      const filterWithProject = { ...filter, project };
      const result = await this.listBindings(filterWithProject);
      return result.bindings;
    } catch (error) {
      console.error(`Failed to get bindings for project ${project}:`, error);
      return [];
    }
  }

  // Secret Binding Management
  async addSecretBinding(bindingId: string, secretBinding: Partial<SecretBinding>): Promise<MCPServerBinding | null> {
    try {
      const response = await api.post(`/mcp-bindings/${bindingId}/secret-bindings`, secretBinding);
      
      if (response.success && response.data) {
        const updatedBinding = response.data as MCPServerBinding;
        this.bindings.set(bindingId, updatedBinding);
        return updatedBinding;
      }
      return null;
    } catch (error) {
      console.error(`Failed to add secret binding to binding ${bindingId}:`, error);
      throw error;
    }
  }

  async updateSecretBinding(bindingId: string, secretBindingId: string, updates: Partial<SecretBinding>): Promise<MCPServerBinding | null> {
    try {
      const response = await api.put(`/mcp-bindings/${bindingId}/secret-bindings/${secretBindingId}`, updates);
      
      if (response.success && response.data) {
        const updatedBinding = response.data as MCPServerBinding;
        this.bindings.set(bindingId, updatedBinding);
        return updatedBinding;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update secret binding ${secretBindingId} in binding ${bindingId}:`, error);
      throw error;
    }
  }

  async removeSecretBinding(bindingId: string, secretBindingId: string): Promise<MCPServerBinding | null> {
    try {
      const response = await api.delete(`/mcp-bindings/${bindingId}/secret-bindings/${secretBindingId}`);
      
      if (response.success && response.data) {
        const updatedBinding = response.data as MCPServerBinding;
        this.bindings.set(bindingId, updatedBinding);
        return updatedBinding;
      }
      return null;
    } catch (error) {
      console.error(`Failed to remove secret binding ${secretBindingId} from binding ${bindingId}:`, error);
      throw error;
    }
  }

  // Validation and Health
  async validateBinding(bindingId: string): Promise<ValidationStatus> {
    try {
      const response = await api.post(`/mcp-bindings/${bindingId}/validate`);
      
      if (response.success && response.data) {
        const validationStatus = response.data as ValidationStatus;
        
        // Update binding cache with validation status
        const binding = this.bindings.get(bindingId);
        if (binding) {
          binding.validationStatus = validationStatus;
          binding.lastValidation = new Date().toISOString();
          this.bindings.set(bindingId, binding);
        }
        
        return validationStatus;
      }
      
      throw new Error('Validation failed');
    } catch (error) {
      console.error(`Failed to validate binding ${bindingId}:`, error);
      throw error;
    }
  }

  async getBindingHealth(bindingId: string): Promise<{ status: string; details: any } | null> {
    try {
      const response = await api.get(`/mcp-bindings/${bindingId}/health`);
      
      if (response.success && response.data) {
        const healthData = response.data as { status: string; details: any };
        
        // Update binding cache with health status
        const binding = this.bindings.get(bindingId);
        if (binding) {
          binding.healthStatus = healthData.status as 'healthy' | 'warning' | 'critical' | 'unknown';
          this.bindings.set(bindingId, binding);
        }
        
        return healthData;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get health for binding ${bindingId}:`, error);
      return null;
    }
  }

  // Deployment Management
  async deployBinding(request: DeploymentRequest): Promise<DeploymentResult> {
    try {
      const response = await api.post(`/mcp-bindings/${request.bindingId}/deploy`, request);
      
      if (response.success && response.data) {
        const deploymentResult = response.data as DeploymentResult;
        
        // Update binding cache with deployment info
        if (deploymentResult.success) {
          const binding = this.bindings.get(request.bindingId);
          if (binding) {
            binding.lastDeployed = new Date().toISOString();
            binding.deploymentCount++;
            this.bindings.set(request.bindingId, binding);
          }
        }
        
        return deploymentResult;
      }
      
      throw new Error('Deployment failed');
    } catch (error) {
      console.error(`Failed to deploy binding ${request.bindingId}:`, error);
      throw error;
    }
  }

  async getDeploymentStatus(bindingId: string, deploymentId: string): Promise<DeploymentResult | null> {
    try {
      const response = await api.get(`/mcp-bindings/${bindingId}/deployments/${deploymentId}`);
      
      if (response.success && response.data) {
        return response.data as DeploymentResult;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get deployment status for ${deploymentId}:`, error);
      return null;
    }
  }

  async rollbackDeployment(bindingId: string, deploymentId: string): Promise<DeploymentResult | null> {
    try {
      const response = await api.post(`/mcp-bindings/${bindingId}/deployments/${deploymentId}/rollback`);
      
      if (response.success && response.data) {
        return response.data as DeploymentResult;
      }
      return null;
    } catch (error) {
      console.error(`Failed to rollback deployment ${deploymentId}:`, error);
      throw error;
    }
  }

  // Runtime Configuration
  async updateRuntimeConfig(bindingId: string, config: Partial<RuntimeConfig>): Promise<MCPServerBinding | null> {
    try {
      const response = await api.patch(`/mcp-bindings/${bindingId}/runtime-config`, config);
      
      if (response.success && response.data) {
        const updatedBinding = response.data as MCPServerBinding;
        this.bindings.set(bindingId, updatedBinding);
        return updatedBinding;
      }
      return null;
    } catch (error) {
      console.error(`Failed to update runtime config for binding ${bindingId}:`, error);
      throw error;
    }
  }

  async getRuntimeConfig(bindingId: string): Promise<RuntimeConfig | null> {
    try {
      const response = await api.get(`/mcp-bindings/${bindingId}/runtime-config`);
      
      if (response.success && response.data) {
        return response.data as RuntimeConfig;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get runtime config for binding ${bindingId}:`, error);
      return null;
    }
  }

  // Utility Methods
  private async validateBindingRequest(request: CreateBindingRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate required fields
    if (!request.name?.trim()) {
      errors.push('Binding name is required');
    }

    if (!request.serverId?.trim()) {
      errors.push('Server ID is required');
    }

    if (!request.namespace?.trim()) {
      errors.push('Namespace is required');
    }

    if (!request.environment) {
      errors.push('Environment is required');
    }

    // Validate secret bindings
    if (!request.secretBindings || request.secretBindings.length === 0) {
      errors.push('At least one secret binding is required');
    } else {
      for (const binding of request.secretBindings) {
        if (!binding.secretReferenceId?.trim()) {
          errors.push('Secret reference ID is required for all bindings');
        }

        if (!binding.envVarName?.trim()) {
          errors.push('Environment variable name is required for all bindings');
        }

        if (!binding.accessLevel) {
          errors.push('Access level is required for all bindings');
        }

        // Validate that secret reference exists
        try {
          const secretRef = await secretsService.getReference(binding.secretReferenceId);
          if (!secretRef) {
            errors.push(`Secret reference ${binding.secretReferenceId} not found`);
          }
        } catch (error) {
          errors.push(`Failed to validate secret reference ${binding.secretReferenceId}`);
        }
      }
    }

    // Validate runtime config
    if (request.runtimeConfig) {
      if (request.runtimeConfig.replicas && request.runtimeConfig.replicas < 1) {
        errors.push('Replicas must be at least 1');
      }

      if (request.runtimeConfig.resources) {
        const resources = request.runtimeConfig.resources;
        if (resources.cpu && (parseFloat(resources.cpu.request) < 0 || parseFloat(resources.cpu.limit) < 0)) {
          errors.push('CPU resources must be positive');
        }
        if (resources.memory && (parseFloat(resources.memory.request) < 0 || parseFloat(resources.memory.limit) < 0)) {
          errors.push('Memory resources must be positive');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private buildFilterParams(filter?: BindingFilter): Record<string, any> {
    if (!filter) return {};

    const params: Record<string, any> = {};

    // Basic filters
    if (filter.name) params.name = filter.name;
    if (filter.serverId) params.server_id = filter.serverId;
    if (filter.serverType) params.server_type = filter.serverType;
    if (filter.environment) params.environment = filter.environment;
    if (filter.namespace) params.namespace = filter.namespace;
    if (filter.project) params.project = filter.project;

    // Status filters
    if (filter.status) params.status = filter.status;
    if (filter.healthStatus) params.health_status = filter.healthStatus;
    if (filter.validationStatus) params.validation_status = filter.validationStatus;

    // Secret binding filters
    if (filter.hasSecretBinding !== undefined) params.has_secret_binding = filter.hasSecretBinding;
    if (filter.secretCategory) params.secret_category = filter.secretCategory;
    if (filter.secretPriority) params.secret_priority = filter.secretPriority;

    // Date filters
    if (filter.createdAfter) params.created_after = filter.createdAfter;
    if (filter.createdBefore) params.created_before = filter.createdBefore;
    if (filter.updatedAfter) params.updated_after = filter.updatedAfter;
    if (filter.updatedBefore) params.updated_before = filter.updatedBefore;
    if (filter.lastDeployedAfter) params.last_deployed_after = filter.lastDeployedAfter;
    if (filter.lastDeployedBefore) params.last_deployed_before = filter.lastDeployedBefore;

    // Label and annotation filters
    if (filter.labels) params.labels = JSON.stringify(filter.labels);
    if (filter.annotations) params.annotations = JSON.stringify(filter.annotations);
    if (filter.tags) params.tags = filter.tags.join(',');

    // Pagination
    if (filter.page) params.page = filter.page;
    if (filter.perPage) params.per_page = filter.perPage;
    if (filter.sortBy) params.sort_by = filter.sortBy;
    if (filter.sortOrder) params.sort_order = filter.sortOrder;

    return params;
  }

  private async loadBindings(): Promise<void> {
    try {
      await this.listBindings();
    } catch (error) {
      console.error('Failed to load MCP bindings:', error);
    }
  }

  // Cleanup
  cleanup(): void {
    this.bindings.clear();
  }
}

// Export singleton instance
export const bindingsService = new BindingsService();
export default bindingsService;
