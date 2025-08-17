import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  FormSection,
  TextInput,
  TextArea,
  Select,
  SelectOption,
  SelectVariant,
  Button,
  ButtonVariant,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Alert,
  AlertVariant,
  Divider,
  Chip,
  ChipGroup,
  Badge,
  Popover,
  PopoverPosition,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  Icon,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import {
  PlusIcon,
  TrashIcon,
  QuestionCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@patternfly/react-icons';
import { Policy, PolicyRule, PolicyTarget, PolicyCondition, PolicyEffect, PolicyStatus } from '../../types/rbac';

interface PolicyEditorProps {
  policy?: Policy;
  onSave: (policy: Partial<Policy>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface PolicyEditorState {
  name: string;
  displayName: string;
  description: string;
  effect: PolicyEffect;
  priority: number;
  status: PolicyStatus;
  rules: PolicyRule[];
  targets: PolicyTarget;
  conditions: PolicyCondition[];
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const PolicyEditor: React.FC<PolicyEditorProps> = ({
  policy,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [state, setState] = useState<PolicyEditorState>({
    name: policy?.name || '',
    displayName: policy?.displayName || '',
    description: policy?.description || '',
    effect: policy?.effect || 'allow',
    priority: policy?.priority || 100,
    status: policy?.status || 'draft',
    rules: policy?.rules || [],
    targets: policy?.targets || {
      resources: [],
      actions: [],
      pathPrefixes: [],
      targetTypes: [],
      providers: [],
      namespaces: [],
      projects: []
    },
    conditions: policy?.conditions || [],
    errors: {},
    isSubmitting: false
  });

  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showTargetBuilder, setShowTargetBuilder] = useState(false);
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);

  const ruleTypes = [
    { value: 'user', label: 'User', description: 'Match specific users' },
    { value: 'role', label: 'Role', description: 'Match user roles' },
    { value: 'group', label: 'Group', description: 'Match user groups' },
    { value: 'namespace', label: 'Namespace', description: 'Match Kubernetes namespaces' },
    { value: 'project', label: 'Project', description: 'Match OpenShift projects' },
    { value: 'resource', label: 'Resource', description: 'Match specific resources' },
    { value: 'time', label: 'Time', description: 'Time-based conditions' },
    { value: 'custom', label: 'Custom', description: 'Custom rule logic' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not-equals', label: 'Not Equals' },
    { value: 'in', label: 'In' },
    { value: 'not-in', label: 'Not In' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts-with', label: 'Starts With' },
    { value: 'ends-with', label: 'Ends With' },
    { value: 'regex', label: 'Regular Expression' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
    { value: 'gte', label: 'Greater Than or Equal' },
    { value: 'lte', label: 'Less Than or Equal' }
  ];

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!state.name.trim()) {
      errors.name = 'Policy name is required';
    }

    if (!state.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (!state.description.trim()) {
      errors.description = 'Description is required';
    }

    if (state.priority < 1 || state.priority > 1000) {
      errors.priority = 'Priority must be between 1 and 1000';
    }

    if (state.rules.length === 0) {
      errors.rules = 'At least one rule is required';
    }

    if (state.targets.resources.length === 0) {
      errors.targets = 'At least one resource type must be specified';
    }

    if (state.targets.actions.length === 0) {
      errors.actions = 'At least one action must be specified';
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const policyData: Partial<Policy> = {
        name: state.name,
        displayName: state.displayName,
        description: state.description,
        effect: state.effect,
        priority: state.priority,
        status: state.status,
        rules: state.rules,
        targets: state.targets,
        conditions: state.conditions
      };

      await onSave(policyData);
    } catch (error) {
      console.error('Error saving policy:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const addRule = () => {
    const newRule: PolicyRule = {
      id: `rule-${Date.now()}`,
      type: 'role',
      value: '',
      operator: 'equals',
      metadata: {}
    };

    setState(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const updateRule = (index: number, field: keyof PolicyRule, value: any) => {
    const updatedRules = [...state.rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };

    setState(prev => ({
      ...prev,
      rules: updatedRules
    }));
  };

  const removeRule = (index: number) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const addTarget = (field: keyof PolicyTarget, value: string) => {
    if (value.trim() && !state.targets[field]?.includes(value.trim())) {
      setState(prev => ({
        ...prev,
        targets: {
          ...prev.targets,
          [field]: [...(prev.targets[field] || []), value.trim()]
        }
      }));
    }
  };

  const removeTarget = (field: keyof PolicyTarget, value: string) => {
    setState(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [field]: prev.targets[field]?.filter(v => v !== value) || []
      }
    }));
  };

  const addCondition = () => {
    const newCondition: PolicyCondition = {
      id: `condition-${Date.now()}`,
      type: 'time',
      value: '',
      operator: 'equals',
      metadata: {}
    };

    setState(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const updateCondition = (index: number, field: keyof PolicyCondition, value: any) => {
    const updatedConditions = [...state.conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };

    setState(prev => ({
      ...prev,
      conditions: updatedConditions
    }));
  };

  const removeCondition = (index: number) => {
    setState(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              {isEditing ? 'Edit Policy' : 'Create New Policy'}
            </FlexItem>
            <FlexItem>
              <Badge isRead>{state.status}</Badge>
            </FlexItem>
          </Flex>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <FormSection title="Basic Information">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup
                  label="Policy Name"
                  isRequired
                  fieldId="policy-name"
                  helperText="Unique identifier for the policy"
                  validated={state.errors.name ? 'error' : 'default'}
                  helperTextInvalid={state.errors.name}
                >
                  <TextInput
                    id="policy-name"
                    value={state.name}
                    onChange={(_, value) => setState(prev => ({ ...prev, name: value }))}
                    placeholder="e.g., production-access-policy"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup
                  label="Display Name"
                  isRequired
                  fieldId="policy-display-name"
                  helperText="Human-readable name for the policy"
                  validated={state.errors.displayName ? 'error' : 'default'}
                  helperTextInvalid={state.errors.displayName}
                >
                  <TextInput
                    id="policy-display-name"
                    value={state.displayName}
                    onChange={(_, value) => setState(prev => ({ ...prev, displayName: value }))}
                    placeholder="e.g., Production Access Policy"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={12}>
                <FormGroup
                  label="Description"
                  isRequired
                  fieldId="policy-description"
                  helperText="Detailed description of what this policy controls"
                  validated={state.errors.description ? 'error' : 'default'}
                  helperTextInvalid={state.errors.description}
                >
                  <TextArea
                    id="policy-description"
                    value={state.description}
                    onChange={(_, value) => setState(prev => ({ ...prev, description: value }))}
                    placeholder="Describe the purpose and scope of this policy..."
                    rows={3}
                    isRequired
                  />
                </FormGroup>
              </GridItem>
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="Policy Configuration">
            <Grid hasGutter>
              <GridItem span={4}>
                <FormGroup
                  label="Effect"
                  isRequired
                  fieldId="policy-effect"
                  helperText="Whether this policy allows or denies access"
                >
                  <Select
                    id="policy-effect"
                    variant={SelectVariant.single}
                    selections={state.effect}
                    onSelect={(_, selection) => setState(prev => ({ ...prev, effect: selection as PolicyEffect }))}
                  >
                    <SelectOption value="allow">Allow</SelectOption>
                    <SelectOption value="deny">Deny</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={4}>
                <FormGroup
                  label="Priority"
                  isRequired
                  fieldId="policy-priority"
                  helperText="Higher priority policies take precedence"
                  validated={state.errors.priority ? 'error' : 'default'}
                  helperTextInvalid={state.errors.priority}
                >
                  <TextInput
                    id="policy-priority"
                    type="number"
                    value={state.priority}
                    onChange={(_, value) => setState(prev => ({ ...prev, priority: parseInt(value) || 100 }))}
                    min={1}
                    max={1000}
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={4}>
                <FormGroup
                  label="Status"
                  isRequired
                  fieldId="policy-status"
                  helperText="Current status of the policy"
                >
                  <Select
                    id="policy-status"
                    variant={SelectVariant.single}
                    selections={state.status}
                    onSelect={(_, selection) => setState(prev => ({ ...prev, status: selection as PolicyStatus }))}
                  >
                    <SelectOption value="draft">Draft</SelectOption>
                    <SelectOption value="active">Active</SelectOption>
                    <SelectOption value="inactive">Inactive</SelectOption>
                    <SelectOption value="deprecated">Deprecated</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="Policy Rules">
            <FormGroup
              label="Rules"
              isRequired
              fieldId="policy-rules"
              helperText="Rules define when this policy applies"
              validated={state.errors.rules ? 'error' : 'default'}
              helperTextInvalid={state.errors.rules}
            >
              {state.rules.map((rule, index) => (
                <Card key={rule.id} className="pf-v5-u-mb-md">
                  <CardBody>
                    <Grid hasGutter>
                      <GridItem span={3}>
                        <FormGroup label="Rule Type" fieldId={`rule-type-${index}`}>
                          <Select
                            id={`rule-type-${index}`}
                            variant={SelectVariant.single}
                            selections={rule.type}
                            onSelect={(_, selection) => updateRule(index, 'type', selection)}
                          >
                            {ruleTypes.map(type => (
                              <SelectOption key={type.value} value={type.value}>
                                {type.label}
                              </SelectOption>
                            ))}
                          </Select>
                        </FormGroup>
                      </GridItem>
                      <GridItem span={3}>
                        <FormGroup label="Operator" fieldId={`rule-operator-${index}`}>
                          <Select
                            id={`rule-operator-${index}`}
                            variant={SelectVariant.single}
                            selections={rule.operator}
                            onSelect={(_, selection) => updateRule(index, 'operator', selection)}
                          >
                            {operators.map(op => (
                              <SelectOption key={op.value} value={op.value}>
                                {op.label}
                              </SelectOption>
                            ))}
                          </Select>
                        </FormGroup>
                      </GridItem>
                      <GridItem span={4}>
                        <FormGroup label="Value" fieldId={`rule-value-${index}`}>
                          <TextInput
                            id={`rule-value-${index}`}
                            value={rule.value as string}
                            onChange={(_, value) => updateRule(index, 'value', value)}
                            placeholder="Enter rule value..."
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem span={2}>
                        <FormGroup label="Actions" fieldId={`rule-actions-${index}`}>
                          <Button
                            variant={ButtonVariant.plain}
                            onClick={() => removeRule(index)}
                            aria-label="Remove rule"
                          >
                            <Icon>
                              <TrashIcon />
                            </Icon>
                          </Button>
                        </FormGroup>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>
              ))}
              
              <Button
                variant={ButtonVariant.secondary}
                onClick={addRule}
                icon={<PlusIcon />}
              >
                Add Rule
              </Button>
            </FormGroup>
          </FormSection>

          <Divider />

          <FormSection title="Policy Targets">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup
                  label="Resource Types"
                  isRequired
                  fieldId="policy-resources"
                  helperText="What resources this policy applies to"
                  validated={state.errors.targets ? 'error' : 'default'}
                  helperTextInvalid={state.errors.targets}
                >
                  <Select
                    id="policy-resources"
                    variant={SelectVariant.typeaheadMulti}
                    selections={state.targets.resources}
                    onSelect={(_, selection) => {
                      if (typeof selection === 'string' && !state.targets.resources.includes(selection)) {
                        addTarget('resources', selection);
                      }
                    }}
                    onClear={() => setState(prev => ({ ...prev, targets: { ...prev.targets, resources: [] } }))}
                  >
                    {resourceTypes.map(type => (
                      <SelectOption key={type} value={type}>
                        {type}
                      </SelectOption>
                    ))}
                  </Select>
                  
                  {state.targets.resources.length > 0 && (
                    <ChipGroup className="pf-v5-u-mt-sm">
                      {state.targets.resources.map(resource => (
                        <Chip
                          key={resource}
                          onClick={() => removeTarget('resources', resource)}
                          isReadOnly={false}
                        >
                          {resource}
                        </Chip>
                      ))}
                    </ChipGroup>
                  )}
                </FormGroup>
              </GridItem>
              
              <GridItem span={6}>
                <FormGroup
                  label="Actions"
                  isRequired
                  fieldId="policy-actions"
                  helperText="What actions this policy allows or denies"
                  validated={state.errors.actions ? 'error' : 'default'}
                  helperTextInvalid={state.errors.actions}
                >
                  <Select
                    id="policy-actions"
                    variant={SelectVariant.typeaheadMulti}
                    selections={state.targets.actions}
                    onSelect={(_, selection) => {
                      if (typeof selection === 'string' && !state.targets.actions.includes(selection)) {
                        addTarget('actions', selection);
                      }
                    }}
                    onClear={() => setState(prev => ({ ...prev, targets: { ...prev.targets, actions: [] } }))}
                  >
                    {actionTypes.map(action => (
                      <SelectOption key={action} value={action}>
                        {action}
                      </SelectOption>
                    ))}
                  </Select>
                  
                  {state.targets.actions.length > 0 && (
                    <ChipGroup className="pf-v5-u-mt-sm">
                      {state.targets.actions.map(action => (
                        <Chip
                          key={action}
                          onClick={() => removeTarget('actions', action)}
                          isReadOnly={false}
                        >
                          {action}
                        </Chip>
                      ))}
                    </ChipGroup>
                  )}
                </FormGroup>
              </GridItem>
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="Policy Conditions">
            <FormGroup
              label="Conditions"
              fieldId="policy-conditions"
              helperText="Additional constraints for when this policy applies"
            >
              {state.conditions.map((condition, index) => (
                <Card key={condition.id} className="pf-v5-u-mb-md">
                  <CardBody>
                    <Grid hasGutter>
                      <GridItem span={3}>
                        <FormGroup label="Condition Type" fieldId={`condition-type-${index}`}>
                          <Select
                            id={`condition-type-${index}`}
                            variant={SelectVariant.single}
                            selections={condition.type}
                            onSelect={(_, selection) => updateCondition(index, 'type', selection)}
                          >
                            <SelectOption value="time">Time</SelectOption>
                            <SelectOption value="location">Location</SelectOption>
                            <SelectOption value="device">Device</SelectOption>
                            <SelectOption value="network">Network</SelectOption>
                            <SelectOption value="risk">Risk</SelectOption>
                            <SelectOption value="custom">Custom</SelectOption>
                          </Select>
                        </FormGroup>
                      </GridItem>
                      <GridItem span={3}>
                        <FormGroup label="Operator" fieldId={`condition-operator-${index}`}>
                          <Select
                            id={`condition-operator-${index}`}
                            variant={SelectVariant.single}
                            selections={condition.operator}
                            onSelect={(_, selection) => updateCondition(index, 'operator', selection)}
                          >
                            {operators.map(op => (
                              <SelectOption key={op.value} value={op.value}>
                                {op.label}
                              </SelectOption>
                            ))}
                          </Select>
                        </FormGroup>
                      </GridItem>
                      <GridItem span={4}>
                        <FormGroup label="Value" fieldId={`condition-value-${index}`}>
                          <TextInput
                            id={`condition-value-${index}`}
                            value={condition.value as string}
                            onChange={(_, value) => updateCondition(index, 'value', value)}
                            placeholder="Enter condition value..."
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem span={2}>
                        <FormGroup label="Actions" fieldId={`condition-actions-${index}`}>
                          <Button
                            variant={ButtonVariant.plain}
                            onClick={() => removeCondition(index)}
                            aria-label="Remove condition"
                          >
                            <Icon>
                              <TrashIcon />
                            </Icon>
                          </Button>
                        </FormGroup>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>
              ))}
              
              <Button
                variant={ButtonVariant.secondary}
                onClick={addCondition}
                icon={<PlusIcon />}
              >
                Add Condition
              </Button>
            </FormGroup>
          </FormSection>

          {Object.keys(state.errors).length > 0 && (
            <Alert
              variant={AlertVariant.danger}
              title="Please fix the following errors:"
              className="pf-v5-u-mt-md"
            >
              <ul>
                {Object.entries(state.errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Form>
      </CardBody>
      <CardFooter>
        <Button
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
          isLoading={state.isSubmitting}
          isDisabled={state.isSubmitting}
        >
          {isEditing ? 'Update Policy' : 'Create Policy'}
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PolicyEditor;
