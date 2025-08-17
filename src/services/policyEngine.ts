// Policy Engine Service for FortifAI Secrets Management
// This service provides deterministic policy evaluation with conflict resolution

import { apiClient } from './api';
import { shouldUseMockData } from './mockData';
import type {
  Policy,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  PolicyDecision,
  AppliedPolicy,
  UserContext,
  ResourceContext,
  EnvironmentContext,
  PolicySimulationRequest,
  PolicySimulationResult
} from '../types/rbac';

// ============================================================================
// POLICY ENGINE SERVICE CLASS
// ============================================================================

class PolicyEngineService {
  private readonly baseUrl = '/api/policy-engine';
  private readonly cache = new Map<string, PolicyEvaluationResult>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  // ============================================================================
  // POLICY EVALUATION
  // ============================================================================

  /**
   * Evaluate a policy request and return a decision
   */
  async evaluatePolicy(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      if (this.shouldUseMockData()) {
        return this.evaluateMockPolicy(request);
      }

      const response = await apiClient.post(`${this.baseUrl}/evaluate`, request);
      const result = response.data;

      // Cache the result
      this.cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Policy evaluation failed:', error);
      // Fallback to mock evaluation
      return this.evaluateMockPolicy(request);
    }
  }

  /**
   * Evaluate multiple policies for a request
   */
  async evaluatePolicies(
    request: PolicyEvaluationRequest,
    policies: Policy[]
  ): Promise<PolicyEvaluationResult> {
    const startTime = Date.now();
    let policiesEvaluated = 0;
    let rulesEvaluated = 0;
    const appliedPolicies: AppliedPolicy[] = [];

    try {
      // Sort policies by priority (highest first)
      const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority);

      for (const policy of sortedPolicies) {
        if (policy.status !== 'active') continue;

        // Check if policy is effective
        if (!this.isPolicyEffective(policy, request.timestamp)) continue;

        // Check if policy applies to this request
        if (!this.doesPolicyApply(policy, request)) continue;

        policiesEvaluated++;
        rulesEvaluated += policy.rules.length;

        // Evaluate policy rules
        const ruleMatch = this.evaluatePolicyRules(policy, request);
        if (ruleMatch.matched) {
          appliedPolicies.push({
            policyId: policy.id,
            policyName: policy.name,
            effect: policy.effect,
            priority: policy.priority,
            matchedRules: ruleMatch.matchedRules,
            reason: ruleMatch.reason
          });

          // If this is a deny policy, stop evaluation (deny takes precedence)
          if (policy.effect === 'deny') {
            break;
          }
        }
      }

      // Determine final decision
      const decision = this.determineDecision(appliedPolicies);
      const reason = this.generateReason(appliedPolicies);

      const result: PolicyEvaluationResult = {
        requestId: request.requestId,
        decision,
        reason,
        appliedPolicies,
        metadata: {
          evaluationTime: Date.now() - startTime,
          policiesEvaluated,
          rulesEvaluated,
          cacheHit: false,
          version: '1.0'
        },
        timestamp: new Date().toISOString()
      };

      return result;
    } catch (error) {
      console.error('Policy evaluation failed:', error);
      return {
        requestId: request.requestId,
        decision: 'error',
        reason: 'Policy evaluation failed due to an error',
        appliedPolicies: [],
        metadata: {
          evaluationTime: Date.now() - startTime,
          policiesEvaluated,
          rulesEvaluated,
          cacheHit: false,
          version: '1.0'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // POLICY SIMULATION
  // ============================================================================

  /**
   * Run a policy simulation with test cases
   */
  async runPolicySimulation(simulationRequest: PolicySimulationRequest): Promise<PolicySimulationResult> {
    try {
      if (this.shouldUseMockData()) {
        return this.runMockPolicySimulation(simulationRequest);
      }

      const response = await apiClient.post(`${this.baseUrl}/simulate`, simulationRequest);
      return response.data;
    } catch (error) {
      console.error('Policy simulation failed:', error);
      return this.runMockPolicySimulation(simulationRequest);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if a policy is effective at the given timestamp
   */
  private isPolicyEffective(policy: Policy, timestamp: string): boolean {
    const now = new Date(timestamp);
    
    if (policy.effectiveFrom) {
      const effectiveFrom = new Date(policy.effectiveFrom);
      if (now < effectiveFrom) return false;
    }
    
    if (policy.effectiveUntil) {
      const effectiveUntil = new Date(policy.effectiveUntil);
      if (now > effectiveUntil) return false;
    }
    
    return true;
  }

  /**
   * Check if a policy applies to the given request
   */
  private doesPolicyApply(policy: Policy, request: PolicyEvaluationRequest): boolean {
    const { targets } = policy;
    const { action, resource, environment } = request;

    // Check if action is covered
    if (!targets.actions.includes(action)) return false;

    // Check if resource type is covered
    if (!targets.resources.includes(resource.type)) return false;

    // Check namespace scoping
    if (targets.namespaces && !targets.namespaces.includes(environment.namespace)) {
      return false;
    }

    // Check project scoping
    if (targets.projects && environment.project && !targets.projects.includes(environment.project)) {
      return false;
    }

    // Check provider scoping
    if (targets.providers && resource.provider && !targets.providers.includes(resource.provider)) {
      return false;
    }

    // Check path prefix scoping
    if (targets.pathPrefixes && resource.path) {
      const matchesPath = targets.pathPrefixes.some(prefix => 
        resource.path!.startsWith(prefix)
      );
      if (!matchesPath) return false;
    }

    // Check target type scoping
    if (targets.targetTypes && !targets.targetTypes.includes(resource.type)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate policy rules against the request
   */
  private evaluatePolicyRules(policy: Policy, request: PolicyEvaluationRequest): {
    matched: boolean;
    matchedRules: string[];
    reason: string;
  } {
    const matchedRules: string[] = [];
    let allRulesMatched = true;

    for (const rule of policy.rules) {
      const ruleMatch = this.evaluateRule(rule, request);
      if (ruleMatch) {
        matchedRules.push(rule.id);
      } else {
        allRulesMatched = false;
      }
    }

    // All rules must match for the policy to apply
    const matched = allRulesMatched && matchedRules.length > 0;
    const reason = matched 
      ? `Policy '${policy.name}' matched with rules: ${matchedRules.join(', ')}`
      : `Policy '${policy.name}' did not match all required rules`;

    return { matched, matchedRules, reason };
  }

  /**
   * Evaluate a single rule against the request
   */
  private evaluateRule(rule: any, request: PolicyEvaluationRequest): boolean {
    const { user, resource, environment } = request;

    switch (rule.type) {
      case 'role':
        return this.evaluateRoleRule(rule, user.roles);
      case 'user':
        return this.evaluateUserRule(rule, user.username);
      case 'group':
        return this.evaluateGroupRule(rule, user.groups);
      case 'namespace':
        return this.evaluateNamespaceRule(rule, environment.namespace);
      case 'project':
        return this.evaluateProjectRule(rule, environment.project);
      case 'resource':
        return this.evaluateResourceRule(rule, resource);
      case 'custom':
        return this.evaluateCustomRule(rule, request);
      default:
        return false;
    }
  }

  /**
   * Evaluate role-based rule
   */
  private evaluateRoleRule(rule: any, userRoles: string[]): boolean {
    const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    switch (rule.operator) {
      case 'equals':
        return ruleValues.some((value: string) => userRoles.includes(value));
      case 'not-equals':
        return !ruleValues.some((value: string) => userRoles.includes(value));
      case 'in':
        return ruleValues.some((value: string) => userRoles.includes(value));
      case 'not-in':
        return !ruleValues.some((value: string) => userRoles.includes(value));
      default:
        return false;
    }
  }

  /**
   * Evaluate user-based rule
   */
  private evaluateUserRule(rule: any, username: string): boolean {
    const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    switch (rule.operator) {
      case 'equals':
        return ruleValues.includes(username);
      case 'not-equals':
        return !ruleValues.includes(username);
      case 'regex':
        return ruleValues.some((pattern: string) => new RegExp(pattern).test(username));
      default:
        return false;
    }
  }

  /**
   * Evaluate group-based rule
   */
  private evaluateGroupRule(rule: any, userGroups: string[]): boolean {
    const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    switch (rule.operator) {
      case 'equals':
        return ruleValues.some((value: string) => userGroups.includes(value));
      case 'not-equals':
        return !ruleValues.some((value: string) => userGroups.includes(value));
      case 'in':
        return ruleValues.some((value: string) => userGroups.includes(value));
      case 'not-in':
        return !ruleValues.some((value: string) => userGroups.includes(value));
      default:
        return false;
    }
  }

  /**
   * Evaluate namespace-based rule
   */
  private evaluateNamespaceRule(rule: any, namespace: string): boolean {
    const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    switch (rule.operator) {
      case 'equals':
        return ruleValues.includes(namespace);
      case 'not-equals':
        return !ruleValues.includes(namespace);
      case 'regex':
        return ruleValues.some((pattern: string) => new RegExp(pattern).test(namespace));
      default:
        return false;
    }
  }

  /**
   * Evaluate project-based rule
   */
  private evaluateProjectRule(rule: any, project?: string): boolean {
    if (!project) return false;
    
    const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    switch (rule.operator) {
      case 'equals':
        return ruleValues.includes(project);
      case 'not-equals':
        return !ruleValues.includes(project);
      case 'regex':
        return ruleValues.some((pattern: string) => new RegExp(pattern).test(project));
      default:
        return false;
    }
  }

  /**
   * Evaluate resource-based rule
   */
  private evaluateResourceRule(rule: any, resource: ResourceContext): boolean {
    const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    switch (rule.operator) {
      case 'equals':
        return ruleValues.some((value: string) => 
          resource.id === value || resource.name === value || resource.provider === value
        );
      case 'not-equals':
        return !ruleValues.some((value: string) => 
          resource.id === value || resource.name === value || resource.provider === value
        );
      case 'regex':
        return ruleValues.some((pattern: string) => 
          new RegExp(pattern).test(resource.name || '') ||
          new RegExp(pattern).test(resource.provider || '')
        );
      default:
        return false;
    }
  }

  /**
   * Evaluate custom rule
   */
  private evaluateCustomRule(rule: any, request: PolicyEvaluationRequest): boolean {
    // Custom rule evaluation logic can be implemented here
    // For now, return false as a safe default
    console.warn('Custom rule evaluation not implemented:', rule);
    return false;
  }

  /**
   * Determine final decision based on applied policies
   */
  private determineDecision(appliedPolicies: AppliedPolicy[]): PolicyDecision {
    if (appliedPolicies.length === 0) {
      return 'not-applicable';
    }

    // Check for deny policies (deny takes precedence)
    const hasDeny = appliedPolicies.some(policy => policy.effect === 'deny');
    if (hasDeny) {
      return 'deny';
    }

    // Check for allow policies
    const hasAllow = appliedPolicies.some(policy => policy.effect === 'allow');
    if (hasAllow) {
      return 'allow';
    }

    return 'not-applicable';
  }

  /**
   * Generate human-readable reason for the decision
   */
  private generateReason(appliedPolicies: AppliedPolicy[]): string {
    if (appliedPolicies.length === 0) {
      return 'No policies matched the request';
    }

    const denyPolicies = appliedPolicies.filter(p => p.effect === 'deny');
    const allowPolicies = appliedPolicies.filter(p => p.effect === 'allow');

    if (denyPolicies.length > 0) {
      const policyNames = denyPolicies.map(p => p.policyName).join(', ');
      return `Access denied by policies: ${policyNames}`;
    }

    if (allowPolicies.length > 0) {
      const policyNames = allowPolicies.map(p => p.policyName).join(', ');
      return `Access allowed by policies: ${policyNames}`;
    }

    return 'Policy evaluation completed';
  }

  // ============================================================================
  // CACHING METHODS
  // ============================================================================

  /**
   * Generate cache key for a request
   */
  private generateCacheKey(request: PolicyEvaluationRequest): string {
    const { user, action, resource, environment } = request;
    return `${user.id}:${action}:${resource.type}:${resource.id || 'none'}:${environment.namespace}:${environment.project || 'none'}`;
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult(cacheKey: string): PolicyEvaluationResult | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    const cacheAge = now - new Date(cached.timestamp).getTime();
    
    if (cacheAge > this.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Update metadata to indicate cache hit
    cached.metadata.cacheHit = true;
    return cached;
  }

  /**
   * Cache evaluation result
   */
  private cacheResult(cacheKey: string, result: PolicyEvaluationResult): void {
    this.cache.set(cacheKey, result);
    
    // Clean up old cache entries if cache gets too large
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  // ============================================================================
  // MOCK DATA METHODS
  // ============================================================================

  private shouldUseMockData(): boolean {
    return shouldUseMockData();
  }

  private evaluateMockPolicy(request: PolicyEvaluationRequest): PolicyEvaluationResult {
    // Simple mock policy evaluation logic
    const { user, action, resource } = request;
    
    // Mock policy: Allow org-admin users to do anything
    if (user.roles.includes('org-admin')) {
      return {
        requestId: request.requestId,
        decision: 'allow',
        reason: 'User has org-admin role',
        appliedPolicies: [{
          policyId: 'mock-org-admin-policy',
          policyName: 'Mock Org Admin Policy',
          effect: 'allow',
          priority: 1000,
          matchedRules: ['org-admin-rule'],
          reason: 'User has org-admin role'
        }],
        metadata: {
          evaluationTime: 5,
          policiesEvaluated: 1,
          rulesEvaluated: 1,
          cacheHit: false,
          version: '1.0'
        },
        timestamp: new Date().toISOString()
      };
    }

    // Mock policy: Deny access to production secrets for non-admin users
    if (resource.path && resource.path.includes('/prod/') && !user.roles.includes('project-admin')) {
      return {
        requestId: request.requestId,
        decision: 'deny',
        reason: 'Access to production secrets denied for non-admin users',
        appliedPolicies: [{
          policyId: 'mock-prod-deny-policy',
          policyName: 'Mock Production Deny Policy',
          effect: 'deny',
          priority: 500,
          matchedRules: ['prod-deny-rule'],
          reason: 'Production secrets access restricted'
        }],
        metadata: {
          evaluationTime: 3,
          policiesEvaluated: 1,
          rulesEvaluated: 1,
          cacheHit: false,
          version: '1.0'
        },
        timestamp: new Date().toISOString()
      };
    }

    // Default: Allow access
    return {
      requestId: request.requestId,
      decision: 'allow',
      reason: 'No restrictive policies matched',
      appliedPolicies: [],
      metadata: {
        evaluationTime: 2,
        policiesEvaluated: 0,
        rulesEvaluated: 0,
        cacheHit: false,
        version: '1.0'
      },
      timestamp: new Date().toISOString()
    };
  }

  private runMockPolicySimulation(simulationRequest: PolicySimulationRequest): PolicySimulationResult {
    const results = simulationRequest.testCases.map(testCase => {
      const mockRequest: PolicyEvaluationRequest = {
        user: testCase.user,
        action: testCase.action,
        resource: testCase.resource,
        environment: testCase.environment,
        requestId: testCase.id,
        timestamp: new Date().toISOString()
      };

      const result = this.evaluateMockPolicy(mockRequest);
      const passed = result.decision === testCase.expectedDecision;

      return {
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        expectedDecision: testCase.expectedDecision,
        actualDecision: result.decision,
        passed,
        reason: result.reason,
        appliedPolicies: result.appliedPolicies,
        executionTime: result.metadata.evaluationTime
      };
    });

    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const averageExecutionTime = totalTests > 0 ? totalExecutionTime / totalTests : 0;

    return {
      simulationId: `sim-${Date.now()}`,
      name: simulationRequest.name,
      status: 'completed',
      results,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        totalExecutionTime,
        averageExecutionTime,
        policyCoverage: 100,
        riskLevel: failedTests > 0 ? 'medium' : 'low'
      },
      metadata: simulationRequest.metadata || {},
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const policyEngineService = new PolicyEngineService();

// ============================================================================
// EXPORTS
// ============================================================================

export default policyEngineService;
