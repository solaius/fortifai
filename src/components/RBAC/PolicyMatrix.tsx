import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardActions,
  Button,
  ButtonVariant,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  TextInput,
  Select,
  SelectOption,
  SelectVariant,
  Chip,
  ChipGroup,
  Badge,
  Alert,
  AlertVariant,
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  Th,
  Td,
  Tr,
  ActionsColumn,
  IAction,
  Tooltip,
  TooltipPosition,
  Icon,
  Popover,
  PopoverPosition,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  FormSection,
  Divider,
  Tabs,
  Tab,
  TabTitle,
  TabContent,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateActions,
  Spinner,
  Bullseye
} from '@patternfly/react-core';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TimesCircleIcon,
  QuestionCircleIcon,
  FilterIcon,
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  TableIcon,
  ThumbtackIcon
} from '@patternfly/react-icons';
import { Policy, PolicyEffect, PolicyStatus, PolicyRule, PolicyTarget } from '../../types/rbac';

interface PolicyMatrixProps {
  policies: Policy[];
  onEditPolicy: (policy: Policy) => void;
  onDeletePolicy: (policyId: string) => void;
  onDuplicatePolicy: (policy: Policy) => void;
  onExportPolicies: () => void;
  onImportPolicies: (policies: Policy[]) => void;
}

interface PolicyMatrixState {
  searchTerm: string;
  effectFilter: PolicyEffect | 'all';
  statusFilter: PolicyStatus | 'all';
  categoryFilter: string;
  priorityFilter: string;
  viewMode: 'grid' | 'table' | 'matrix';
  selectedPolicies: string[];
  showConflictModal: boolean;
  conflictingPolicies: Policy[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface PolicyConflict {
  policy1: Policy;
  policy2: Policy;
  conflictType: 'overlap' | 'contradiction' | 'priority';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const PolicyMatrix: React.FC<PolicyMatrixProps> = ({
  policies,
  onEditPolicy,
  onDeletePolicy,
  onDuplicatePolicy,
  onExportPolicies,
  onImportPolicies
}) => {
  const [state, setState] = useState<PolicyMatrixState>({
    searchTerm: '',
    effectFilter: 'all',
    statusFilter: 'all',
    categoryFilter: 'all',
    priorityFilter: 'all',
    viewMode: 'matrix',
    selectedPolicies: [],
    showConflictModal: false,
    conflictingPolicies: [],
    sortBy: 'priority',
    sortDirection: 'desc'
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState('');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    policies.forEach(policy => {
      if (policy.metadata?.category) {
        cats.add(policy.metadata.category);
      }
    });
    return Array.from(cats).sort();
  }, [policies]);

  const priorityLevels = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High (300-500)' },
    { value: 'medium', label: 'Medium (200-299)' },
    { value: 'low', label: 'Low (100-199)' }
  ];

  const filteredPolicies = useMemo(() => {
    let filtered = policies.filter(policy => {
      const matchesSearch = policy.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           policy.displayName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           policy.description.toLowerCase().includes(state.searchTerm.toLowerCase());
      
      const matchesEffect = state.effectFilter === 'all' || policy.effect === state.effectFilter;
      const matchesStatus = state.statusFilter === 'all' || policy.status === state.statusFilter;
      const matchesCategory = state.categoryFilter === 'all' || policy.metadata?.category === state.categoryFilter;
      
      let matchesPriority = true;
      if (state.priorityFilter !== 'all') {
        const priority = policy.priority;
        switch (state.priorityFilter) {
          case 'high':
            matchesPriority = priority >= 300;
            break;
          case 'medium':
            matchesPriority = priority >= 200 && priority < 300;
            break;
          case 'low':
            matchesPriority = priority < 200;
            break;
        }
      }

      return matchesSearch && matchesEffect && matchesStatus && matchesCategory && matchesPriority;
    });

    // Sort policies
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'priority':
          comparison = b.priority - a.priority;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
      }
      return state.sortDirection === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [policies, state]);

  const policyConflicts = useMemo(() => {
    const conflicts: PolicyConflict[] = [];
    
    for (let i = 0; i < filteredPolicies.length; i++) {
      for (let j = i + 1; j < filteredPolicies.length; j++) {
        const policy1 = filteredPolicies[i];
        const policy2 = filteredPolicies[j];
        
        // Check for overlapping targets
        const overlappingTargets = checkOverlappingTargets(policy1.targets, policy2.targets);
        if (overlappingTargets.length > 0) {
          conflicts.push({
            policy1,
            policy2,
            conflictType: 'overlap',
            description: `Policies overlap on targets: ${overlappingTargets.join(', ')}`,
            severity: 'medium'
          });
        }
        
        // Check for contradictions (allow vs deny on same resources)
        if (policy1.effect !== policy2.effect && overlappingTargets.length > 0) {
          conflicts.push({
            policy1,
            policy2,
            conflictType: 'contradiction',
            description: `Conflicting effects: ${policy1.effect} vs ${policy2.effect} on overlapping targets`,
            severity: 'high'
          });
        }
        
        // Check for priority conflicts
        if (Math.abs(policy1.priority - policy2.priority) <= 10) {
          conflicts.push({
            policy1,
            policy2,
            conflictType: 'priority',
            description: `Similar priority levels: ${policy1.priority} vs ${policy2.priority}`,
            severity: 'low'
          });
        }
      }
    }
    
    return conflicts;
  }, [filteredPolicies]);

  const checkOverlappingTargets = (targets1: PolicyTarget, targets2: PolicyTarget): string[] => {
    const overlaps: string[] = [];
    
    // Check resource type overlaps
    const resourceOverlap = targets1.resources.filter(r => targets2.resources.includes(r));
    if (resourceOverlap.length > 0) {
      overlaps.push(`resources: ${resourceOverlap.join(', ')}`);
    }
    
    // Check action overlaps
    const actionOverlap = targets1.actions.filter(a => targets2.actions.includes(a));
    if (actionOverlap.length > 0) {
      overlaps.push(`actions: ${actionOverlap.join(', ')}`);
    }
    
    // Check namespace overlaps
    if (targets1.namespaces && targets2.namespaces) {
      const namespaceOverlap = targets1.namespaces.filter(n => targets2.namespaces.includes(n));
      if (namespaceOverlap.length > 0) {
        overlaps.push(`namespaces: ${namespaceOverlap.join(', ')}`);
      }
    }
    
    return overlaps;
  };

  const getPolicyActions = (policy: Policy): IAction[] => [
    {
      title: 'View Details',
      onClick: () => onEditPolicy(policy),
      icon: <EyeIcon />
    },
    {
      title: 'Edit Policy',
      onClick: () => onEditPolicy(policy),
      icon: <EditIcon />
    },
    {
      title: 'Duplicate Policy',
      onClick: () => onDuplicatePolicy(policy),
      icon: <PlusIcon />
    },
    {
      title: 'Delete Policy',
      onClick: () => onDeletePolicy(policy.id),
      icon: <TrashIcon />,
      isDisabled: policy.status === 'active'
    }
  ];

  const handleImportPolicies = () => {
    try {
      const parsedPolicies = JSON.parse(importData);
      if (Array.isArray(parsedPolicies)) {
        onImportPolicies(parsedPolicies);
        setIsImportModalOpen(false);
        setImportData('');
      } else {
        throw new Error('Invalid format: expected array of policies');
      }
    } catch (error) {
      console.error('Error importing policies:', error);
      // You could add error handling here
    }
  };

  const renderMatrixView = () => {
    if (filteredPolicies.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon icon={TableIcon} />
          <EmptyStateBody>
            No policies match the current filters. Try adjusting your search criteria.
          </EmptyStateBody>
          <EmptyStateActions>
            <Button variant={ButtonVariant.primary} onClick={() => setState(prev => ({ ...prev, searchTerm: '', effectFilter: 'all', statusFilter: 'all', categoryFilter: 'all', priorityFilter: 'all' }))}>
              Clear Filters
            </Button>
          </EmptyStateActions>
        </EmptyState>
      );
    }

    const resources = Array.from(new Set(filteredPolicies.flatMap(p => p.targets.resources)));
    const actions = Array.from(new Set(filteredPolicies.flatMap(p => p.targets.actions)));

    return (
      <div className="policy-matrix">
        <div className="matrix-header pf-v5-u-mb-md">
          <Grid hasGutter>
            <GridItem span={12}>
              <Alert
                variant={policyConflicts.length > 0 ? AlertVariant.warning : AlertVariant.success}
                title={`Policy Matrix - ${filteredPolicies.length} Policies`}
                className="pf-v5-u-mb-md"
              >
                {policyConflicts.length > 0 ? (
                  <p>
                    {policyConflicts.length} potential conflicts detected. 
                    <Button
                      variant={ButtonVariant.link}
                      onClick={() => setState(prev => ({ ...prev, showConflictModal: true }))}
                    >
                      View Conflicts
                    </Button>
                  </p>
                ) : (
                  <p>No policy conflicts detected. All policies are compatible.</p>
                )}
              </Alert>
            </GridItem>
          </Grid>
        </div>

        <div className="matrix-content">
          <Table variant={TableVariant.compact} aria-label="Policy matrix">
            <TableHeader>
              <Tr>
                <Th>Policy</Th>
                <Th>Effect</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                {resources.map(resource => (
                  <Th key={resource}>
                    <Tooltip content={`Resource: ${resource}`}>
                      <span>{resource}</span>
                    </Tooltip>
                  </Th>
                ))}
              </Tr>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map(policy => (
                <Tr key={policy.id}>
                  <Td>
                    <Flex direction={{ default: 'column' }}>
                      <FlexItem>
                        <strong>{policy.displayName}</strong>
                      </FlexItem>
                      <FlexItem>
                        <small className="pf-v5-u-color-200">{policy.name}</small>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td>
                    <Badge isRead={policy.effect === 'allow'}>
                      {policy.effect}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge isRead>{policy.priority}</Badge>
                  </Td>
                  <Td>
                    <Badge isRead={policy.status === 'active'}>
                      {policy.status}
                    </Badge>
                  </Td>
                  {resources.map(resource => {
                    const applies = policy.targets.resources.includes(resource);
                    const hasActions = policy.targets.actions.some(action => 
                      actions.includes(action)
                    );
                    
                    return (
                      <Td key={resource}>
                        {applies && hasActions ? (
                          <Tooltip content={`${policy.effect} access to ${resource}`}>
                            <Icon>
                              {policy.effect === 'allow' ? <CheckCircleIcon /> : <TimesCircleIcon />}
                            </Icon>
                          </Tooltip>
                        ) : (
                          <span className="pf-v5-u-color-200">-</span>
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderTableView = () => (
    <Table variant={TableVariant.compact} aria-label="Policies table">
      <TableHeader>
        <Tr>
          <Th>Name</Th>
          <Th>Effect</Th>
          <Th>Priority</Th>
          <Th>Status</Th>
          <Th>Resources</Th>
          <Th>Actions</Th>
          <Th>Actions</Th>
        </Tr>
      </TableHeader>
      <TableBody>
        {filteredPolicies.map(policy => (
          <Tr key={policy.id}>
            <Td>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <strong>{policy.displayName}</strong>
                </FlexItem>
                <FlexItem>
                  <small className="pf-v5-u-color-200">{policy.description}</small>
                </FlexItem>
              </Flex>
            </Td>
            <Td>
              <Badge isRead={policy.effect === 'allow'}>
                {policy.effect}
              </Badge>
            </Td>
            <Td>
              <Badge isRead>{policy.priority}</Badge>
            </Td>
            <Td>
              <Badge isRead={policy.status === 'active'}>
                {policy.status}
              </Badge>
            </Td>
            <Td>
              <ChipGroup>
                {policy.targets.resources.slice(0, 2).map(resource => (
                  <Chip key={resource} isReadOnly>
                    {resource}
                  </Chip>
                ))}
                {policy.targets.resources.length > 2 && (
                  <Chip isReadOnly>
                    +{policy.targets.resources.length - 2} more
                  </Chip>
                )}
              </ChipGroup>
            </Td>
            <Td>
              <ChipGroup>
                {policy.targets.actions.slice(0, 2).map(action => (
                  <Chip key={action} isReadOnly>
                    {action}
                  </Chip>
                ))}
                {policy.targets.actions.length > 2 && (
                  <Chip isReadOnly>
                    +{policy.targets.actions.length - 2} more
                  </Chip>
                )}
              </ChipGroup>
            </Td>
            <Td>
              <ActionsColumn items={getPolicyActions(policy)} />
            </Td>
          </Tr>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Icon>
                  <TableIcon />
                </Icon>
                Policy Matrix
              </FlexItem>
              <FlexItem>
                <Badge isRead>{filteredPolicies.length} Policies</Badge>
              </FlexItem>
              {policyConflicts.length > 0 && (
                <FlexItem>
                  <Badge isRead variant="warning">
                    {policyConflicts.length} Conflicts
                  </Badge>
                </FlexItem>
              )}
            </Flex>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Tabs
            activeKey={state.viewMode}
            onSelect={(_, key) => setState(prev => ({ ...prev, viewMode: key as 'grid' | 'table' | 'matrix' }))}
            className="pf-v5-u-mb-md"
          >
            <Tab eventKey="matrix" title={<TabTitle icon={<TableIcon />}>Matrix View</TabTitle>}>
              <TabContent eventKey="matrix" id="matrix-tab-content">
                {renderMatrixView()}
              </TabContent>
            </Tab>
            <Tab eventKey="table" title={<TabTitle icon={<TableIcon />}>Table View</TabTitle>}>
              <TabContent eventKey="table" id="table-tab-content">
                {renderTableView()}
              </TabContent>
            </Tab>
          </Tabs>

          {/* Filters */}
          <Grid hasGutter className="pf-v5-u-mb-md">
            <GridItem span={3}>
              <TextInput
                placeholder="Search policies..."
                value={state.searchTerm}
                onChange={(_, value) => setState(prev => ({ ...prev, searchTerm: value }))}
                iconVariant="search"
              />
            </GridItem>
            <GridItem span={2}>
              <Select
                placeholderText="Effect"
                variant={SelectVariant.single}
                selections={state.effectFilter}
                onSelect={(_, selection) => setState(prev => ({ ...prev, effectFilter: selection as PolicyEffect | 'all' }))}
              >
                <SelectOption value="all">All Effects</SelectOption>
                <SelectOption value="allow">Allow</SelectOption>
                <SelectOption value="deny">Deny</SelectOption>
              </Select>
            </GridItem>
            <GridItem span={2}>
              <Select
                placeholderText="Status"
                variant={SelectVariant.single}
                selections={state.statusFilter}
                onSelect={(_, selection) => setState(prev => ({ ...prev, statusFilter: selection as PolicyStatus | 'all' }))}
              >
                <SelectOption value="all">All Status</SelectOption>
                <SelectOption value="draft">Draft</SelectOption>
                <SelectOption value="active">Active</SelectOption>
                <SelectOption value="inactive">Inactive</SelectOption>
                <SelectOption value="deprecated">Deprecated</SelectOption>
              </Select>
            </GridItem>
            <GridItem span={2}>
              <Select
                placeholderText="Category"
                variant={SelectVariant.single}
                selections={state.categoryFilter}
                onSelect={(_, selection) => setState(prev => ({ ...prev, categoryFilter: selection as string }))}
              >
                <SelectOption value="all">All Categories</SelectOption>
                {categories.map(category => (
                  <SelectOption key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </GridItem>
            <GridItem span={2}>
              <Select
                placeholderText="Priority"
                variant={SelectVariant.single}
                selections={state.priorityFilter}
                onSelect={(_, selection) => setState(prev => ({ ...prev, priorityFilter: selection as string }))}
              >
                {priorityLevels.map(level => (
                  <SelectOption key={level.value} value={level.value}>
                    {level.label}
                  </SelectOption>
                ))}
              </Select>
            </GridItem>
            <GridItem span={1}>
              <Select
                placeholderText="Sort"
                variant={SelectVariant.single}
                selections={state.sortBy}
                onSelect={(_, selection) => setState(prev => ({ ...prev, sortBy: selection as string }))}
              >
                <SelectOption value="priority">Priority</SelectOption>
                <SelectOption value="name">Name</SelectOption>
                <SelectOption value="createdAt">Created</SelectOption>
                <SelectOption value="updatedAt">Updated</SelectOption>
              </Select>
            </GridItem>
          </Grid>
        </CardBody>
        <CardActions>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setIsImportModalOpen(true)}
            icon={<UploadIcon />}
          >
            Import
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            onClick={onExportPolicies}
            icon={<DownloadIcon />}
          >
            Export
          </Button>
        </CardActions>
      </Card>

      {/* Conflict Resolution Modal */}
      <Modal
        variant={ModalVariant.large}
        title="Policy Conflicts"
        isOpen={state.showConflictModal}
        onClose={() => setState(prev => ({ ...prev, showConflictModal: false }))}
        actions={[
          <Button key="close" variant={ButtonVariant.secondary} onClick={() => setState(prev => ({ ...prev, showConflictModal: false }))}>
            Close
          </Button>
        ]}
      >
        <Alert
          variant={AlertVariant.warning}
          title="Policy conflicts detected"
          className="pf-v5-u-mb-md"
        >
          The following conflicts were detected in your policies. Review and resolve them to ensure proper access control.
        </Alert>

        <Table variant={TableVariant.compact} aria-label="Conflicts table">
          <TableHeader>
            <Tr>
              <Th>Conflict Type</Th>
              <Th>Policy 1</Th>
              <Th>Policy 2</Th>
              <Th>Description</Th>
              <Th>Severity</Th>
            </Tr>
          </TableHeader>
          <TableBody>
            {policyConflicts.map((conflict, index) => (
              <Tr key={index}>
                <Td>
                  <Badge isRead variant={conflict.severity === 'high' ? 'danger' : conflict.severity === 'medium' ? 'warning' : 'info'}>
                    {conflict.conflictType}
                  </Badge>
                </Td>
                <Td>
                  <strong>{conflict.policy1.displayName}</strong>
                  <br />
                  <small className="pf-v5-u-color-200">Priority: {conflict.policy1.priority}</small>
                </Td>
                <Td>
                  <strong>{conflict.policy2.displayName}</strong>
                  <br />
                  <small className="pf-v5-u-color-200">Priority: {conflict.policy2.priority}</small>
                </Td>
                <Td>{conflict.description}</Td>
                <Td>
                  <Badge isRead variant={conflict.severity === 'high' ? 'danger' : conflict.severity === 'medium' ? 'warning' : 'info'}>
                    {conflict.severity}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </Modal>

      {/* Import Modal */}
      <Modal
        variant={ModalVariant.medium}
        title="Import Policies"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        actions={[
          <Button
            key="import"
            variant={ButtonVariant.primary}
            onClick={handleImportPolicies}
            isDisabled={!importData.trim()}
          >
            Import
          </Button>,
          <Button key="cancel" variant={ButtonVariant.secondary} onClick={() => setIsImportModalOpen(false)}>
            Cancel
          </Button>
        ]}
      >
        <Form>
          <FormGroup
            label="Policy JSON"
            fieldId="import-json"
            helperText="Paste JSON array of policies to import"
          >
            <TextInput
              id="import-json"
              value={importData}
              onChange={(_, value) => setImportData(value)}
              placeholder='[{"name": "policy1", "displayName": "Policy 1", ...}]'
              type="text"
              aria-label="Policy JSON input"
            />
          </FormGroup>
        </Form>
      </Modal>
    </>
  );
};

export default PolicyMatrix;
