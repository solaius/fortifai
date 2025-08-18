import React, { useState, useEffect } from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  TextInput,
  TextArea,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Checkbox,
  NumberInput,
  Button,
  ButtonVariant,
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Title,
  Divider,
  HelperText,
  HelperTextItem,
  ChipGroup,
  Chip,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { TimesIcon, PlusIcon } from '@patternfly/react-icons';
import { 
  CreateSecretReferenceRequest, 
  SecretMetadata,
  AccessControl,
  LifecyclePolicy,
  RotationPolicy,
  ArchivalPolicy,
  DeletionPolicy
} from '../../types/secrets';
import { providersService } from '../../services/providers';
import { secretsService } from '../../services/secrets';

interface CreateReferenceFormProps {
  onSuccess?: (referenceId: string) => void;
  onCancel?: () => void;
}

interface FormData {
  // Basic information
  name: string;
  description: string;
  providerId: string;
  path: string;
  namespace: string;
  project: string;
  
  // Metadata
  displayName: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  secretType: 'password' | 'api-key' | 'certificate' | 'private-key' | 'database' | 'other';
  format: 'text' | 'json' | 'yaml' | 'binary' | 'pem' | 'p12';
  encoding: 'plaintext' | 'base64' | 'hex' | 'url-safe';
  classification: 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';
  compliance: string[];
  dataRetention: number;
  owner: string;
  team: string;
  costCenter: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  
  // Access control
  roles: Array<{ role: string; permissions: string[] }>;
  allowedNetworks: string[];
  allowedNamespaces: string[];
  allowedProjects: string[];
  requireMFA: boolean;
  requireApproval: boolean;
  
  // Lifecycle
  allowCreation: boolean;
  allowModification: boolean;
  allowDeletion: boolean;
  maxVersions: number;
  versionRetention: number;
  
  // Rotation
  rotationEnabled: boolean;
  rotationType: 'automatic' | 'manual' | 'scheduled' | 'on-demand';
  rotationInterval: number;
  rotationMethod: 'in-place' | 'create-new' | 'gradual';
  notificationBefore: number;
  notificationAfter: number;
  
  // Archival
  archivalEnabled: boolean;
  archivalTrigger: 'age' | 'size' | 'manual' | 'schedule';
  archivalAgeThreshold: number;
  archivalDestination: 'cold-storage' | 'backup' | 'archive';
  
  // Deletion
  deletionEnabled: boolean;
  deletionTrigger: 'age' | 'manual' | 'schedule' | 'compliance';
  deletionAgeThreshold: number;
  softDelete: boolean;
  retentionPeriod: number;
  
  // Labels and tags
  labels: Record<string, string>;
  tags: string[];
}

const CreateReferenceForm: React.FC<CreateReferenceFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    providerId: '',
    path: '',
    namespace: 'default',
    project: '',
    
    displayName: '',
    category: '',
    priority: 'medium',
    secretType: 'other',
    format: 'text',
    encoding: 'plaintext',
    classification: 'internal',
    compliance: [],
    dataRetention: 365,
    owner: '',
    team: '',
    costCenter: '',
    environment: 'development',
    
    roles: [],
    allowedNetworks: [],
    allowedNamespaces: [],
    allowedProjects: [],
    requireMFA: false,
    requireApproval: false,
    
    allowCreation: true,
    allowModification: true,
    allowDeletion: false,
    maxVersions: 10,
    versionRetention: 30,
    
    rotationEnabled: false,
    rotationType: 'manual',
    rotationInterval: 90,
    rotationMethod: 'create-new',
    notificationBefore: 7,
    notificationAfter: 1,
    
    archivalEnabled: false,
    archivalTrigger: 'age',
    archivalAgeThreshold: 365,
    archivalDestination: 'backup',
    
    deletionEnabled: false,
    deletionTrigger: 'age',
    deletionAgeThreshold: 1095,
    softDelete: true,
    retentionPeriod: 30,
    
    labels: {},
    tags: []
  });

  const [providers, setProviders] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Input states for dynamic fields
  const [newLabelKey, setNewLabelKey] = useState('');
  const [newLabelValue, setNewLabelValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newNetwork, setNewNetwork] = useState('');
  const [newNamespace, setNewNamespace] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCompliance, setNewCompliance] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const providerList = await providersService.listProviders();
      setProviders(providerList.map(p => ({ id: p.id, name: p.name, type: p.type })));
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const handleInputChange = (value: string, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (value: number, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (checked: boolean, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSelectChange = (selection: string, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: selection }));
  };

  // Label management
  const addLabel = () => {
    if (newLabelKey.trim() && newLabelValue.trim()) {
      setFormData(prev => ({
        ...prev,
        labels: { ...prev.labels, [newLabelKey.trim()]: newLabelValue.trim() }
      }));
      setNewLabelKey('');
      setNewLabelValue('');
    }
  };

  const removeLabel = (key: string) => {
    setFormData(prev => {
      const newLabels = { ...prev.labels };
      delete newLabels[key];
      return { ...prev, labels: newLabels };
    });
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Role management
  const addRole = () => {
    if (newRole.trim() && !formData.roles.some(r => r.role === newRole.trim())) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, { role: newRole.trim(), permissions: ['read'] }]
      }));
      setNewRole('');
    }
  };

  const removeRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.role !== role)
    }));
  };

  // Network/namespace/project management
  const addNetwork = () => {
    if (newNetwork.trim() && !formData.allowedNetworks.includes(newNetwork.trim())) {
      setFormData(prev => ({
        ...prev,
        allowedNetworks: [...prev.allowedNetworks, newNetwork.trim()]
      }));
      setNewNetwork('');
    }
  };

  const removeNetwork = (network: string) => {
    setFormData(prev => ({
      ...prev,
      allowedNetworks: prev.allowedNetworks.filter(n => n !== network)
    }));
  };

  const addAllowedNamespace = () => {
    if (newNamespace.trim() && !formData.allowedNamespaces.includes(newNamespace.trim())) {
      setFormData(prev => ({
        ...prev,
        allowedNamespaces: [...prev.allowedNamespaces, newNamespace.trim()]
      }));
      setNewNamespace('');
    }
  };

  const removeAllowedNamespace = (namespace: string) => {
    setFormData(prev => ({
      ...prev,
      allowedNamespaces: prev.allowedNamespaces.filter(n => n !== namespace)
    }));
  };

  const addAllowedProject = () => {
    if (newProject.trim() && !formData.allowedProjects.includes(newProject.trim())) {
      setFormData(prev => ({
        ...prev,
        allowedProjects: [...prev.allowedProjects, newProject.trim()]
      }));
      setNewProject('');
    }
  };

  const removeAllowedProject = (project: string) => {
    setFormData(prev => ({
      ...prev,
      allowedProjects: prev.allowedProjects.filter(p => p !== project)
    }));
  };

  // Compliance management
  const addCompliance = () => {
    if (newCompliance.trim() && !formData.compliance.includes(newCompliance.trim())) {
      setFormData(prev => ({
        ...prev,
        compliance: [...prev.compliance, newCompliance.trim()]
      }));
      setNewCompliance('');
    }
  };

  const removeCompliance = (item: string) => {
    setFormData(prev => ({
      ...prev,
      compliance: prev.compliance.filter(c => c !== item)
    }));
  };

  const buildRequest = (): CreateSecretReferenceRequest => {
    return {
      name: formData.name,
      description: formData.description,
      providerId: formData.providerId,
      path: formData.path,
      namespace: formData.namespace,
      project: formData.project || undefined,
      labels: formData.labels,
      tags: formData.tags,
      metadata: {
        displayName: formData.displayName || formData.name,
        category: formData.category,
        priority: formData.priority,
        secretType: formData.secretType,
        format: formData.format,
        encoding: formData.encoding,
        classification: formData.classification,
        compliance: formData.compliance,
        dataRetention: formData.dataRetention,
        owner: formData.owner,
        team: formData.team,
        costCenter: formData.costCenter || undefined,
        environment: formData.environment,
        rotationPolicy: {
          enabled: formData.rotationEnabled,
          type: formData.rotationType,
          interval: formData.rotationEnabled ? formData.rotationInterval : undefined,
          method: formData.rotationMethod,
          notificationBefore: formData.notificationBefore,
          notificationAfter: formData.notificationAfter,
          approvers: []
        },
        usageCount: 0,
        accessPatterns: [],
        rotationHistory: []
      },
      accessControl: {
        roles: formData.roles,
        allowedNetworks: formData.allowedNetworks.length > 0 ? formData.allowedNetworks : undefined,
        allowedNamespaces: formData.allowedNamespaces.length > 0 ? formData.allowedNamespaces : undefined,
        allowedProjects: formData.allowedProjects.length > 0 ? formData.allowedProjects : undefined,
        requireMFA: formData.requireMFA,
        requireApproval: formData.requireApproval
      },
      lifecycle: {
        allowCreation: formData.allowCreation,
        allowModification: formData.allowModification,
        allowDeletion: formData.allowDeletion,
        maxVersions: formData.maxVersions,
        versionRetention: formData.versionRetention,
        archivalPolicy: {
          enabled: formData.archivalEnabled,
          trigger: formData.archivalTrigger,
          ageThreshold: formData.archivalEnabled ? formData.archivalAgeThreshold : undefined,
          destination: formData.archivalDestination
        },
        deletionPolicy: {
          enabled: formData.deletionEnabled,
          trigger: formData.deletionTrigger,
          ageThreshold: formData.deletionEnabled ? formData.deletionAgeThreshold : undefined,
          softDelete: formData.softDelete,
          retentionPeriod: formData.retentionPeriod
        },
        notifications: []
      }
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const request = buildRequest();
      const result = await secretsService.createReference(request);
      
      if (result) {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess(result.id);
        } else {
          setTimeout(() => {
            navigate('/secrets');
          }, 2000);
        }
      } else {
        setSubmitError('Failed to create secret reference');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    return formData.name.trim() && 
           formData.providerId && 
           formData.path.trim() && 
           formData.namespace.trim() &&
           formData.displayName.trim() &&
           formData.category.trim() &&
           formData.owner.trim() &&
           formData.team.trim();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Title headingLevel="h2" size="xl">
            Create Secret Reference
          </Title>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {submitError && (
          <Alert
            variant={AlertVariant.danger}
            title="Error"
            className="pf-v5-u-mb-md"
          >
            {submitError}
          </Alert>
        )}

        {submitSuccess && (
          <Alert
            variant={AlertVariant.success}
            title="Success"
            className="pf-v5-u-mb-md"
          >
            Secret reference created successfully! Redirecting...
          </Alert>
        )}

        <Form>
          {/* Basic Information */}
          <FormSection title="Basic Information" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup label="Reference Name" isRequired>
                  <TextInput
                    value={formData.name}
                    onChange={(value) => handleInputChange(value, 'name')}
                    placeholder="Enter reference name"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Display Name" isRequired>
                  <TextInput
                    value={formData.displayName}
                    onChange={(value) => handleInputChange(value, 'displayName')}
                    placeholder="Enter display name"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={12}>
                <FormGroup label="Description">
                  <TextArea
                    value={formData.description}
                    onChange={(value) => handleInputChange(value, 'description')}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Provider" isRequired>
                  <Select
                    variant={"single"}
                    selections={formData.providerId}
                    onSelect={(event, selection) => handleInputChange(selection as string, 'providerId')}
                    placeholderText="Select provider"
                    isRequired
                  >
                    {providers.map(provider => (
                      <SelectOption key={provider.id} value={provider.id}>
                        {provider.name} ({provider.type})
                      </SelectOption>
                    ))}
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Secret Path" isRequired>
                  <TextInput
                    value={formData.path}
                    onChange={(value) => handleInputChange(value, 'path')}
                    placeholder="Enter secret path"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Namespace" isRequired>
                  <TextInput
                    value={formData.namespace}
                    onChange={(value) => handleInputChange(value, 'namespace')}
                    placeholder="Enter namespace"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Project">
                  <TextInput
                    value={formData.project}
                    onChange={(value) => handleInputChange(value, 'project')}
                    placeholder="Enter project"
                  />
                </FormGroup>
              </GridItem>
            </Grid>
          </FormSection>

          {/* Metadata */}
          <FormSection title="Metadata" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup label="Category" isRequired>
                  <TextInput
                    value={formData.category}
                    onChange={(value) => handleInputChange(value, 'category')}
                    placeholder="Enter category"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Priority" isRequired>
                  <Select
                    variant={"single"}
                    selections={formData.priority}
                    onSelect={(event, selection) => handleSelectChange(selection as string, 'priority')}
                    isRequired
                  >
                    <SelectOption value="low">Low</SelectOption>
                    <SelectOption value="medium">Medium</SelectOption>
                    <SelectOption value="high">High</SelectOption>
                    <SelectOption value="critical">Critical</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Secret Type" isRequired>
                  <Select
                    variant={"single"}
                    selections={formData.secretType}
                    onSelect={(event, selection) => handleSelectChange(selection as string, 'secretType')}
                    isRequired
                  >
                    <SelectOption value="password">Password</SelectOption>
                    <SelectOption value="api-key">API Key</SelectOption>
                    <SelectOption value="certificate">Certificate</SelectOption>
                    <SelectOption value="private-key">Private Key</SelectOption>
                    <SelectOption value="database">Database</SelectOption>
                    <SelectOption value="other">Other</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Format" isRequired>
                  <Select
                    variant={"single"}
                    selections={formData.format}
                    onSelect={(event, selection) => handleSelectChange(selection as string, 'format')}
                    isRequired
                  >
                    <SelectOption value="text">Text</SelectOption>
                    <SelectOption value="json">JSON</SelectOption>
                    <SelectOption value="yaml">YAML</SelectOption>
                    <SelectOption value="binary">Binary</SelectOption>
                    <SelectOption value="pem">PEM</SelectOption>
                    <SelectOption value="p12">P12</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Classification" isRequired>
                  <Select
                    variant={"single"}
                    selections={formData.classification}
                    onSelect={(event, selection) => handleSelectChange(selection as string, 'classification')}
                    isRequired
                  >
                    <SelectOption value="public">Public</SelectOption>
                    <SelectOption value="internal">Internal</SelectOption>
                    <SelectOption value="confidential">Confidential</SelectOption>
                    <SelectOption value="restricted">Restricted</SelectOption>
                    <SelectOption value="secret">Secret</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Environment" isRequired>
                  <Select
                    variant={"single"}
                    selections={formData.environment}
                    onSelect={(event, selection) => handleSelectChange(selection as string, 'environment')}
                    isRequired
                  >
                    <SelectOption value="development">Development</SelectOption>
                    <SelectOption value="staging">Staging</SelectOption>
                    <SelectOption value="production">Production</SelectOption>
                    <SelectOption value="testing">Testing</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Owner" isRequired>
                  <TextInput
                    value={formData.owner}
                    onChange={(value) => handleInputChange(value, 'owner')}
                    placeholder="Enter owner"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Team" isRequired>
                  <TextInput
                    value={formData.team}
                    onChange={(value) => handleInputChange(value, 'team')}
                    placeholder="Enter team"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Cost Center">
                  <TextInput
                    value={formData.costCenter}
                    onChange={(value) => handleInputChange(value, 'costCenter')}
                    placeholder="Enter cost center"
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Data Retention (days)" isRequired>
                  <NumberInput
                    value={formData.dataRetention}
                    onChange={(event) => handleNumberChange(Number(event.target.value), 'dataRetention')}
                    min={1}
                    max={3650}
                    isRequired
                  />
                </FormGroup>
              </GridItem>
            </Grid>

            {/* Compliance */}
            <div className="pf-v5-u-mt-md">
              <FormGroup label="Compliance Requirements">
                <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                  <TextInput
                    value={newCompliance}
                    onChange={setNewCompliance}
                    placeholder="Enter compliance requirement"
                    className="pf-v5-u-mr-sm"
                  />
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={addCompliance}
                    isDisabled={!newCompliance.trim()}
                  >
                    <PlusIcon />
                  </Button>
                </div>
                {formData.compliance.length > 0 && (
                  <ChipGroup>
                    {formData.compliance.map((item, index) => (
                      <Chip key={index} onClick={() => removeCompliance(item)}>
                        {item}
                      </Chip>
                    ))}
                  </ChipGroup>
                )}
              </FormGroup>
            </div>
          </FormSection>

          {/* Labels and Tags */}
          <FormSection title="Labels and Tags" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup label="Labels">
                  <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                    <TextInput
                      value={newLabelKey}
                      onChange={setNewLabelKey}
                      placeholder="Key"
                      className="pf-v5-u-mr-sm"
                    />
                    <TextInput
                      value={newLabelValue}
                      onChange={setNewLabelValue}
                      placeholder="Value"
                      className="pf-v5-u-mr-sm"
                    />
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={addLabel}
                      isDisabled={!newLabelKey.trim() || !newLabelValue.trim()}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  {Object.keys(formData.labels).length > 0 && (
                    <div>
                      {Object.entries(formData.labels).map(([key, value]) => (
                        <Chip key={key} onClick={() => removeLabel(key)} className="pf-v5-u-mb-xs pf-v5-u-mr-xs">
                          {key}={value}
                        </Chip>
                      ))}
                    </div>
                  )}
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Tags">
                  <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                    <TextInput
                      value={newTag}
                      onChange={setNewTag}
                      placeholder="Enter tag"
                      className="pf-v5-u-mr-sm"
                    />
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={addTag}
                      isDisabled={!newTag.trim()}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <ChipGroup>
                      {formData.tags.map((tag, index) => (
                        <Chip key={index} onClick={() => removeTag(tag)}>
                          {tag}
                        </Chip>
                      ))}
                    </ChipGroup>
                  )}
                </FormGroup>
              </GridItem>
            </Grid>
          </FormSection>

          {/* Access Control */}
          <FormSection title="Access Control" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup label="Roles">
                  <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                    <TextInput
                      value={newRole}
                      onChange={setNewRole}
                      placeholder="Enter role name"
                      className="pf-v5-u-mr-sm"
                    />
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={addRole}
                      isDisabled={!newRole.trim()}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  {formData.roles.length > 0 && (
                    <div>
                      {formData.roles.map((role, index) => (
                        <Chip key={index} onClick={() => removeRole(role.role)} className="pf-v5-u-mb-xs pf-v5-u-mr-xs">
                          {role.role}
                        </Chip>
                      ))}
                    </div>
                  )}
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Security Requirements">
                  <Checkbox
                    label="Require MFA"
                    isChecked={formData.requireMFA}
                    onChange={(checked) => handleCheckboxChange(checked, 'requireMFA')}
                    id="require-mfa"
                  />
                  <Checkbox
                    label="Require Approval"
                    isChecked={formData.requireApproval}
                    onChange={(checked) => handleCheckboxChange(checked, 'requireApproval')}
                    id="require-approval"
                  />
                </FormGroup>
              </GridItem>
            </Grid>

            {/* Network and Scope Restrictions */}
            <div className="pf-v5-u-mt-md">
              <Grid hasGutter>
                <GridItem span={4}>
                  <FormGroup label="Allowed Networks">
                    <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                      <TextInput
                        value={newNetwork}
                        onChange={setNewNetwork}
                        placeholder="Enter network"
                        className="pf-v5-u-mr-sm"
                      />
                      <Button
                        variant={ButtonVariant.secondary}
                        onClick={addNetwork}
                        isDisabled={!newNetwork.trim()}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                    {formData.allowedNetworks.length > 0 && (
                      <div>
                        {formData.allowedNetworks.map((network, index) => (
                          <Chip key={index} onClick={() => removeNetwork(network)} className="pf-v5-u-mb-xs pf-v5-u-mr-xs">
                            {network}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </FormGroup>
                </GridItem>
                <GridItem span={4}>
                  <FormGroup label="Allowed Namespaces">
                    <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                      <TextInput
                        value={newNamespace}
                        onChange={setNewNamespace}
                        placeholder="Enter namespace"
                        className="pf-v5-u-mr-sm"
                      />
                      <Button
                        variant={ButtonVariant.secondary}
                        onClick={addAllowedNamespace}
                        isDisabled={!newNamespace.trim()}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                    {formData.allowedNamespaces.length > 0 && (
                      <div>
                        {formData.allowedNamespaces.map((namespace, index) => (
                          <Chip key={index} onClick={() => removeAllowedNamespace(namespace)} className="pf-v5-u-mb-xs pf-v5-u-mr-xs">
                            {namespace}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </FormGroup>
                </GridItem>
                <GridItem span={4}>
                  <FormGroup label="Allowed Projects">
                    <div className="pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-mb-sm">
                      <TextInput
                        value={newProject}
                        onChange={setNewProject}
                        placeholder="Enter project"
                        className="pf-v5-u-mr-sm"
                      />
                      <Button
                        variant={ButtonVariant.secondary}
                        onClick={addAllowedProject}
                        isDisabled={!newProject.trim()}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                    {formData.allowedProjects.length > 0 && (
                      <div>
                        {formData.allowedProjects.map((project, index) => (
                          <Chip key={index} onClick={() => removeAllowedProject(project)} className="pf-v5-u-mb-xs pf-v5-u-mr-xs">
                            {project}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </FormGroup>
                </GridItem>
              </Grid>
            </div>
          </FormSection>

          {/* Lifecycle Policies */}
          <FormSection title="Lifecycle Policies" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup label="Permissions">
                  <Checkbox
                    label="Allow Creation"
                    isChecked={formData.allowCreation}
                    onChange={(checked) => handleCheckboxChange(checked, 'allowCreation')}
                    id="allow-creation"
                  />
                  <Checkbox
                    label="Allow Modification"
                    isChecked={formData.allowModification}
                    onChange={(checked) => handleCheckboxChange(checked, 'allowModification')}
                    id="allow-modification"
                  />
                  <Checkbox
                    label="Allow Deletion"
                    isChecked={formData.allowDeletion}
                    onChange={(checked) => handleCheckboxChange(checked, 'allowDeletion')}
                    id="allow-deletion"
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Versioning">
                  <FormGroup label="Max Versions">
                    <NumberInput
                      value={formData.maxVersions}
                      onChange={(event) => handleNumberChange(Number(event.target.value), 'maxVersions')}
                      min={1}
                      max={100}
                    />
                  </FormGroup>
                  <FormGroup label="Version Retention (days)">
                    <NumberInput
                      value={formData.versionRetention}
                      onChange={(event) => handleNumberChange(Number(event.target.value), 'versionRetention')}
                      min={1}
                      max={365}
                    />
                  </FormGroup>
                </FormGroup>
              </GridItem>
            </Grid>
          </FormSection>

          {/* Rotation Policy */}
          <FormSection title="Rotation Policy" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup>
                  <Checkbox
                    label="Enable Rotation"
                    isChecked={formData.rotationEnabled}
                    onChange={(checked) => handleCheckboxChange(checked, 'rotationEnabled')}
                    id="enable-rotation"
                  />
                </FormGroup>
                {formData.rotationEnabled && (
                  <>
                    <FormGroup label="Rotation Type">
                      <Select
                        variant={"single"}
                        selections={formData.rotationType}
                        onSelect={(event, selection) => handleSelectChange(selection as string, 'rotationType')}
                      >
                        <SelectOption value="automatic">Automatic</SelectOption>
                        <SelectOption value="manual">Manual</SelectOption>
                        <SelectOption value="scheduled">Scheduled</SelectOption>
                        <SelectOption value="on-demand">On-Demand</SelectOption>
                      </Select>
                    </FormGroup>
                    <FormGroup label="Rotation Method">
                      <Select
                        variant={"single"}
                        selections={formData.rotationMethod}
                        onSelect={(event, selection) => handleSelectChange(selection as string, 'rotationMethod')}
                      >
                        <SelectOption value="in-place">In-Place</SelectOption>
                        <SelectOption value="create-new">Create New</SelectOption>
                        <SelectOption value="gradual">Gradual</SelectOption>
                      </Select>
                    </FormGroup>
                  </>
                )}
              </GridItem>
              <GridItem span={6}>
                {formData.rotationEnabled && (
                  <>
                    <FormGroup label="Rotation Interval (days)">
                      <NumberInput
                        value={formData.rotationInterval}
                        onChange={(event) => handleNumberChange(Number(event.target.value), 'rotationInterval')}
                        min={1}
                        max={365}
                      />
                    </FormGroup>
                    <FormGroup label="Notification Before (days)">
                      <NumberInput
                        value={formData.notificationBefore}
                        onChange={(event) => handleNumberChange(Number(event.target.value), 'notificationBefore')}
                        min={1}
                        max={30}
                      />
                    </FormGroup>
                    <FormGroup label="Notification After (days)">
                      <NumberInput
                        value={formData.notificationAfter}
                        onChange={(event) => handleNumberChange(Number(event.target.value), 'notificationAfter')}
                        min={0}
                        max={7}
                      />
                    </FormGroup>
                  </>
                )}
              </GridItem>
            </Grid>
          </FormSection>

          {/* Action Buttons */}
          <FormSection>
            <div className="pf-v5-u-display-flex pf-v5-u-justify-content-flex-end pf-v5-u-gap-md">
              <Button
                variant={ButtonVariant.secondary}
                onClick={onCancel || (() => navigate('/secrets'))}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!validateForm()}
              >
                Create Reference
              </Button>
            </div>
          </FormSection>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CreateReferenceForm;
