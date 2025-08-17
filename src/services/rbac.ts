// RBAC Service for FortifAI Secrets Management
// This service handles role and permission management

import { apiClient } from './api';
import { shouldUseMockData, getMockRoles, getMockPermissions, getMockPolicies } from './mockData';
import type {
  Role,
  Permission,
  Policy,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilter,
  PolicyFilter
} from '../types/rbac';

// ============================================================================
// RBAC SERVICE CLASS
// ============================================================================

class RBACService {
  private readonly baseUrl = '/api/rbac';

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  /**
   * Get all roles with optional filtering
   */
  async getRoles(filter?: RoleFilter): Promise<Role[]> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockRoles(filter);
      }

      const response = await apiClient.get(`${this.baseUrl}/roles`, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // Fallback to mock data on error
      return this.getMockRoles(filter);
    }
  }

  /**
   * Get a specific role by ID
   */
  async getRole(roleId: string): Promise<Role | null> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockRole(roleId);
      }

      const response = await apiClient.get(`${this.baseUrl}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch role ${roleId}:`, error);
      return this.getMockRole(roleId);
    }
  }

  /**
   * Create a new role
   */
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      if (this.shouldUseMockData()) {
        return this.createMockRole(roleData);
      }

      const response = await apiClient.post(`${this.baseUrl}/roles`, roleData);
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw new Error('Failed to create role');
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<Role> {
    try {
      if (this.shouldUseMockData()) {
        return this.updateMockRole(roleId, roleData);
      }

      const response = await apiClient.put(`${this.baseUrl}/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update role ${roleId}:`, error);
      throw new Error('Failed to update role');
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      if (this.shouldUseMockData()) {
        return this.deleteMockRole(roleId);
      }

      await apiClient.delete(`${this.baseUrl}/roles/${roleId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete role ${roleId}:`, error);
      // Preserve the original error message for mock data
      if (this.shouldUseMockData()) {
        throw error;
      }
      throw new Error('Failed to delete role');
    }
  }

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPermissions();
      }

      const response = await apiClient.get(`${this.baseUrl}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return this.getMockPermissions();
    }
  }

  /**
   * Get a specific permission by ID
   */
  async getPermission(permissionId: string): Promise<Permission | null> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPermission(permissionId);
      }

      const response = await apiClient.get(`${this.baseUrl}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch permission ${permissionId}:`, error);
      return this.getMockPermission(permissionId);
    }
  }

  // ============================================================================
  // POLICY MANAGEMENT
  // ============================================================================

  /**
   * Get all policies with optional filtering
   */
  async getPolicies(filter?: PolicyFilter): Promise<Policy[]> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPolicies(filter);
      }

      const response = await apiClient.get(`${this.baseUrl}/policies`, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      return this.getMockPolicies(filter);
    }
  }

  /**
   * Get a specific policy by ID
   */
  async getPolicy(policyId: string): Promise<Policy | null> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPolicy(policyId);
      }

      const response = await apiClient.get(`${this.baseUrl}/policies/${policyId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch policy ${policyId}:`, error);
      return this.getMockPolicy(policyId);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user has a specific role
   */
  hasRole(userRoles: string[], requiredRole: string): boolean {
    return userRoles.includes(requiredRole);
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has all required roles
   */
  hasAllRoles(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.every(role => userRoles.includes(role));
  }

  /**
   * Get roles by category
   */
  getRolesByCategory(roles: Role[], category: string): Role[] {
    return roles.filter(role => role.metadata.category === category);
  }

  /**
   * Get system roles
   */
  getSystemRoles(roles: Role[]): Role[] {
    return roles.filter(role => role.isSystem);
  }

  /**
   * Get default roles
   */
  getDefaultRoles(roles: Role[]): Role[] {
    return roles.filter(role => role.isDefault);
  }

  // ============================================================================
  // MOCK DATA METHODS
  // ============================================================================

  private shouldUseMockData(): boolean {
    return shouldUseMockData();
  }

  private getMockRoles(filter?: RoleFilter): Role[] {
    const roles = getMockRoles();
    
    if (!filter) return roles;

    return roles.filter((role: Role) => {
      if (filter.name && !role.name.toLowerCase().includes(filter.name.toLowerCase())) {
        return false;
      }
      if (filter.isSystem !== undefined && role.isSystem !== filter.isSystem) {
        return false;
      }
      if (filter.isDefault !== undefined && role.isDefault !== filter.isDefault) {
        return false;
      }
      if (filter.category && role.metadata.category !== filter.category) {
        return false;
      }
      if (filter.tags && !filter.tags.some(tag => role.metadata.tags.includes(tag))) {
        return false;
      }
      return true;
    });
  }

  private getMockRole(roleId: string): Role | null {
    const roles = getMockRoles();
    return roles.find((role: Role) => role.id === roleId) || null;
  }

  private createMockRole(roleData: CreateRoleRequest): Role {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      ...roleData,
      permissions: [],
      isSystem: false,
      isDefault: false,
      metadata: {
        category: 'custom',
        priority: 100,
        tags: [],
        labels: {},
        annotations: {},
        ...roleData.metadata
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    // In a real implementation, this would be stored in the backend
    console.log('Mock role created:', newRole);
    return newRole;
  }

  private updateMockRole(roleId: string, roleData: UpdateRoleRequest): Role {
    const existingRole = this.getMockRole(roleId);
    if (!existingRole) {
      throw new Error(`Role ${roleId} not found`);
    }

    // Handle permissions properly - if permissions are provided as strings, convert them
    let permissions = existingRole.permissions;
    if (roleData.permissions) {
      // In a real implementation, this would fetch the actual Permission objects
      // For now, we'll keep the existing permissions
      permissions = existingRole.permissions;
    }

    const updatedRole: Role = {
      ...existingRole,
      ...roleData,
      permissions,
      metadata: {
        ...existingRole.metadata,
        ...roleData.metadata
      },
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, this would be updated in the backend
    console.log('Mock role updated:', updatedRole);
    return updatedRole;
  }

  private deleteMockRole(roleId: string): boolean {
    const existingRole = this.getMockRole(roleId);
    if (!existingRole) {
      throw new Error(`Role ${roleId} not found`);
    }

    if (existingRole.isSystem) {
      throw new Error('Cannot delete system roles');
    }

    // In a real implementation, this would be deleted from the backend
    console.log('Mock role deleted:', roleId);
    return true;
  }

  private getMockPermissions(): Permission[] {
    return getMockPermissions();
  }

  private getMockPermission(permissionId: string): Permission | null {
    const permissions = getMockPermissions();
    return permissions.find((permission: Permission) => permission.id === permissionId) || null;
  }

  private getMockPolicies(filter?: PolicyFilter): Policy[] {
    const policies = getMockPolicies();
    
    if (!filter) return policies;

    return policies.filter((policy: Policy) => {
      if (filter.name && !policy.name.toLowerCase().includes(filter.name.toLowerCase())) {
        return false;
      }
      if (filter.effect && policy.effect !== filter.effect) {
        return false;
      }
      if (filter.status && policy.status !== filter.status) {
        return false;
      }
      if (filter.priority && policy.priority !== filter.priority) {
        return false;
      }
      if (filter.resources && !filter.resources.some(resource => policy.targets.resources.includes(resource))) {
        return false;
      }
      if (filter.actions && !filter.actions.some(action => policy.targets.actions.includes(action))) {
        return false;
      }
      if (filter.providers && policy.targets.providers && 
          !filter.providers.some(provider => policy.targets.providers!.includes(provider))) {
        return false;
      }
      if (filter.namespaces && policy.targets.namespaces && 
          !filter.namespaces.some(namespace => policy.targets.namespaces!.includes(namespace))) {
        return false;
      }
      if (filter.projects && policy.targets.projects && 
          !filter.projects.some(project => policy.targets.projects!.includes(project))) {
        return false;
      }
      if (filter.tags && !filter.tags.some(tag => policy.metadata.tags.includes(tag))) {
        return false;
      }
      return true;
    });
  }

  private getMockPolicy(policyId: string): Policy | null {
    const policies = getMockPolicies();
    return policies.find((policy: Policy) => policy.id === policyId) || null;
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const rbacService = new RBACService();

// ============================================================================
// EXPORTS
// ============================================================================

export default rbacService;
