import React, { useState, useEffect } from 'react';
import {
  Page,
  PageSection,
  PageSectionVariants,
  PageBreadcrumb,
  Breadcrumb,
  BreadcrumbItem,
  Title,
  TitleSizes,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardActions,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Badge,
  Alert,
  AlertVariant,
  Tabs,
  Tab,
  TabTitle,
  TabContent,
  Icon,
  Spinner,
  Bullseye,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateActions,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider
} from '@patternfly/react-core';
import {
  ShieldAltIcon,
  UserIcon,
  ServerIcon,
  DatabaseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TimesCircleIcon,
  QuestionCircleIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  TableIcon,
  ChartBarIcon
} from '@patternfly/react-icons';
import {
  PolicyEditor,
  RoleManager,
  PolicyMatrix,
  PolicySimulator
} from './index';
import { 
  Policy, 
  Role, 
  Permission,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  PolicySimulationRequest,
  PolicySimulationResult,
  CreateRoleRequest,
  UpdateRoleRequest
} from '../../types/rbac';

interface RBACDashboardProps {
  policies: Policy[];
  roles: Role[];
  permissions: Permission[];
  onCreatePolicy: (policy: Partial<Policy>) => Promise<void>;
  onUpdatePolicy: (policyId: string, policy: Partial<Policy>) => Promise<void>;
  onDeletePolicy: (policyId: string) => Promise<void>;
  onDuplicatePolicy: (policy: Policy) => Promise<void>;
  onCreateRole: (role: CreateRoleRequest) => Promise<void>;
  onUpdateRole: (roleId: string, role: UpdateRoleRequest) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onRunSimulation: (request: PolicySimulationRequest) => Promise<PolicySimulationResult>;
  onEvaluatePolicy: (request: PolicyEvaluationRequest) => Promise<PolicyEvaluationResult>;
  onExportPolicies: () => void;
  onImportPolicies: (policies: Policy[]) => void;
}

interface RBACDashboardState {
  activeTab: string;
  selectedPolicy: Policy | null;
  isEditingPolicy: boolean;
  showCreatePolicy: boolean;
}

const RBACDashboard: React.FC<RBACDashboardProps> = ({
  policies,
  roles,
  permissions,
  onCreatePolicy,
  onUpdatePolicy,
  onDeletePolicy,
  onDuplicatePolicy,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onRunSimulation,
  onEvaluatePolicy,
  onExportPolicies,
  onImportPolicies
}) => {
  const [state, setState] = useState<RBACDashboardState>({
    activeTab: 'overview',
    selectedPolicy: null,
    isEditingPolicy: false,
    showCreatePolicy: false
  });

  const activePolicies = policies.filter(p => p.status === 'active');
  const draftPolicies = policies.filter(p => p.status === 'draft');
  const inactivePolicies = policies.filter(p => p.status === 'inactive');
  const systemRoles = roles.filter(r => r.isSystem);
  const customRoles = roles.filter(r => !r.isSystem);

  const totalPermissions = permissions.length;
  const totalPolicies = policies.length;
  const totalRoles = roles.length;

  const handleCreatePolicy = async (policyData: Partial<Policy>) => {
    try {
      await onCreatePolicy(policyData);
      setState(prev => ({ ...prev, showCreatePolicy: false }));
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const handleUpdatePolicy = async (policyId: string, policyData: Partial<Policy>) => {
    try {
      await onUpdatePolicy(policyId, policyData);
      setState(prev => ({ ...prev, selectedPolicy: null, isEditingPolicy: false }));
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const handleEditPolicy = (policy: Policy) => {
    setState(prev => ({ ...prev, selectedPolicy: policy, isEditingPolicy: true }));
  };

  const handleClosePolicyEditor = () => {
    setState(prev => ({ ...prev, selectedPolicy: null, isEditingPolicy: false, showCreatePolicy: false }));
  };

  const renderOverview = () => (
    <Grid hasGutter>
      <GridItem span={12}>
        <Alert
          variant={AlertVariant.info}
          title="RBAC System Overview"
          className="pf-v5-u-mb-md"
        >
          <p>
            Welcome to the RBAC Dashboard. Here you can manage roles, policies, and test access control scenarios.
            The system currently has {totalPolicies} policies, {totalRoles} roles, and {totalPermissions} permissions configured.
          </p>
        </Alert>
      </GridItem>

      {/* Statistics Cards */}
      <GridItem span={3}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Icon>
                    <ShieldAltIcon />
                  </Icon>
                </FlexItem>
                <FlexItem>Policies</FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size={TitleSizes['2xl']}>
              {totalPolicies}
            </Title>
            <div className="pf-v5-u-mt-sm">
              <Badge isRead variant="success">{activePolicies.length} Active</Badge>
              <Badge isRead className="pf-v5-u-ml-sm">{draftPolicies.length} Draft</Badge>
              <Badge isRead className="pf-v5-u-ml-sm">{inactivePolicies.length} Inactive</Badge>
            </div>
          </CardBody>
          <CardActions>
            <Button
              variant={ButtonVariant.primary}
              onClick={() => setState(prev => ({ ...prev, showCreatePolicy: true }))}
              icon={<PlusIcon />}
            >
              Create Policy
            </Button>
          </CardActions>
        </Card>
      </GridItem>

      <GridItem span={3}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Icon>
                    <UserIcon />
                  </Icon>
                </FlexItem>
                <FlexItem>Roles</FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size={TitleSizes['2xl']}>
              {totalRoles}
            </Title>
            <div className="pf-v5-u-mt-sm">
              <Badge isRead variant="info">{systemRoles.length} System</Badge>
              <Badge isRead className="pf-v5-u-ml-sm">{customRoles.length} Custom</Badge>
            </div>
          </CardBody>
          <CardActions>
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'roles' }))}
            >
              Manage Roles
            </Button>
          </CardActions>
        </Card>
      </GridItem>

      <GridItem span={3}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Icon>
                    <ServerIcon />
                  </Icon>
                </FlexItem>
                <FlexItem>Permissions</FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size={TitleSizes['2xl']}>
              {totalPermissions}
            </Title>
            <div className="pf-v5-u-mt-sm">
              <Badge isRead>Available</Badge>
            </div>
          </CardBody>
          <CardActions>
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'roles' }))}
            >
              View Permissions
            </Button>
          </CardActions>
        </Card>
      </GridItem>

      <GridItem span={3}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Icon>
                    <ChartBarIcon />
                  </Icon>
                </FlexItem>
                <FlexItem>Coverage</FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size={TitleSizes['2xl']}>
              {activePolicies.length > 0 ? Math.round((activePolicies.length / totalPolicies) * 100) : 0}%
            </Title>
            <div className="pf-v5-u-mt-sm">
              <Badge isRead variant={activePolicies.length > 0 ? 'success' : 'warning'}>
                {activePolicies.length > 0 ? 'Active' : 'No Active Policies'}
              </Badge>
            </div>
          </CardBody>
          <CardActions>
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'policies' }))}
            >
              View Policies
            </Button>
          </CardActions>
        </Card>
      </GridItem>

      {/* Recent Activity */}
      <GridItem span={12}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody>
            {policies.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon icon={ShieldAltIcon} />
                <EmptyStateBody>
                  No policies have been created yet. Create your first policy to get started.
                </EmptyStateBody>
                <EmptyStateActions>
                  <Button
                    variant={ButtonVariant.primary}
                    onClick={() => setState(prev => ({ ...prev, showCreatePolicy: true }))}
                    icon={<PlusIcon />}
                  >
                    Create First Policy
                  </Button>
                </EmptyStateActions>
              </EmptyState>
            ) : (
              <div>
                <h4>Recent Policies</h4>
                <DescriptionList>
                  {policies.slice(0, 5).map(policy => (
                    <DescriptionListGroup key={policy.id}>
                      <DescriptionListTerm>
                        <Flex alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            <strong>{policy.displayName}</strong>
                          </FlexItem>
                          <FlexItem>
                            <Badge isRead variant={policy.effect === 'allow' ? 'success' : 'danger'}>
                              {policy.effect}
                            </Badge>
                          </FlexItem>
                          <FlexItem>
                            <Badge isRead variant={policy.status === 'active' ? 'success' : 'info'}>
                              {policy.status}
                            </Badge>
                          </FlexItem>
                        </Flex>
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {policy.description}
                        <div className="pf-v5-u-mt-sm">
                          <Button
                            variant={ButtonVariant.link}
                            onClick={() => handleEditPolicy(policy)}
                            icon={<EditIcon />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={ButtonVariant.link}
                            onClick={() => onDuplicatePolicy(policy)}
                            icon={<PlusIcon />}
                            className="pf-v5-u-ml-sm"
                          >
                            Duplicate
                          </Button>
                        </div>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </DescriptionList>
              </div>
            )}
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );

  const renderPolicies = () => (
    <div>
      {state.showCreatePolicy || state.isEditingPolicy ? (
        <PolicyEditor
          policy={state.selectedPolicy}
          onSave={state.isEditingPolicy ? 
            (policyData) => handleUpdatePolicy(state.selectedPolicy!.id, policyData) :
            handleCreatePolicy
          }
          onCancel={handleClosePolicyEditor}
          isEditing={state.isEditingPolicy}
        />
      ) : (
        <div>
          <Flex className="pf-v5-u-mb-md">
            <FlexItem>
              <Title headingLevel="h2" size={TitleSizes.xl}>
                Policy Management
              </Title>
            </FlexItem>
            <FlexItem>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => setState(prev => ({ ...prev, showCreatePolicy: true }))}
                icon={<PlusIcon />}
              >
                Create Policy
              </Button>
            </FlexItem>
          </Flex>

          <PolicyMatrix
            policies={policies}
            onEditPolicy={handleEditPolicy}
            onDeletePolicy={onDeletePolicy}
            onDuplicatePolicy={onDuplicatePolicy}
            onExportPolicies={onExportPolicies}
            onImportPolicies={onImportPolicies}
          />
        </div>
      )}
    </div>
  );

  const renderRoles = () => (
    <div>
      <Title headingLevel="h2" size={TitleSizes.xl} className="pf-v5-u-mb-md">
        Role Management
      </Title>
      <RoleManager
        roles={roles}
        permissions={permissions}
        onCreateRole={onCreateRole}
        onUpdateRole={onUpdateRole}
        onDeleteRole={onDeleteRole}
      />
    </div>
  );

  const renderSimulator = () => (
    <div>
      <Title headingLevel="h2" size={TitleSizes.xl} className="pf-v5-u-mb-md">
        Policy Simulator
      </Title>
      <PolicySimulator
        policies={policies}
        onRunSimulation={onRunSimulation}
        onEvaluatePolicy={onEvaluatePolicy}
      />
    </div>
  );

  return (
    <Page>
      <PageSection variant={PageSectionVariants.light}>
        <PageBreadcrumb>
          <Breadcrumb>
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
            <BreadcrumbItem isActive>RBAC Management</BreadcrumbItem>
          </Breadcrumb>
        </PageBreadcrumb>
        <Title headingLevel="h1" size={TitleSizes['2xl']} className="pf-v5-u-mb-md">
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Icon>
                <ShieldAltIcon />
              </Icon>
            </FlexItem>
            <FlexItem>RBAC Management</FlexItem>
          </Flex>
        </Title>
      </PageSection>

      <PageSection>
        <Tabs
          activeKey={state.activeTab}
          onSelect={(_, key) => setState(prev => ({ ...prev, activeTab: key as string }))}
          className="pf-v5-u-mb-md"
        >
          <Tab eventKey="overview" title={<TabTitle icon={<ChartBarIcon />}>Overview</TabTitle>}>
            <TabContent eventKey="overview" id="overview-tab-content">
              {renderOverview()}
            </TabContent>
          </Tab>
          <Tab eventKey="policies" title={<TabTitle icon={<ShieldAltIcon />}>Policies</TabTitle>}>
            <TabContent eventKey="policies" id="policies-tab-content">
              {renderPolicies()}
            </TabContent>
          </Tab>
          <Tab eventKey="roles" title={<TabTitle icon={<UserIcon />}>Roles</TabTitle>}>
            <TabContent eventKey="roles" id="roles-tab-content">
              {renderRoles()}
            </TabContent>
          </Tab>
          <Tab eventKey="simulator" title={<TabTitle icon={<PlayIcon />}>Simulator</TabTitle>}>
            <TabContent eventKey="simulator" id="simulator-tab-content">
              {renderSimulator()}
            </TabContent>
          </Tab>
        </Tabs>
      </PageSection>
    </Page>
  );
};

export default RBACDashboard;
