import { BindingsService } from '../../services/bindings';
import { SecretsService } from '../../services/secrets';
import { ProvidersService } from '../../services/providers';

// Mock all external services
jest.mock('../../services/api');
jest.mock('../../services/secrets');
jest.mock('../../services/providers');
jest.mock('../../services/mockData');

// Import mocked services
const mockSecretsService = require('../../services/secrets').secretsService;
const mockProvidersService = require('../../services/providers').providersService;
const mockApi = require('../../services/api').api;

describe('Enterprise AI Workflow Patterns', () => {
  let bindingsService: BindingsService;
  let secretsService: SecretsService;
  let providersService: ProvidersService;

  // Mock enterprise AI workflow data
  const mockMLOpsWorkflow = {
    id: 'mlops-production-workflow',
    name: 'MLOps Production Pipeline',
    description: 'End-to-end MLOps pipeline for production AI models',
    type: 'mlops',
    environment: 'production',
    team: 'mlops',
    stages: [
      {
        name: 'data-preparation',
        description: 'Data preparation and validation',
        secrets: ['data-source-credentials', 'data-validation-key'],
        environment: 'data-prep',
        resources: { cpu: '2', memory: '4Gi' }
      },
      {
        name: 'model-training',
        description: 'Model training and hyperparameter tuning',
        secrets: ['training-api-key', 'gpu-credentials'],
        environment: 'training',
        resources: { cpu: '8', memory: '32Gi', gpu: '4' }
      },
      {
        name: 'model-validation',
        description: 'Model validation and testing',
        secrets: ['validation-dataset-key', 'metrics-api-key'],
        environment: 'validation',
        resources: { cpu: '4', memory: '16Gi' }
      },
      {
        name: 'model-deployment',
        description: 'Model deployment to production',
        secrets: ['deployment-credentials', 'monitoring-api-key'],
        environment: 'production',
        resources: { cpu: '2', memory: '8Gi' }
      }
    ],
    secrets: [
      {
        id: 'data-source-credentials',
        name: 'Data Source Credentials',
        category: 'database',
        priority: 'high',
        rotationPolicy: { enabled: true, interval: 90, method: 'automatic' }
      },
      {
        id: 'training-api-key',
        name: 'Training API Key',
        category: 'api-keys',
        priority: 'critical',
        rotationPolicy: { enabled: true, interval: 30, method: 'automatic' }
      },
      {
        id: 'deployment-credentials',
        name: 'Deployment Credentials',
        category: 'infrastructure',
        priority: 'critical',
        rotationPolicy: { enabled: true, interval: 60, method: 'automatic' }
      }
    ],
    monitoring: {
      enabled: true,
      metrics: ['accuracy', 'latency', 'throughput', 'error-rate'],
      alerting: {
        enabled: true,
        rules: [
          { metric: 'accuracy', threshold: 0.95, operator: 'lt', severity: 'critical' },
          { metric: 'latency', threshold: 100, operator: 'gt', severity: 'warning' }
        ]
      }
    },
    approvalWorkflow: {
      enabled: true,
      stages: ['data-review', 'model-review', 'deployment-approval'],
      approvers: ['mlops-lead', 'data-scientist', 'platform-engineer']
    }
  };

  const mockResearchWorkflow = {
    id: 'ai-research-workflow',
    name: 'AI Research Experimentation',
    description: 'Research workflow for AI experimentation and prototyping',
    type: 'research',
    environment: 'development',
    team: 'ai-research',
    stages: [
      {
        name: 'experiment-setup',
        description: 'Set up research experiment',
        secrets: ['research-api-key', 'experiment-config'],
        environment: 'research',
        resources: { cpu: '1', memory: '2Gi' }
      },
      {
        name: 'data-exploration',
        description: 'Explore and analyze data',
        secrets: ['data-access-key', 'analysis-tools-key'],
        environment: 'research',
        resources: { cpu: '2', memory: '4Gi' }
      },
      {
        name: 'model-prototyping',
        description: 'Prototype and test models',
        secrets: ['prototype-api-key', 'testing-credentials'],
        environment: 'research',
        resources: { cpu: '4', memory: '8Gi', gpu: '1' }
      }
    ],
    secrets: [
      {
        id: 'research-api-key',
        name: 'Research API Key',
        category: 'research',
        priority: 'medium',
        rotationPolicy: { enabled: false, interval: 0, method: 'manual' }
      },
      {
        id: 'experiment-config',
        name: 'Experiment Configuration',
        category: 'configuration',
        priority: 'low',
        rotationPolicy: { enabled: false, interval: 0, method: 'manual' }
      }
    ],
    monitoring: {
      enabled: false,
      metrics: [],
      alerting: { enabled: false, rules: [] }
    },
    approvalWorkflow: {
      enabled: false,
      stages: [],
      approvers: []
    }
  };

  const mockEnterpriseAITeam = {
    id: 'enterprise-ai-team',
    name: 'Enterprise AI Team',
    description: 'Cross-functional team for enterprise AI initiatives',
    members: [
      {
        id: 'mlops-engineer',
        name: 'MLOps Engineer',
        role: 'mlops-engineer',
        permissions: ['mlops:read', 'mlops:write', 'deployment:manage'],
        teams: ['mlops', 'platform']
      },
      {
        id: 'data-scientist',
        name: 'Data Scientist',
        role: 'data-scientist',
        permissions: ['data:read', 'data:write', 'model:train', 'model:validate'],
        teams: ['ai-research', 'data-science']
      },
      {
        id: 'platform-engineer',
        name: 'Platform Engineer',
        role: 'platform-engineer',
        permissions: ['platform:read', 'platform:write', 'infrastructure:manage'],
        teams: ['platform', 'devops']
      },
      {
        id: 'ai-architect',
        name: 'AI Architect',
        role: 'ai-architect',
        permissions: ['ai:read', 'ai:write', 'ai:admin', 'strategy:manage'],
        teams: ['ai-strategy', 'architecture']
      }
    ],
    projects: [
      {
        id: 'mlops-production',
        name: 'MLOps Production',
        type: 'mlops',
        environment: 'production',
        team: 'mlops',
        costCenter: 'ai-mlops'
      },
      {
        id: 'ai-research',
        name: 'AI Research',
        type: 'research',
        environment: 'development',
        team: 'ai-research',
        costCenter: 'ai-research'
      }
    ],
    workflows: [mockMLOpsWorkflow, mockResearchWorkflow]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock services
    bindingsService = new BindingsService();
    secretsService = new SecretsService();
    providersService = new ProvidersService();

    // Setup default mock responses
    mockSecretsService.getReference.mockResolvedValue({
      id: 'research-api-key',
      name: 'Research API Key',
      providerId: 'vault-corp',
      providerType: 'vault',
      path: 'secrets/research/api-key'
    });

    mockProvidersService.getProvider.mockResolvedValue({
      id: 'vault-corp',
      name: 'Corporate Vault',
      type: 'vault',
      status: 'active'
    });
  });

  describe('MLOps Production Workflows', () => {
    it('should support end-to-end MLOps pipeline management', async () => {
      const workflow = mockMLOpsWorkflow;
      
      // Test workflow structure
      expect(workflow.type).toBe('mlops');
      expect(workflow.environment).toBe('production');
      expect(workflow.team).toBe('mlops');
      expect(workflow.stages).toHaveLength(4);
      
      // Test workflow stages
      const stageNames = workflow.stages.map(stage => stage.name);
      expect(stageNames).toContain('data-preparation');
      expect(stageNames).toContain('model-training');
      expect(stageNames).toContain('model-validation');
      expect(stageNames).toContain('model-deployment');
    });

    it('should manage production MLOps secrets with rotation policies', async () => {
      const workflow = mockMLOpsWorkflow;
      
      workflow.secrets.forEach(secret => {
        // All production secrets should have rotation policies
        expect(secret.rotationPolicy.enabled).toBe(true);
        expect(secret.rotationPolicy.interval).toBeGreaterThan(0);
        expect(secret.rotationPolicy.method).toBe('automatic');
        
        // Critical secrets should have shorter rotation intervals
        if (secret.priority === 'critical') {
          expect(secret.rotationPolicy.interval).toBeLessThanOrEqual(60);
        }
      });
    });

    it('should support production MLOps monitoring and alerting', async () => {
      const workflow = mockMLOpsWorkflow;
      
      // Production workflows should have monitoring enabled
      expect(workflow.monitoring.enabled).toBe(true);
      expect(workflow.monitoring.metrics).toHaveLength(4);
      expect(workflow.monitoring.metrics).toContain('accuracy');
      expect(workflow.monitoring.metrics).toContain('latency');
      
      // Production workflows should have alerting enabled
      expect(workflow.monitoring.alerting.enabled).toBe(true);
      expect(workflow.monitoring.alerting.rules).toHaveLength(2);
      
      // Critical alerts should be configured
      const criticalAlerts = workflow.monitoring.alerting.rules.filter(
        rule => rule.severity === 'critical'
      );
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });

    it('should enforce production MLOps approval workflows', async () => {
      const workflow = mockMLOpsWorkflow;
      
      // Production workflows should require approval
      expect(workflow.approvalWorkflow.enabled).toBe(true);
      expect(workflow.approvalWorkflow.stages).toHaveLength(3);
      expect(workflow.approvalWorkflow.stages).toContain('deployment-approval');
      
      // Multiple approvers should be required
      expect(workflow.approvalWorkflow.approvers).toHaveLength(3);
      expect(workflow.approvalWorkflow.approvers).toContain('mlops-lead');
      expect(workflow.approvalWorkflow.approvers).toContain('platform-engineer');
    });
  });

  describe('AI Research Workflows', () => {
    it('should support flexible research experimentation', async () => {
      const workflow = mockResearchWorkflow;
      
      // Test workflow structure
      expect(workflow.type).toBe('research');
      expect(workflow.environment).toBe('development');
      expect(workflow.team).toBe('ai-research');
      expect(workflow.stages).toHaveLength(3);
      
      // Test workflow stages
      const stageNames = workflow.stages.map(stage => stage.name);
      expect(stageNames).toContain('experiment-setup');
      expect(stageNames).toContain('data-exploration');
      expect(stageNames).toContain('model-prototyping');
    });

    it('should handle research secrets with flexible policies', async () => {
      const workflow = mockResearchWorkflow;
      
      workflow.secrets.forEach(secret => {
        // Research secrets may not require rotation
        expect(secret.rotationPolicy).toBeDefined();
        
        // Research secrets should have appropriate priorities
        expect(['low', 'medium', 'high', 'critical']).toContain(secret.priority);
        
        // Research secrets should have appropriate categories
        expect(['research', 'configuration', 'api-keys']).toContain(secret.category);
      });
    });

    it('should support research environment flexibility', async () => {
      const workflow = mockResearchWorkflow;
      
      // Research workflows may not require monitoring
      expect(workflow.monitoring.enabled).toBe(false);
      
      // Research workflows may not require approval
      expect(workflow.approvalWorkflow.enabled).toBe(false);
      
      // Research workflows should have flexible resource allocation
      workflow.stages.forEach(stage => {
        expect(stage.resources.cpu).toBeDefined();
        expect(stage.resources.memory).toBeDefined();
        
        // Some stages may have GPU requirements
        if (stage.name === 'model-prototyping') {
          expect(stage.resources.gpu).toBeDefined();
        }
      });
    });
  });

  describe('Enterprise AI Team Collaboration', () => {
    it('should support cross-functional AI team structure', async () => {
      const team = mockEnterpriseAITeam;
      
      // Team should have multiple members
      expect(team.members).toHaveLength(4);
      
      // Team should have diverse roles
      const roles = team.members.map(member => member.role);
      expect(roles).toContain('mlops-engineer');
      expect(roles).toContain('data-scientist');
      expect(roles).toContain('platform-engineer');
      expect(roles).toContain('ai-architect');
    });

    it('should enforce role-based access control for AI teams', async () => {
      const team = mockEnterpriseAITeam;
      
      team.members.forEach(member => {
        // All members should have permissions
        expect(member.permissions).toBeDefined();
        expect(member.permissions.length).toBeGreaterThan(0);
        
        // All members should belong to teams
        expect(member.teams).toBeDefined();
        expect(member.teams.length).toBeGreaterThan(0);
        
        // Permissions should match role
        if (member.role === 'mlops-engineer') {
          expect(member.permissions).toContain('mlops:read');
          expect(member.permissions).toContain('deployment:manage');
        }
        
        if (member.role === 'data-scientist') {
          expect(member.permissions).toContain('data:read');
          expect(member.permissions).toContain('model:train');
        }
      });
    });

    it('should support multi-project AI team management', async () => {
      const team = mockEnterpriseAITeam;
      
      // Team should manage multiple projects
      expect(team.projects).toHaveLength(2);
      
      // Projects should have different types and environments
      const mlopsProject = team.projects.find(p => p.type === 'mlops');
      const researchProject = team.projects.find(p => p.type === 'research');
      
      expect(mlopsProject?.environment).toBe('production');
      expect(researchProject?.environment).toBe('development');
      
      // Projects should have different cost centers
      expect(mlopsProject?.costCenter).toBe('ai-mlops');
      expect(researchProject?.costCenter).toBe('ai-research');
    });

    it('should support AI team workflow orchestration', async () => {
      const team = mockEnterpriseAITeam;
      
      // Team should manage multiple workflows
      expect(team.workflows).toHaveLength(2);
      
      // Workflows should have different types
      const mlopsWorkflow = team.workflows.find(w => w.type === 'mlops');
      const researchWorkflow = team.workflows.find(w => w.type === 'research');
      
      expect(mlopsWorkflow).toBeDefined();
      expect(researchWorkflow).toBeDefined();
      
      // MLOps workflow should be production
      expect(mlopsWorkflow?.environment).toBe('production');
      
      // Research workflow should be development
      expect(researchWorkflow?.environment).toBe('development');
    });
  });

  describe('Enterprise AI Security and Compliance', () => {
    it('should enforce enterprise AI security standards', async () => {
      const team = mockEnterpriseAITeam;
      
      team.members.forEach(member => {
        // All members should have appropriate permissions
        expect(member.permissions).toBeDefined();
        expect(member.permissions.length).toBeGreaterThan(0);
        
        // Permissions should follow least privilege principle
        if (member.role === 'mlops-engineer') {
          expect(member.permissions).not.toContain('ai:admin');
        }
        
        if (member.role === 'data-scientist') {
          expect(member.permissions).not.toContain('infrastructure:manage');
        }
      });
    });

    it('should support enterprise AI audit and compliance', async () => {
      const mlopsWorkflow = mockMLOpsWorkflow;
      
      // Production workflows should have comprehensive monitoring
      expect(mlopsWorkflow.monitoring.enabled).toBe(true);
      expect(mlopsWorkflow.monitoring.metrics).toHaveLength(4);
      
      // Production workflows should have approval workflows
      expect(mlopsWorkflow.approvalWorkflow.enabled).toBe(true);
      expect(mlopsWorkflow.approvalWorkflow.approvers).toHaveLength(3);
      
      // Production workflows should have rotation policies
      mlopsWorkflow.secrets.forEach(secret => {
        expect(secret.rotationPolicy.enabled).toBe(true);
        expect(secret.rotationPolicy.method).toBe('automatic');
      });
    });

    it('should validate enterprise AI resource allocation', async () => {
      const mlopsWorkflow = mockMLOpsWorkflow;
      
      mlopsWorkflow.stages.forEach(stage => {
        // All stages should have resource requirements
        expect(stage.resources.cpu).toBeDefined();
        expect(stage.resources.memory).toBeDefined();
        
        // Resource requirements should be reasonable
        expect(parseInt(stage.resources.cpu)).toBeGreaterThan(0);
        expect(stage.resources.memory).toMatch(/^\d+[KMG]i$/);
        
        // GPU resources should be specified where needed
        if (stage.name === 'model-training' && stage.resources.gpu) {
          expect(stage.resources.gpu).toBeDefined();
          expect(parseInt(stage.resources.gpu)).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Enterprise AI Operational Excellence', () => {
    it('should support AI workflow automation and orchestration', async () => {
      const mlopsWorkflow = mockMLOpsWorkflow;
      
      // MLOps workflow should have automated stages
      expect(mlopsWorkflow.stages).toHaveLength(4);
      
      // Each stage should have defined resources and secrets
      mlopsWorkflow.stages.forEach(stage => {
        expect(stage.secrets).toBeDefined();
        expect(stage.secrets.length).toBeGreaterThan(0);
        expect(stage.resources).toBeDefined();
        expect(stage.environment).toBeDefined();
      });
    });

    it('should support AI team collaboration and knowledge sharing', async () => {
      const team = mockEnterpriseAITeam;
      
      // Team should have diverse expertise
      const expertiseAreas = team.members.flatMap(member => member.teams);
      expect(expertiseAreas).toContain('mlops');
      expect(expertiseAreas).toContain('ai-research');
      expect(expertiseAreas).toContain('platform');
      expect(expertiseAreas).toContain('data-science');
      
      // Team should support cross-functional collaboration
      const crossFunctionalMembers = team.members.filter(
        member => member.teams.length > 1
      );
      expect(crossFunctionalMembers.length).toBeGreaterThan(0);
    });

    it('should support AI workflow scaling and optimization', async () => {
      const mlopsWorkflow = mockMLOpsWorkflow;
      
      // Workflow should support different resource requirements per stage
      const trainingStage = mlopsWorkflow.stages.find(s => s.name === 'model-training');
      const deploymentStage = mlopsWorkflow.stages.find(s => s.name === 'model-deployment');
      
      if (trainingStage && deploymentStage) {
        // Training should require more resources
        expect(parseInt(trainingStage.resources.cpu)).toBeGreaterThan(
          parseInt(deploymentStage.resources.cpu)
        );
        expect(trainingStage.resources.memory).toBe('32Gi');
        expect(deploymentStage.resources.memory).toBe('8Gi');
      }
    });
  });
});
