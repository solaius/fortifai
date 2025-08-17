// Policy Versioning Service for FortifAI Secrets Management
// This service handles policy versioning, change tracking, and audit trail

import { apiClient } from './api';
import { shouldUseMockData } from './mockData';
import type {
  Policy,
  PolicyVersion,
  VersionMetadata,
  CreatePolicyRequest,
  UpdatePolicyRequest
} from '../types/rbac';

// ============================================================================
// POLICY VERSIONING SERVICE CLASS
// ============================================================================

class PolicyVersioningService {
  private readonly baseUrl = '/api/policy-versioning';
  private readonly versionHistory = new Map<string, PolicyVersion[]>();

  // ============================================================================
  // POLICY VERSIONING
  // ============================================================================

  /**
   * Create a new version of a policy
   */
  async createPolicyVersion(
    policyId: string,
    policy: Policy,
    changeSummary: string,
    changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated',
    metadata?: Partial<VersionMetadata>
  ): Promise<PolicyVersion> {
    try {
      if (this.shouldUseMockData()) {
        return this.createMockPolicyVersion(policyId, policy, changeSummary, changeType, metadata);
      }

      const versionData = {
        policyId,
        content: policy,
        changeSummary,
        changeType,
        metadata: metadata || {}
      };

      const response = await apiClient.post(`${this.baseUrl}/versions`, versionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create policy version:', error);
      throw new Error('Failed to create policy version');
    }
  }

  /**
   * Get version history for a policy
   */
  async getPolicyVersionHistory(policyId: string): Promise<PolicyVersion[]> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPolicyVersionHistory(policyId);
      }

      const response = await apiClient.get(`${this.baseUrl}/policies/${policyId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch version history for policy ${policyId}:`, error);
      return this.getMockPolicyVersionHistory(policyId);
    }
  }

  /**
   * Get a specific version of a policy
   */
  async getPolicyVersion(policyId: string, versionNumber: number): Promise<PolicyVersion | null> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPolicyVersion(policyId, versionNumber);
      }

      const response = await apiClient.get(`${this.baseUrl}/policies/${policyId}/versions/${versionNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch policy version ${policyId}:${versionNumber}:`, error);
      return this.getMockPolicyVersion(policyId, versionNumber);
    }
  }

  /**
   * Compare two versions of a policy
   */
  async comparePolicyVersions(
    policyId: string,
    version1: number,
    version2: number
  ): Promise<PolicyVersionComparison> {
    try {
      if (this.shouldUseMockData()) {
        return this.compareMockPolicyVersions(policyId, version1, version2);
      }

      const response = await apiClient.get(
        `${this.baseUrl}/policies/${policyId}/compare?version1=${version1}&version2=${version2}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to compare policy versions ${policyId}:${version1} vs ${version2}:`, error);
      return this.compareMockPolicyVersions(policyId, version1, version2);
    }
  }

  /**
   * Restore a policy to a previous version
   */
  async restorePolicyVersion(
    policyId: string,
    versionNumber: number,
    reason: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<Policy> {
    try {
      if (this.shouldUseMockData()) {
        return this.restoreMockPolicyVersion(policyId, versionNumber, reason, metadata);
      }

      const restoreData = {
        versionNumber,
        reason,
        metadata: metadata || {}
      };

      const response = await apiClient.post(`${this.baseUrl}/policies/${policyId}/restore`, restoreData);
      return response.data;
    } catch (error) {
      console.error(`Failed to restore policy ${policyId} to version ${versionNumber}:`, error);
      throw new Error('Failed to restore policy version');
    }
  }

  /**
   * Get policy change audit trail
   */
  async getPolicyAuditTrail(
    policyId: string,
    startDate?: string,
    endDate?: string,
    changeTypes?: string[]
  ): Promise<PolicyVersion[]> {
    try {
      if (this.shouldUseMockData()) {
        return this.getMockPolicyAuditTrail(policyId, startDate, endDate, changeTypes);
      }

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (changeTypes) params.changeTypes = changeTypes.join(',');

      const response = await apiClient.get(`${this.baseUrl}/policies/${policyId}/audit`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch audit trail for policy ${policyId}:`, error);
      return this.getMockPolicyAuditTrail(policyId, startDate, endDate, changeTypes);
    }
  }

  // ============================================================================
  // POLICY LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Create a new policy with versioning
   */
  async createPolicyWithVersioning(
    policyData: CreatePolicyRequest,
    changeSummary: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<{ policy: Policy; version: PolicyVersion }> {
    try {
      if (this.shouldUseMockData()) {
        return this.createMockPolicyWithVersioning(policyData, changeSummary, metadata);
      }

      // Create the policy first
      const policyResponse = await apiClient.post('/api/policies', policyData);
      const policy = policyResponse.data;

      // Create the initial version
      const version = await this.createPolicyVersion(
        policy.id,
        policy,
        changeSummary,
        'created',
        metadata
      );

      return { policy, version };
    } catch (error) {
      console.error('Failed to create policy with versioning:', error);
      throw new Error('Failed to create policy with versioning');
    }
  }

  /**
   * Update a policy with versioning
   */
  async updatePolicyWithVersioning(
    policyId: string,
    policyData: UpdatePolicyRequest,
    changeSummary: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<{ policy: Policy; version: PolicyVersion }> {
    try {
      if (this.shouldUseMockData()) {
        return this.updateMockPolicyWithVersioning(policyId, policyData, changeSummary, metadata);
      }

      // Update the policy first
      const policyResponse = await apiClient.put(`/api/policies/${policyId}`, policyData);
      const policy = policyResponse.data;

      // Create a new version
      const version = await this.createPolicyVersion(
        policyId,
        policy,
        changeSummary,
        'updated',
        metadata
      );

      return { policy, version };
    } catch (error) {
      console.error(`Failed to update policy ${policyId} with versioning:`, error);
      throw new Error('Failed to update policy with versioning');
    }
  }

  /**
   * Delete a policy with versioning
   */
  async deletePolicyWithVersioning(
    policyId: string,
    reason: string,
    metadata?: Partial<VersionMetadata>
  ): Promise<PolicyVersion> {
    try {
      if (this.shouldUseMockData()) {
        return this.deleteMockPolicyWithVersioning(policyId, reason, metadata);
      }

      // Get the current policy before deletion
      const policyResponse = await apiClient.get(`/api/policies/${policyId}`);
      const policy = policyResponse.data;

      // Create a deletion version
      const version = await this.createPolicyVersion(
        policyId,
        policy,
        reason,
        'deleted',
        metadata
      );

      // Delete the policy
      await apiClient.delete(`/api/policies/${policyId}`);

      return version;
    } catch (error) {
      console.error(`Failed to delete policy ${policyId} with versioning:`, error);
      throw new Error('Failed to delete policy with versioning');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get the latest version of a policy
   */
  async getLatestPolicyVersion(policyId: string): Promise<PolicyVersion | null> {
    const versions = await this.getPolicyVersionHistory(policyId);
    if (versions.length === 0) return null;

    // Sort by version number and return the latest
    return versions.sort((a, b) => b.version - a.version)[0];
  }

  /**
   * Check if a policy has been modified since a specific version
   */
  async hasPolicyChangedSince(
    policyId: string,
    versionNumber: number
  ): Promise<boolean> {
    const latestVersion = await this.getLatestPolicyVersion(policyId);
    if (!latestVersion) return false;

    return latestVersion.version > versionNumber;
  }

  /**
   * Get policy change statistics
   */
  async getPolicyChangeStats(policyId: string): Promise<PolicyChangeStats> {
    const versions = await this.getPolicyVersionHistory(policyId);
    
    const stats: PolicyChangeStats = {
      totalVersions: versions.length,
      changeTypeCounts: {
        created: 0,
        updated: 0,
        deleted: 0,
        activated: 0,
        deactivated: 0
      },
      averageChangesPerMonth: 0,
      lastModified: null,
      mostActiveContributor: null
    };

    if (versions.length === 0) return stats;

    // Count change types
    versions.forEach(version => {
      stats.changeTypeCounts[version.changeType]++;
    });

    // Calculate average changes per month
    if (versions.length > 1) {
      const firstVersion = new Date(versions[versions.length - 1].createdAt);
      const lastVersion = new Date(versions[0].createdAt);
      const monthsDiff = (lastVersion.getTime() - firstVersion.getTime()) / (1000 * 60 * 60 * 24 * 30);
      stats.averageChangesPerMonth = monthsDiff > 0 ? versions.length / monthsDiff : 0;
    }

    // Get last modified date
    stats.lastModified = versions[0].createdAt;

    // Find most active contributor
    const contributorCounts = new Map<string, number>();
    versions.forEach(version => {
      const count = contributorCounts.get(version.createdBy) || 0;
      contributorCounts.set(version.createdBy, count + 1);
    });

    let maxContributor = '';
    let maxCount = 0;
    contributorCounts.forEach((count, contributor) => {
      if (count > maxCount) {
        maxCount = count;
        maxContributor = contributor;
      }
    });

    stats.mostActiveContributor = maxContributor;

    return stats;
  }

  // ============================================================================
  // MOCK DATA METHODS
  // ============================================================================

  private shouldUseMockData(): boolean {
    return shouldUseMockData();
  }

  private createMockPolicyVersion(
    policyId: string,
    policy: Policy,
    changeSummary: string,
    changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated',
    metadata?: Partial<VersionMetadata>
  ): PolicyVersion {
    const versionNumber = this.getNextVersionNumber(policyId);
    
    const version: PolicyVersion = {
      id: `version-${Date.now()}`,
      policyId,
      version: versionNumber,
      content: policy,
      changeSummary,
      changeType,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      metadata: {
        reason: changeSummary,
        impact: metadata?.impact || 'low',
        reviewRequired: metadata?.reviewRequired || false,
        approvedBy: metadata?.approvedBy,
        approvedAt: metadata?.approvedAt,
        comments: metadata?.comments || [],
        ...metadata
      }
    };

    // Store in local version history
    this.storeMockVersion(policyId, version);

    return version;
  }

  private getMockPolicyVersionHistory(policyId: string): PolicyVersion[] {
    return this.versionHistory.get(policyId) || [];
  }

  private getMockPolicyVersion(policyId: string, versionNumber: number): PolicyVersion | null {
    const versions = this.getMockPolicyVersionHistory(policyId);
    return versions.find(v => v.version === versionNumber) || null;
  }

  private compareMockPolicyVersions(
    policyId: string,
    version1: number,
    version2: number
  ): PolicyVersionComparison {
    const v1 = this.getMockPolicyVersion(policyId, version1);
    const v2 = this.getMockPolicyVersion(policyId, version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    // Simple comparison - in a real implementation, this would do deep diff
    const changes = this.generateMockPolicyChanges(v1.content, v2.content);

    return {
      policyId,
      version1: v1.version,
      version2: v2.version,
      changes,
      summary: `Policy changed from version ${version1} to ${version2}`,
      timestamp: new Date().toISOString()
    };
  }

  private restoreMockPolicyVersion(
    policyId: string,
    versionNumber: number,
    reason: string,
    metadata?: Partial<VersionMetadata>
  ): Policy {
    const version = this.getMockPolicyVersion(policyId, versionNumber);
    if (!version) {
      throw new Error(`Version ${versionNumber} not found for policy ${policyId}`);
    }

    // Create a new version with the restored content
    const restoredPolicy = { ...version.content };
    restoredPolicy.version = this.getNextVersionNumber(policyId);
    restoredPolicy.updatedAt = new Date().toISOString();

    // Create version record for the restoration
    this.createMockPolicyVersion(
      policyId,
      restoredPolicy,
      `Restored from version ${versionNumber}: ${reason}`,
      'updated',
      metadata
    );

    return restoredPolicy;
  }

  private getMockPolicyAuditTrail(
    policyId: string,
    startDate?: string,
    endDate?: string,
    changeTypes?: string[]
  ): PolicyVersion[] {
    let versions = this.getMockPolicyVersionHistory(policyId);

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      versions = versions.filter(v => new Date(v.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      versions = versions.filter(v => new Date(v.createdAt) <= end);
    }

    // Filter by change types
    if (changeTypes && changeTypes.length > 0) {
      versions = versions.filter(v => changeTypes.includes(v.changeType));
    }

    return versions;
  }

  private createMockPolicyWithVersioning(
    policyData: CreatePolicyRequest,
    changeSummary: string,
    metadata?: Partial<VersionMetadata>
  ): { policy: Policy; version: PolicyVersion } {
    const policy: Policy = {
      id: `policy-${Date.now()}`,
      ...policyData,
      status: 'active',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      rules: policyData.rules.map((rule, index) => ({
        ...rule,
        id: `rule-${Date.now()}-${index}`
      })),
      targets: policyData.targets,
      conditions: policyData.conditions?.map((condition, index) => ({
        ...condition,
        id: `condition-${Date.now()}-${index}`
      })) || [],
      metadata: {
        category: 'custom',
        tags: [],
        labels: {},
        annotations: {},
        compliance: {
          standards: [],
          requirements: [],
          controls: [],
          evidence: []
        },
        risk: {
          level: 'low',
          factors: [],
          mitigation: [],
          reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        ...policyData.metadata
      }
    };

    const version = this.createMockPolicyVersion(
      policy.id,
      policy,
      changeSummary,
      'created',
      metadata
    );

    return { policy, version };
  }

  private updateMockPolicyWithVersioning(
    policyId: string,
    policyData: UpdatePolicyRequest,
    changeSummary: string,
    metadata?: Partial<VersionMetadata>
  ): { policy: Policy; version: PolicyVersion } {
    // Get current policy (simplified mock implementation)
    const currentPolicy: Policy = {
      id: policyId,
      name: 'Mock Policy',
      displayName: 'Mock Policy',
      description: 'Mock policy for testing',
      effect: 'allow',
      priority: 100,
      status: 'active',
      rules: [],
      targets: { resources: [], actions: [] },
      conditions: [],
      metadata: {
        category: 'custom',
        tags: [],
        labels: {},
        annotations: {},
        compliance: { standards: [], requirements: [], controls: [], evidence: [] },
        risk: { level: 'low', factors: [], mitigation: [], reviewDate: new Date().toISOString() }
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    // Update the policy
    const updatedPolicy: Policy = {
      ...currentPolicy,
      ...policyData,
      // Ensure rules have proper IDs
      rules: policyData.rules ? policyData.rules.map((rule, index) => ({
        ...rule,
        id: `rule-${Date.now()}-${index}`
      })) : currentPolicy.rules,
      // Ensure conditions have proper IDs
      conditions: policyData.conditions ? policyData.conditions.map((condition, index) => ({
        ...condition,
        id: `condition-${Date.now()}-${index}`
      })) : currentPolicy.conditions,
      // Ensure targets has required properties
      targets: policyData.targets ? {
        ...currentPolicy.targets,
        ...policyData.targets,
        resources: policyData.targets.resources || currentPolicy.targets.resources,
        actions: policyData.targets.actions || currentPolicy.targets.actions
      } : currentPolicy.targets,
      // Ensure metadata has required properties
      metadata: policyData.metadata ? {
        ...currentPolicy.metadata,
        ...policyData.metadata,
        category: policyData.metadata.category || currentPolicy.metadata.category,
        tags: policyData.metadata.tags || currentPolicy.metadata.tags,
        labels: policyData.metadata.labels || currentPolicy.metadata.labels,
        annotations: policyData.metadata.annotations || currentPolicy.metadata.annotations,
        compliance: policyData.metadata.compliance || currentPolicy.metadata.compliance,
        risk: policyData.metadata.risk || currentPolicy.metadata.risk
      } : currentPolicy.metadata,
      version: currentPolicy.version + 1,
      updatedAt: new Date().toISOString()
    };

    const version = this.createMockPolicyVersion(
      policyId,
      updatedPolicy,
      changeSummary,
      'updated',
      metadata
    );

    return { policy: updatedPolicy, version };
  }

  private deleteMockPolicyWithVersioning(
    policyId: string,
    reason: string,
    metadata?: Partial<VersionMetadata>
  ): PolicyVersion {
    // Get current policy (simplified mock implementation)
    const currentPolicy: Policy = {
      id: policyId,
      name: 'Mock Policy',
      displayName: 'Mock Policy',
      description: 'Mock policy for testing',
      effect: 'allow',
      priority: 100,
      status: 'active',
      rules: [],
      targets: { resources: [], actions: [] },
      conditions: [],
      metadata: {
        category: 'custom',
        tags: [],
        labels: {},
        annotations: {},
        compliance: { standards: [], requirements: [], controls: [], evidence: [] },
        risk: { level: 'low', factors: [], mitigation: [], reviewDate: new Date().toISOString() }
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    return this.createMockPolicyVersion(
      policyId,
      currentPolicy,
      reason,
      'deleted',
      metadata
    );
  }

  private getNextVersionNumber(policyId: string): number {
    const versions = this.getMockPolicyVersionHistory(policyId);
    return versions.length + 1;
  }

  private storeMockVersion(policyId: string, version: PolicyVersion): void {
    const versions = this.getMockPolicyVersionHistory(policyId);
    versions.unshift(version); // Add to beginning
    this.versionHistory.set(policyId, versions);
  }

  private generateMockPolicyChanges(oldPolicy: Policy, newPolicy: Policy): PolicyChange[] {
    const changes: PolicyChange[] = [];

    if (oldPolicy.name !== newPolicy.name) {
      changes.push({
        field: 'name',
        oldValue: oldPolicy.name,
        newValue: newPolicy.name,
        type: 'modified'
      });
    }

    if (oldPolicy.description !== newPolicy.description) {
      changes.push({
        field: 'description',
        oldValue: oldPolicy.description,
        newValue: newPolicy.description,
        type: 'modified'
      });
    }

    if (oldPolicy.effect !== newPolicy.effect) {
      changes.push({
        field: 'effect',
        oldValue: oldPolicy.effect,
        newValue: newPolicy.effect,
        type: 'modified'
      });
    }

    if (oldPolicy.priority !== newPolicy.priority) {
      changes.push({
        field: 'priority',
        oldValue: oldPolicy.priority.toString(),
        newValue: newPolicy.priority.toString(),
        type: 'modified'
      });
    }

    return changes;
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface PolicyVersionComparison {
  policyId: string;
  version1: number;
  version2: number;
  changes: PolicyChange[];
  summary: string;
  timestamp: string;
}

interface PolicyChange {
  field: string;
  oldValue: string;
  newValue: string;
  type: 'added' | 'removed' | 'modified';
}

interface PolicyChangeStats {
  totalVersions: number;
  changeTypeCounts: {
    created: number;
    updated: number;
    deleted: number;
    activated: number;
    deactivated: number;
  };
  averageChangesPerMonth: number;
  lastModified: string | null;
  mostActiveContributor: string | null;
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const policyVersioningService = new PolicyVersioningService();

// ============================================================================
// EXPORTS
// ============================================================================

export default policyVersioningService;
export type { PolicyVersionComparison, PolicyChange, PolicyChangeStats };
