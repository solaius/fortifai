import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardHeader, CardTitle, CardBody, CardFooter, Button, ButtonVariant, Grid, GridItem,
  Flex, FlexItem, TextInput, TextArea, Select, SelectOption, ButtonVariant as SelectVariant, Badge,
  Alert, AlertVariant, Icon, Modal, ModalVariant, Form, FormGroup, FormSection, Divider,
  Tabs, Tab, TabTitle, TabContent, EmptyState, EmptyStateIcon, EmptyStateBody, EmptyStateActions,
  DescriptionList, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm
} from '@patternfly/react-core';
import {
  Table, TableHeader, TableBody, TableVariant, Th, Td, Tr, ActionsColumn, IAction
} from '@patternfly/react-table';
import { PlusIcon, TrashIcon, EyeIcon, PlayIcon } from '@patternfly/react-icons';
import { 
  Policy, 
  PolicyEvaluationRequest, 
  PolicyEvaluationResult, 
  PolicySimulationRequest, 
  PolicySimulationResult,
  UserContext,
  ResourceContext,
  EnvironmentContext
} from '../../types/rbac';

interface PolicySimulatorProps {
  policies: Policy[];
  onRunSimulation: (request: PolicySimulationRequest) => Promise<PolicySimulationResult>;
  onEvaluatePolicy: (request: PolicyEvaluationRequest) => Promise<PolicyEvaluationResult>;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  user: UserContext;
  action: string;
  resource: ResourceContext;
  environment: EnvironmentContext;
  expectedDecision: 'allow' | 'deny' | 'unknown';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: PolicyEvaluationResult;
  error?: string;
}

interface PolicySimulatorState {
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  isRunning: boolean;
  showCreateModal: boolean;
  showResultsModal: boolean;
  currentResults: PolicySimulationResult | null;
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const PolicySimulator: React.FC<PolicySimulatorProps> = ({
  policies,
  onRunSimulation,
  onEvaluatePolicy
}) => {
  const [state, setState] = useState<PolicySimulatorState>({
    testCases: [],
    selectedTestCase: null,
    isRunning: false,
    showCreateModal: false,
    showResultsModal: false,
    currentResults: null,
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  });

  const [newTestCase, setNewTestCase] = useState<Partial<TestCase>>({
    name: '',
    description: '',
    user: {
      id: '',
      username: '',
      email: '',
      roles: [],
      groups: [],
      attributes: {}
    },
    action: '',
    resource: {
      type: '',
      path: '',
      namespace: '',
      project: '',
      attributes: {}
    },
    environment: {
      environment: 'development',
      time: new Date().toISOString(),
      location: '',
      risk: 'low',
      attributes: {}
    },
    expectedDecision: 'unknown'
  });

  const resourceTypes = [
    'secrets',
    'bindings',
    'providers',
    'policies',
    'roles',
    'permissions',
    'mcp-servers',
    'notebooks',
    'jobs',
    'pipelines'
  ];

  const actionTypes = [
    'read',
    'write',
    'create',
    'delete',
    'bind',
    'unbind',
    'manage',
    'approve',
    'audit'
  ];

  const environmentTypes = [
    'development',
    'staging',
    'production',
    'testing'
  ];

  const riskLevels = [
    'low',
    'medium',
    'high',
    'critical'
  ];

  const filteredTestCases = useMemo(() => {
    let filtered = state.testCases.filter(testCase => {
      const matchesSearch = testCase.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           testCase.description.toLowerCase().includes(state.searchTerm.toLowerCase());
      
      const matchesStatus = state.statusFilter === 'all' || testCase.status === state.statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort test cases
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'expectedDecision':
          comparison = a.expectedDecision.localeCompare(b.expectedDecision);
          break;
        case 'createdAt':
          comparison = new Date(b.id).getTime() - new Date(a.id).getTime();
          break;
      }
      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.testCases, state.searchTerm, state.statusFilter, state.sortBy, state.sortDirection]);

  const createTestCase = () => {
    if (!newTestCase.name || !newTestCase.action || !newTestCase.resource?.type) {
      return;
    }

    const testCase: TestCase = {
      id: `test-${Date.now()}`,
      name: newTestCase.name!,
      description: newTestCase.description || '',
      user: newTestCase.user!,
      action: newTestCase.action!,
      resource: newTestCase.resource!,
      environment: newTestCase.environment!,
      expectedDecision: newTestCase.expectedDecision!,
      status: 'pending'
    };

    setState(prev => ({
      ...prev,
      testCases: [...prev.testCases, testCase],
      showCreateModal: false
    }));

    // Reset form
    setNewTestCase({
      name: '',
      description: '',
      user: {
        id: '',
        username: '',
        email: '',
        roles: [],
        groups: [],
        attributes: {}
      },
      action: '',
      resource: {
        type: '',
        path: '',
        namespace: '',
        project: '',
        attributes: {}
      },
      environment: {
        environment: 'development',
        time: new Date().toISOString(),
        location: '',
        risk: 'low',
        attributes: {}
      },
      expectedDecision: 'unknown'
    });
  };

  const runSingleTest = async (testCase: TestCase) => {
    setState(prev => ({
      ...prev,
      testCases: prev.testCases.map(tc => 
        tc.id === testCase.id ? { ...tc, status: 'running' } : tc
      )
    }));

    try {
      const request: PolicyEvaluationRequest = {
        user: testCase.user,
        action: testCase.action,
        resource: testCase.resource,
        environment: testCase.environment,
        requestId: `test-${testCase.id}`,
        timestamp: new Date().toISOString()
      };

      const result = await onEvaluatePolicy(request);

      setState(prev => ({
        ...prev,
        testCases: prev.testCases.map(tc => 
          tc.id === testCase.id ? { ...tc, status: 'completed', result } : tc
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        testCases: prev.testCases.map(tc => 
          tc.id === testCase.id ? { ...tc, status: 'failed', error: error.message } : tc
        )
      }));
    }
  };

  const runAllTests = async () => {
    setState(prev => ({ ...prev, isRunning: true }));

    const pendingTests = state.testCases.filter(tc => tc.status === 'pending');
    
    for (const testCase of pendingTests) {
      await runSingleTest(testCase);
    }

    setState(prev => ({ ...prev, isRunning: false }));
  };

  const runSimulation = async () => {
    if (state.testCases.length === 0) return;

    try {
      const request: PolicySimulationRequest = {
        testCases: state.testCases.map(tc => ({
          user: tc.user,
          action: tc.action,
          resource: tc.resource,
          environment: tc.environment,
          expectedDecision: tc.expectedDecision
        })),
        policies: policies,
        options: {
          includePolicyDetails: true,
          includeRuleEvaluation: true,
          includePerformanceMetrics: true
        }
      };

      const results = await onRunSimulation(request);
      
      setState(prev => ({
        ...prev,
        currentResults: results,
        showResultsModal: true
      }));
    } catch (error) {
      console.error('Error running simulation:', error);
    }
  };

  const deleteTestCase = (id: string) => {
    setState(prev => ({
      ...prev,
      testCases: prev.testCases.filter(tc => tc.id !== id)
    }));
  };

  const getTestCaseActions = (testCase: TestCase): IAction[] => [
    {
      title: 'Run Test',
      onClick: () => runSingleTest(testCase),
      isDisabled: testCase.status === 'running',
      icon: <PlayIcon />
    },
    {
      title: 'View Details',
      onClick: () => setState(prev => ({ ...prev, selectedTestCase: testCase })),
      icon: <EyeIcon />
    },
    {
      title: 'Delete Test',
      onClick: () => deleteTestCase(testCase.id),
      icon: <TrashIcon />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge isRead>Pending</Badge>;
      case 'running':
        return <Badge isRead variant="info">Running</Badge>;
      case 'completed':
        return <Badge isRead variant="success">Completed</Badge>;
      case 'failed':
        return <Badge isRead variant="danger">Failed</Badge>;
      default:
        return <Badge isRead>Unknown</Badge>;
    }
  };

  const getDecisionBadge = (decision: string, expected: string, actual?: string) => {
    if (!actual) return <Badge isRead>Unknown</Badge>;
    
    const matches = decision === actual;
    return (
      <Badge isRead variant={matches ? 'success' : 'danger'}>
        {actual} {matches ? '✓' : '✗'}
      </Badge>
    );
  };

  const renderTestCaseForm = () => (
    <Form>
      <FormSection title="Test Case Information">
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup
              label="Test Name"
              isRequired
              fieldId="test-name"
              helperText="Descriptive name for this test case"
            >
              <TextInput
                id="test-name"
                value={newTestCase.name || ''}
                onChange={(_, value) => setNewTestCase(prev => ({ ...prev, name: value }))}
                placeholder="e.g., Admin access to production secrets"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup
              label="Expected Decision"
              fieldId="expected-decision"
              helperText="What decision you expect from the policy evaluation"
            >
              <Select
                placeholderText="Select expected decision"
                variant={SelectVariant.single}
                selections={newTestCase.expectedDecision}
                onSelect={(_, selection) => setNewTestCase(prev => ({ ...prev, expectedDecision: selection as 'allow' | 'deny' | 'unknown' }))}
              >
                <SelectOption value="allow">Allow</SelectOption>
                <SelectOption value="deny">Deny</SelectOption>
                <SelectOption value="unknown">Unknown</SelectOption>
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={12}>
            <FormGroup
              label="Description"
              fieldId="test-description"
              helperText="Detailed description of what this test case validates"
            >
              <TextArea
                id="test-description"
                value={newTestCase.description || ''}
                onChange={(_, value) => setNewTestCase(prev => ({ ...prev, description: value }))}
                placeholder="Describe the scenario being tested..."
                rows={2}
              />
            </FormGroup>
          </GridItem>
        </Grid>
      </FormSection>

      <Divider />

      <FormSection title="User Context">
        <Grid hasGutter>
          <GridItem span={4}>
            <FormGroup
              label="Username"
              fieldId="user-username"
              helperText="Username for the test user"
            >
              <TextInput
                id="user-username"
                value={newTestCase.user?.username || ''}
                onChange={(_, value) => setNewTestCase(prev => ({
                  ...prev,
                  user: { ...prev.user!, username: value }
                }))}
                placeholder="e.g., john.doe"
              />
            </FormGroup>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label="Email"
              fieldId="user-email"
              helperText="Email for the test user"
            >
              <TextInput
                id="user-email"
                value={newTestCase.user?.email || ''}
                onChange={(_, value) => setNewTestCase(prev => ({
                  ...prev,
                  user: { ...prev.user!, email: value }
                }))}
                placeholder="e.g., john.doe@company.com"
              />
            </FormGroup>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label="Roles"
              fieldId="user-roles"
              helperText="Roles assigned to the test user"
            >
              <Select
                placeholderText="Select roles"
                variant={SelectVariant.typeaheadMulti}
                onSelect={(_, selection) => {
                  if (typeof selection === 'string') {
                    const currentRoles = newTestCase.user?.roles || [];
                    if (!currentRoles.includes(selection)) {
                      setNewTestCase(prev => ({
                        ...prev,
                        user: { ...prev.user!, roles: [...currentRoles, selection] }
                      }));
                    }
                  }
                }}
              >
                {policies.map(policy => (
                  <SelectOption key={policy.id} value={policy.name}>
                    {policy.displayName}
                  </SelectOption>
                ))}
              </Select>
              
              {newTestCase.user?.roles && newTestCase.user.roles.length > 0 && (
                <ChipGroup className="pf-v5-u-mt-sm">
                  {newTestCase.user.roles.map(role => (
                    <Chip
                      key={role}
                      onClick={() => setNewTestCase(prev => ({
                        ...prev,
                        user: { ...prev.user!, roles: prev.user!.roles.filter(r => r !== role) }
                      }))}
                      isReadOnly={false}
                    >
                      {role}
                    </Chip>
                  ))}
                </ChipGroup>
              )}
            </FormGroup>
          </GridItem>
        </Grid>
      </FormSection>

      <Divider />

      <FormSection title="Resource Context">
        <Grid hasGutter>
          <GridItem span={4}>
            <FormGroup
              label="Resource Type"
              isRequired
              fieldId="resource-type"
              helperText="Type of resource being accessed"
            >
              <Select
                placeholderText="Select resource type"
                variant={SelectVariant.single}
                selections={newTestCase.resource?.type}
                onSelect={(_, selection) => setNewTestCase(prev => ({
                  ...prev,
                  resource: { ...prev.resource!, type: selection as string }
                }))}
              >
                {resourceTypes.map(type => (
                  <SelectOption key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label="Action"
              isRequired
              fieldId="action"
              helperText="Action being performed on the resource"
            >
              <Select
                placeholderText="Select action"
                variant={SelectVariant.single}
                selections={newTestCase.action}
                onSelect={(_, selection) => setNewTestCase(prev => ({ ...prev, action: selection as string }))}
              >
                {actionTypes.map(action => (
                  <SelectOption key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label="Namespace"
              fieldId="resource-namespace"
              helperText="Kubernetes namespace for the resource"
            >
              <TextInput
                id="resource-namespace"
                value={newTestCase.resource?.namespace || ''}
                onChange={(_, value) => setNewTestCase(prev => ({
                  ...prev,
                  resource: { ...prev.resource!, namespace: value }
                }))}
                placeholder="e.g., production"
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup
              label="Resource Path"
              fieldId="resource-path"
              helperText="Path or identifier for the specific resource"
            >
              <TextInput
                id="resource-path"
                value={newTestCase.resource?.path || ''}
                onChange={(_, value) => setNewTestCase(prev => ({
                  ...prev,
                  resource: { ...prev.resource!, path: value }
                }))}
                placeholder="e.g., /secrets/database/credentials"
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup
              label="Project"
              fieldId="resource-project"
              helperText="OpenShift project for the resource"
            >
              <TextInput
                id="resource-project"
                value={newTestCase.resource?.project || ''}
                onChange={(_, value) => setNewTestCase(prev => ({
                  ...prev,
                  resource: { ...prev.resource!, project: value }
                }))}
                placeholder="e.g., ai-platform"
              />
            </FormGroup>
          </GridItem>
        </Grid>
      </FormSection>

      <Divider />

      <FormSection title="Environment Context">
        <Grid hasGutter>
          <GridItem span={4}>
            <FormGroup
              label="Environment"
              fieldId="environment-type"
              helperText="Environment where the access is requested"
            >
              <Select
                placeholderText="Select environment"
                variant={SelectVariant.single}
                selections={newTestCase.environment?.environment}
                onSelect={(_, selection) => setNewTestCase(prev => ({
                  ...prev,
                  environment: { ...prev.environment!, environment: selection as any }
                }))}
              >
                {environmentTypes.map(env => (
                  <SelectOption key={env} value={env}>
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label="Risk Level"
              fieldId="environment-risk"
              helperText="Risk level for the current context"
            >
              <Select
                placeholderText="Select risk level"
                variant={SelectVariant.single}
                selections={newTestCase.environment?.risk}
                onSelect={(_, selection) => setNewTestCase(prev => ({
                  ...prev,
                  environment: { ...prev.environment!, risk: selection as any }
                }))}
              >
                {riskLevels.map(risk => (
                  <SelectOption key={risk} value={risk}>
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label="Location"
              fieldId="environment-location"
              helperText="Geographic location of the request"
            >
              <TextInput
                id="environment-location"
                value={newTestCase.environment?.location || ''}
                onChange={(_, value) => setNewTestCase(prev => ({
                  ...prev,
                  environment: { ...prev.environment!, location: value }
                }))}
                placeholder="e.g., US-East"
              />
            </FormGroup>
          </GridItem>
        </Grid>
      </FormSection>
    </Form>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Icon>
                  <PlayIcon />
                </Icon>
                Policy Simulator
              </FlexItem>
              <FlexItem>
                <Badge isRead>{state.testCases.length} Test Cases</Badge>
              </FlexItem>
              {state.isRunning && (
                <FlexItem>
                  <Badge isRead variant="info">Running</Badge>
                </FlexItem>
              )}
            </Flex>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Tabs activeKey="test-cases" className="pf-v5-u-mb-md">
            <Tab eventKey="test-cases" title={<TabTitle icon={<TableIcon />}>Test Cases</TabTitle>}>
              <TabContent eventKey="test-cases" id="test-cases-tab-content">
                {/* Filters */}
                <Grid hasGutter className="pf-v5-u-mb-md">
                  <GridItem span={4}>
                    <TextInput
                      placeholder="Search test cases..."
                      value={state.searchTerm}
                      onChange={(_, value) => setState(prev => ({ ...prev, searchTerm: value }))}
                      iconVariant="search"
                    />
                  </GridItem>
                  <GridItem span={3}>
                    <Select
                      placeholderText="Status"
                      variant={SelectVariant.single}
                      selections={state.statusFilter}
                      onSelect={(_, selection) => setState(prev => ({ ...prev, statusFilter: selection as string }))}
                    >
                      <SelectOption value="all">All Status</SelectOption>
                      <SelectOption value="pending">Pending</SelectOption>
                      <SelectOption value="running">Running</SelectOption>
                      <SelectOption value="completed">Completed</SelectOption>
                      <SelectOption value="failed">Failed</SelectOption>
                    </Select>
                  </GridItem>
                  <GridItem span={3}>
                    <Select
                      placeholderText="Sort By"
                      variant={SelectVariant.single}
                      selections={state.sortBy}
                      onSelect={(_, selection) => setState(prev => ({ ...prev, sortBy: selection as string }))}
                    >
                      <SelectOption value="name">Name</SelectOption>
                      <SelectOption value="status">Status</SelectOption>
                      <SelectOption value="expectedDecision">Expected Decision</SelectOption>
                      <SelectOption value="createdAt">Created</SelectOption>
                    </Select>
                  </GridItem>
                  <GridItem span={2}>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => setState(prev => ({ ...prev, sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' }))}
                    >
                      {state.sortDirection === 'asc' ? '↑' : '↓'}
                    </Button>
                  </GridItem>
                </Grid>

                {/* Test Cases Table */}
                {filteredTestCases.length === 0 ? (
                  <EmptyState>
                    <EmptyStateIcon icon={TableIcon} />
                    <EmptyStateBody>
                      No test cases found. Create your first test case to start testing policies.
                    </EmptyStateBody>
                    <EmptyStateActions>
                      <Button variant={ButtonVariant.primary} onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}>
                        Create Test Case
                      </Button>
                    </EmptyStateActions>
                  </EmptyState>
                ) : (
                  <Table variant={TableVariant.compact} aria-label="Test cases table">
                    <TableHeader>
                      <Tr>
                        <Th>Name</Th>
                        <Th>User</Th>
                        <Th>Action</Th>
                        <Th>Resource</Th>
                        <Th>Expected</Th>
                        <Th>Status</Th>
                        <Th>Result</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </TableHeader>
                    <TableBody>
                      {filteredTestCases.map(testCase => (
                        <Tr key={testCase.id}>
                          <Td>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem>
                                <strong>{testCase.name}</strong>
                              </FlexItem>
                              <FlexItem>
                                <small className="pf-v5-u-color-200">{testCase.description}</small>
                              </FlexItem>
                            </Flex>
                          </Td>
                          <Td>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem>{testCase.user.username}</FlexItem>
                              <FlexItem>
                                <ChipGroup>
                                  {testCase.user.roles.slice(0, 2).map(role => (
                                    <Chip key={role} isReadOnly>
                                      {role}
                                    </Chip>
                                  ))}
                                  {testCase.user.roles.length > 2 && (
                                    <Chip isReadOnly>
                                      +{testCase.user.roles.length - 2} more
                                    </Chip>
                                  )}
                                </ChipGroup>
                              </FlexItem>
                            </Flex>
                          </Td>
                          <Td>
                            <Badge isRead>{testCase.action}</Badge>
                          </Td>
                          <Td>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem>
                                <Badge isRead>{testCase.resource.type}</Badge>
                              </FlexItem>
                              <FlexItem>
                                <small className="pf-v5-u-color-200">
                                  {testCase.resource.namespace && `${testCase.resource.namespace}/`}
                                  {testCase.resource.path}
                                </small>
                              </FlexItem>
                            </Flex>
                          </Td>
                          <Td>
                            <Badge isRead variant={testCase.expectedDecision === 'allow' ? 'success' : testCase.expectedDecision === 'deny' ? 'danger' : 'info'}>
                              {testCase.expectedDecision}
                            </Badge>
                          </Td>
                          <Td>
                            {getStatusBadge(testCase.status)}
                          </Td>
                          <Td>
                            {testCase.result ? (
                              getDecisionBadge(testCase.expectedDecision, testCase.expectedDecision, testCase.result.decision)
                            ) : (
                              <span className="pf-v5-u-color-200">-</span>
                            )}
                          </Td>
                          <Td>
                            <ActionsColumn items={getTestCaseActions(testCase)} />
                          </Td>
                        </Tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabContent>
            </Tab>
          </Tabs>
        </CardBody>
        <CardFooter>
          <Button
            variant={ButtonVariant.primary}
            onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}
            icon={<PlusIcon />}
          >
            Create Test Case
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            onClick={runAllTests}
            isDisabled={state.isRunning || state.testCases.filter(tc => tc.status === 'pending').length === 0}
            icon={<PlayIcon />}
          >
            {state.isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            onClick={runSimulation}
            isDisabled={state.testCases.length === 0}
            icon={<PlayIcon />}
          >
            Run Simulation
          </Button>
        </CardFooter>
      </Card>

      {/* Create Test Case Modal */}
      <Modal
        variant={ModalVariant.large}
        title="Create New Test Case"
        isOpen={state.showCreateModal}
        onClose={() => setState(prev => ({ ...prev, showCreateModal: false }))}
        actions={[
          <Button
            key="create"
            variant={ButtonVariant.primary}
            onClick={createTestCase}
            isDisabled={!newTestCase.name || !newTestCase.action || !newTestCase.resource?.type}
          >
            Create Test Case
          </Button>,
          <Button key="cancel" variant={ButtonVariant.secondary} onClick={() => setState(prev => ({ ...prev, showCreateModal: false }))}>
            Cancel
          </Button>
        ]}
      >
        {renderTestCaseForm()}
      </Modal>

      {/* Test Case Details Modal */}
      <Modal
        variant={ModalVariant.large}
        title="Test Case Details"
        isOpen={!!state.selectedTestCase}
        onClose={() => setState(prev => ({ ...prev, selectedTestCase: null }))}
        actions={[
          <Button key="close" variant={ButtonVariant.secondary} onClick={() => setState(prev => ({ ...prev, selectedTestCase: null }))}>
            Close
          </Button>
        ]}
      >
        {state.selectedTestCase && (
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{state.selectedTestCase.name}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Description</DescriptionListTerm>
              <DescriptionListDescription>{state.selectedTestCase.description}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>User Context</DescriptionListTerm>
              <DescriptionListDescription>
                <strong>Username:</strong> {state.selectedTestCase.user.username}<br />
                <strong>Email:</strong> {state.selectedTestCase.user.email}<br />
                <strong>Roles:</strong> {state.selectedTestCase.user.roles.join(', ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Resource Context</DescriptionListTerm>
              <DescriptionListDescription>
                <strong>Type:</strong> {state.selectedTestCase.resource.type}<br />
                <strong>Path:</strong> {state.selectedTestCase.resource.path}<br />
                <strong>Namespace:</strong> {state.selectedTestCase.resource.namespace}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Action</DescriptionListTerm>
              <DescriptionListDescription>{state.selectedTestCase.action}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Expected Decision</DescriptionListTerm>
              <DescriptionListDescription>
                <Badge isRead variant={state.selectedTestCase.expectedDecision === 'allow' ? 'success' : 'danger'}>
                  {state.selectedTestCase.expectedDecision}
                </Badge>
              </DescriptionListDescription>
            </DescriptionListGroup>
            {state.selectedTestCase.result && (
              <DescriptionListGroup>
                <DescriptionListTerm>Result</DescriptionListTerm>
                <DescriptionListDescription>
                  <strong>Decision:</strong> {state.selectedTestCase.result.decision}<br />
                  <strong>Reason:</strong> {state.selectedTestCase.result.reason}<br />
                  <strong>Policy:</strong> {state.selectedTestCase.result.policyId}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        )}
      </Modal>

      {/* Simulation Results Modal */}
      <Modal
        variant={ModalVariant.large}
        title="Simulation Results"
        isOpen={state.showResultsModal}
        onClose={() => setState(prev => ({ ...prev, showResultsModal: false }))}
        actions={[
          <Button key="close" variant={ButtonVariant.secondary} onClick={() => setState(prev => ({ ...prev, showResultsModal: false }))}>
            Close
          </Button>
        ]}
      >
        {state.currentResults && (
          <div>
            <Alert
              variant={AlertVariant.info}
              title={`Simulation completed with ${state.currentResults.results.length} test cases`}
              className="pf-v5-u-mb-md"
            >
              <p>
                Overall success rate: {((state.currentResults.results.filter(r => r.decision === r.expectedDecision).length / state.currentResults.results.length) * 100).toFixed(1)}%
              </p>
            </Alert>

            <Table variant={TableVariant.compact} aria-label="Simulation results">
              <TableHeader>
                <Tr>
                  <Th>Test Case</Th>
                  <Th>Expected</Th>
                  <Th>Actual</Th>
                  <Th>Match</Th>
                  <Th>Policy</Th>
                  <Th>Reason</Th>
                </Tr>
              </TableHeader>
              <TableBody>
                {state.currentResults.results.map((result, index) => (
                  <Tr key={index}>
                    <Td>Test Case {index + 1}</Td>
                    <Td>
                      <Badge isRead variant={result.expectedDecision === 'allow' ? 'success' : 'danger'}>
                        {result.expectedDecision}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge isRead variant={result.decision === 'allow' ? 'success' : 'danger'}>
                        {result.decision}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge isRead variant={result.decision === result.expectedDecision ? 'success' : 'danger'}>
                        {result.decision === result.expectedDecision ? '✓' : '✗'}
                      </Badge>
                    </Td>
                    <Td>{result.policyId || 'N/A'}</Td>
                    <Td>{result.reason || 'N/A'}</Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PolicySimulator;
