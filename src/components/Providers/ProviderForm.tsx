import React, { useState, useEffect } from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  TextInput,
  TextArea,
  Select,
  SelectOption,
  SelectVariant,
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
  ValidatedOptions
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { providersService } from '../../services/providers';
import { 
  ProviderType, 
  VaultProvider, 
  AWSProvider, 
  AzureProvider,
  ProviderCreateRequest 
} from '../../types/providers';

interface ProviderFormProps {
  provider?: VaultProvider | AWSProvider | AzureProvider;
  isEdit?: boolean;
}

interface FormData {
  name: string;
  type: ProviderType;
  scopes: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  
  // Vault specific
  vaultAddress: string;
  vaultNamespace: string;
  vaultTlsSkipVerify: boolean;
  vaultTlsServerName: string;
  vaultTimeout: number;
  vaultMaxRetries: number;
  vaultAuthMethod: 'approle' | 'kubernetes' | 'token' | 'ldap';
  vaultRoleId: string;
  vaultSecretId: string;
  vaultK8sRole: string;
  vaultK8sJwt: string;
  vaultK8sMountPath: string;
  vaultToken: string;
  vaultLdapUsername: string;
  vaultLdapPassword: string;
  
  // AWS specific
  awsRegion: string;
  awsEndpoint: string;
  awsMaxRetries: number;
  awsTimeout: number;
  awsAuthMethod: 'iam-role' | 'access-key' | 'assume-role';
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRoleArn: string;
  awsSessionName: string;
  
  // Azure specific
  azureTenantId: string;
  azureSubscriptionId: string;
  azureResourceGroup: string;
  azureVaultName: string;
  azureEnvironment: 'AzureCloud' | 'AzureUSGovernment' | 'AzureChinaCloud';
  azureTimeout: number;
  azureAuthMethod: 'workload-identity' | 'service-principal' | 'managed-identity';
  azureClientId: string;
  azureClientSecret: string;
  azureCertificatePath: string;
  azureCertificatePassword: string;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'vault',
    scopes: [],
    labels: {},
    annotations: {},
    
    // Vault
    vaultAddress: '',
    vaultNamespace: '',
    vaultTlsSkipVerify: false,
    vaultTlsServerName: '',
    vaultTimeout: 30,
    vaultMaxRetries: 3,
    vaultAuthMethod: 'approle',
    vaultRoleId: '',
    vaultSecretId: '',
    vaultK8sRole: '',
    vaultK8sJwt: '',
    vaultK8sMountPath: 'kubernetes',
    vaultToken: '',
    vaultLdapUsername: '',
    vaultLdapPassword: '',
    
    // AWS
    awsRegion: 'us-east-1',
    awsEndpoint: '',
    awsMaxRetries: 3,
    awsTimeout: 30,
    awsAuthMethod: 'iam-role',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRoleArn: '',
    awsSessionName: '',
    
    // Azure
    azureTenantId: '',
    azureSubscriptionId: '',
    azureResourceGroup: '',
    azureVaultName: '',
    azureEnvironment: 'AzureCloud',
    azureTimeout: 30,
    azureAuthMethod: 'workload-identity',
    azureClientId: '',
    azureClientSecret: '',
    azureCertificatePath: '',
    azureCertificatePassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [scopesInput, setScopesInput] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [annotationsInput, setAnnotationsInput] = useState('');

  useEffect(() => {
    if (provider) {
      populateFormData(provider);
    }
  }, [provider]);

  const populateFormData = (provider: VaultProvider | AWSProvider | AzureProvider) => {
    setFormData(prev => ({
      ...prev,
      name: provider.name,
      type: provider.type,
      scopes: provider.scopes,
      labels: provider.labels,
      annotations: provider.annotations
    }));

    if (provider.type === 'vault') {
      const vaultProvider = provider as VaultProvider;
      setFormData(prev => ({
        ...prev,
        vaultAddress: vaultProvider.config.address,
        vaultNamespace: vaultProvider.config.namespace || '',
        vaultTlsSkipVerify: vaultProvider.config.tlsSkipVerify,
        vaultTlsServerName: vaultProvider.config.tlsServerName || '',
        vaultTimeout: vaultProvider.config.timeout,
        vaultMaxRetries: vaultProvider.config.maxRetries,
        vaultAuthMethod: vaultProvider.auth.method,
        vaultRoleId: vaultProvider.auth.appRole?.roleId || '',
        vaultSecretId: vaultProvider.auth.appRole?.secretId || '',
        vaultK8sRole: vaultProvider.auth.kubernetes?.role || '',
        vaultK8sJwt: vaultProvider.auth.kubernetes?.jwt || '',
        vaultK8sMountPath: vaultProvider.auth.kubernetes?.mountPath || 'kubernetes',
        vaultToken: vaultProvider.auth.token || '',
        vaultLdapUsername: vaultProvider.auth.ldap?.username || '',
        vaultLdapPassword: vaultProvider.auth.ldap?.password || ''
      }));
    } else if (provider.type === 'aws') {
      const awsProvider = provider as AWSProvider;
      setFormData(prev => ({
        ...prev,
        awsRegion: awsProvider.config.region,
        awsEndpoint: awsProvider.config.endpoint || '',
        awsMaxRetries: awsProvider.config.maxRetries,
        awsTimeout: awsProvider.config.timeout,
        awsAuthMethod: awsProvider.auth.method,
        awsAccessKeyId: awsProvider.auth.accessKeyId || '',
        awsSecretAccessKey: awsProvider.auth.secretAccessKey || '',
        awsRoleArn: awsProvider.auth.roleArn || '',
        awsSessionName: awsProvider.auth.sessionName || ''
      }));
    } else if (provider.type === 'azure') {
      const azureProvider = provider as AzureProvider;
      setFormData(prev => ({
        ...prev,
        azureTenantId: azureProvider.config.tenantId,
        azureSubscriptionId: azureProvider.config.subscriptionId,
        azureResourceGroup: azureProvider.config.resourceGroup,
        azureVaultName: azureProvider.config.vaultName,
        azureEnvironment: azureProvider.config.environment,
        azureTimeout: azureProvider.config.timeout,
        azureAuthMethod: azureProvider.auth.method,
        azureClientId: azureProvider.auth.clientId || '',
        azureClientSecret: azureProvider.auth.clientSecret || '',
        azureCertificatePath: azureProvider.auth.certificatePath || '',
        azureCertificatePassword: azureProvider.auth.certificatePassword || ''
      }));
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

  const handleScopesChange = (value: string) => {
    setScopesInput(value);
  };

  const addScope = () => {
    if (scopesInput.trim() && !formData.scopes.includes(scopesInput.trim())) {
      setFormData(prev => ({
        ...prev,
        scopes: [...prev.scopes, scopesInput.trim()]
      }));
      setScopesInput('');
    }
  };

  const removeScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.filter(s => s !== scope)
    }));
  };

  const parseKeyValueInput = (input: string): Record<string, string> => {
    const result: Record<string, string> = {};
    input.split('\n').forEach(line => {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value) {
        result[key] = value;
      }
    });
    return result;
  };

  const formatKeyValueOutput = (obj: Record<string, string>): string => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  };

  const buildProviderConfig = (): ProviderCreateRequest => {
    const baseRequest: ProviderCreateRequest = {
      name: formData.name,
      type: formData.type,
      scopes: formData.scopes,
      labels: parseKeyValueInput(labelsInput),
      annotations: parseKeyValueInput(annotationsInput),
      config: {},
      auth: {}
    };

    if (formData.type === 'vault') {
      baseRequest.config = {
        address: formData.vaultAddress,
        namespace: formData.vaultNamespace || undefined,
        tlsSkipVerify: formData.vaultTlsSkipVerify,
        tlsServerName: formData.vaultTlsServerName || undefined,
        timeout: formData.vaultTimeout,
        maxRetries: formData.vaultMaxRetries
      };

      baseRequest.auth = {
        method: formData.vaultAuthMethod
      };

      switch (formData.vaultAuthMethod) {
        case 'approle':
          baseRequest.auth.appRole = {
            roleId: formData.vaultRoleId,
            secretId: formData.vaultSecretId
          };
          break;
        case 'kubernetes':
          baseRequest.auth.kubernetes = {
            role: formData.vaultK8sRole,
            jwt: formData.vaultK8sJwt,
            mountPath: formData.vaultK8sMountPath
          };
          break;
        case 'token':
          baseRequest.auth.token = formData.vaultToken;
          break;
        case 'ldap':
          baseRequest.auth.ldap = {
            username: formData.vaultLdapUsername,
            password: formData.vaultLdapPassword
          };
          break;
      }
    } else if (formData.type === 'aws') {
      baseRequest.config = {
        region: formData.awsRegion,
        endpoint: formData.awsEndpoint || undefined,
        maxRetries: formData.awsMaxRetries,
        timeout: formData.awsTimeout
      };

      baseRequest.auth = {
        method: formData.awsAuthMethod
      };

      switch (formData.awsAuthMethod) {
        case 'access-key':
          baseRequest.auth.accessKeyId = formData.awsAccessKeyId;
          baseRequest.auth.secretAccessKey = formData.awsSecretAccessKey;
          break;
        case 'assume-role':
          baseRequest.auth.roleArn = formData.awsRoleArn;
          baseRequest.auth.sessionName = formData.awsSessionName;
          break;
      }
    } else if (formData.type === 'azure') {
      baseRequest.config = {
        tenantId: formData.azureTenantId,
        subscriptionId: formData.azureSubscriptionId,
        resourceGroup: formData.azureResourceGroup,
        vaultName: formData.azureVaultName,
        environment: formData.azureEnvironment,
        timeout: formData.azureTimeout
      };

      baseRequest.auth = {
        method: formData.azureAuthMethod
      };

      switch (formData.azureAuthMethod) {
        case 'service-principal':
          baseRequest.auth.clientId = formData.azureClientId;
          baseRequest.auth.clientSecret = formData.azureClientSecret;
          break;
        case 'workload-identity':
          // Workload identity uses the pod's service account
          break;
      }
    }

    return baseRequest;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const request = buildProviderConfig();
      
      if (isEdit && provider) {
        // TODO: Implement update logic
        console.log('Update not yet implemented');
      } else {
        const result = await providersService.createProvider(request);
        if (result) {
          setSubmitSuccess(true);
          setTimeout(() => {
            navigate('/providers');
          }, 2000);
        } else {
          setSubmitError('Failed to create provider');
        }
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVaultForm = () => (
    <FormSection title="Vault Configuration" titleElement="h3">
      <Grid hasGutter>
        <GridItem span={6}>
          <FormGroup label="Vault Address" isRequired>
            <TextInput
              value={formData.vaultAddress}
              onChange={(value) => handleInputChange(value, 'vaultAddress')}
              placeholder="https://vault.example.com:8200"
              isRequired
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Namespace (optional)">
            <TextInput
              value={formData.vaultNamespace}
              onChange={(value) => handleInputChange(value, 'vaultNamespace')}
              placeholder="default"
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Timeout (seconds)">
            <NumberInput
              value={formData.vaultTimeout}
              onChange={(event) => handleNumberChange(Number(event.target.value), 'vaultTimeout')}
              min={1}
              max={300}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Max Retries">
            <NumberInput
              value={formData.vaultMaxRetries}
              onChange={(event) => handleNumberChange(Number(event.target.value), 'vaultMaxRetries')}
              min={0}
              max={10}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={12}>
          <FormGroup>
            <Checkbox
              label="Skip TLS verification (not recommended for production)"
              isChecked={formData.vaultTlsSkipVerify}
              onChange={(checked) => handleCheckboxChange(checked, 'vaultTlsSkipVerify')}
              id="vault-tls-skip"
            />
          </FormGroup>
        </GridItem>
        {!formData.vaultTlsSkipVerify && (
          <GridItem span={6}>
            <FormGroup label="TLS Server Name (optional)">
              <TextInput
                value={formData.vaultTlsServerName}
                onChange={(value) => handleInputChange(value, 'vaultTlsServerName')}
                placeholder="vault.example.com"
              />
            </FormGroup>
          </GridItem>
        )}
      </Grid>

      <Divider className="pf-v5-u-my-lg" />

      <FormGroup label="Authentication Method" isRequired>
        <Select
          variant={SelectVariant.single}
          selections={formData.vaultAuthMethod}
          onSelect={(event, selection) => handleInputChange(selection as string, 'vaultAuthMethod')}
        >
          <SelectOption value="approle">AppRole</SelectOption>
          <SelectOption value="kubernetes">Kubernetes</SelectOption>
          <SelectOption value="token">Token</SelectOption>
          <SelectOption value="ldap">LDAP</SelectOption>
        </Select>
      </FormGroup>

      {formData.vaultAuthMethod === 'approle' && (
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup label="Role ID" isRequired>
              <TextInput
                value={formData.vaultRoleId}
                onChange={(value) => handleInputChange(value, 'vaultRoleId')}
                placeholder="Enter AppRole Role ID"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="Secret ID" isRequired>
              <TextInput
                type="password"
                value={formData.vaultSecretId}
                onChange={(value) => handleInputChange(value, 'vaultSecretId')}
                placeholder="Enter AppRole Secret ID"
                isRequired
              />
            </FormGroup>
          </GridItem>
        </Grid>
      )}

      {formData.vaultAuthMethod === 'kubernetes' && (
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup label="Kubernetes Role" isRequired>
              <TextInput
                value={formData.vaultK8sRole}
                onChange={(value) => handleInputChange(value, 'vaultK8sRole')}
                placeholder="Enter Kubernetes role name"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="JWT Token" isRequired>
              <TextInput
                type="password"
                value={formData.vaultK8sJwt}
                onChange={(value) => handleInputChange(value, 'vaultK8sJwt')}
                placeholder="Enter JWT token"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="Mount Path">
              <TextInput
                value={formData.vaultK8sMountPath}
                onChange={(value) => handleInputChange(value, 'vaultK8sMountPath')}
                placeholder="kubernetes"
              />
            </FormGroup>
          </GridItem>
        </Grid>
      )}

      {formData.vaultAuthMethod === 'token' && (
        <FormGroup label="Token" isRequired>
          <TextInput
            type="password"
            value={formData.vaultToken}
            onChange={(value) => handleInputChange(value, 'vaultToken')}
            placeholder="Enter Vault token"
            isRequired
          />
        </FormGroup>
      )}

      {formData.vaultAuthMethod === 'ldap' && (
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup label="Username" isRequired>
              <TextInput
                value={formData.vaultLdapUsername}
                onChange={(value) => handleInputChange(value, 'vaultLdapUsername')}
                placeholder="Enter LDAP username"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="Password" isRequired>
              <TextInput
                type="password"
                value={formData.vaultLdapPassword}
                onChange={(value) => handleInputChange(value, 'vaultLdapPassword')}
                placeholder="Enter LDAP password"
                isRequired
              />
            </FormGroup>
          </GridItem>
        </Grid>
      )}
    </FormSection>
  );

  const renderAWSForm = () => (
    <FormSection title="AWS Configuration" titleElement="h3">
      <Grid hasGutter>
        <GridItem span={6}>
          <FormGroup label="Region" isRequired>
            <Select
              variant={SelectVariant.single}
              selections={formData.awsRegion}
              onSelect={(event, selection) => handleInputChange(selection as string, 'awsRegion')}
            >
              <SelectOption value="us-east-1">US East (N. Virginia)</SelectOption>
              <SelectOption value="us-west-2">US West (Oregon)</SelectOption>
              <SelectOption value="eu-west-1">Europe (Ireland)</SelectOption>
              <SelectOption value="ap-southeast-1">Asia Pacific (Singapore)</SelectOption>
            </Select>
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Endpoint (optional)">
            <TextInput
              value={formData.awsEndpoint}
              onChange={(value) => handleInputChange(value, 'awsEndpoint')}
              placeholder="https://secretsmanager.region.amazonaws.com"
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Timeout (seconds)">
            <NumberInput
              value={formData.awsTimeout}
              onChange={(event) => handleNumberChange(Number(event.target.value), 'awsTimeout')}
              min={1}
              max={300}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Max Retries">
            <NumberInput
              value={formData.awsMaxRetries}
              onChange={(event) => handleNumberChange(Number(event.target.value), 'awsMaxRetries')}
              min={0}
              max={10}
            />
          </FormGroup>
        </GridItem>
      </Grid>

      <Divider className="pf-v5-u-my-lg" />

      <FormGroup label="Authentication Method" isRequired>
        <Select
          variant={SelectVariant.single}
          selections={formData.awsAuthMethod}
          onSelect={(event, selection) => handleInputChange(selection as string, 'awsAuthMethod')}
        >
          <SelectOption value="iam-role">IAM Role (Recommended)</SelectOption>
          <SelectOption value="access-key">Access Key</SelectOption>
          <SelectOption value="assume-role">Assume Role</SelectOption>
        </Select>
      </FormGroup>

      {formData.awsAuthMethod === 'access-key' && (
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup label="Access Key ID" isRequired>
              <TextInput
                value={formData.awsAccessKeyId}
                onChange={(value) => handleInputChange(value, 'awsAccessKeyId')}
                placeholder="Enter AWS Access Key ID"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="Secret Access Key" isRequired>
              <TextInput
                type="password"
                value={formData.awsSecretAccessKey}
                onChange={(value) => handleInputChange(value, 'awsSecretAccessKey')}
                placeholder="Enter AWS Secret Access Key"
                isRequired
              />
            </FormGroup>
          </GridItem>
        </Grid>
      )}

      {formData.awsAuthMethod === 'assume-role' && (
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup label="Role ARN" isRequired>
              <TextInput
                value={formData.awsRoleArn}
                onChange={(value) => handleInputChange(value, 'awsRoleArn')}
                placeholder="arn:aws:iam::123456789012:role/role-name"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="Session Name">
              <TextInput
                value={formData.awsSessionName}
                onChange={(value) => handleInputChange(value, 'awsSessionName')}
                placeholder="Enter session name"
              />
            </FormGroup>
          </GridItem>
        </Grid>
      )}
    </FormSection>
  );

  const renderAzureForm = () => (
    <FormSection title="Azure Configuration" titleElement="h3">
      <Grid hasGutter>
        <GridItem span={6}>
          <FormGroup label="Tenant ID" isRequired>
            <TextInput
              value={formData.azureTenantId}
              onChange={(value) => handleInputChange(value, 'azureTenantId')}
              placeholder="Enter Azure Tenant ID"
              isRequired
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Subscription ID" isRequired>
            <TextInput
              value={formData.azureSubscriptionId}
              onChange={(value) => handleInputChange(value, 'azureSubscriptionId')}
              placeholder="Enter Azure Subscription ID"
              isRequired
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Resource Group" isRequired>
            <TextInput
              value={formData.azureResourceGroup}
              onChange={(value) => handleInputChange(value, 'azureResourceGroup')}
              placeholder="Enter Resource Group name"
              isRequired
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Key Vault Name" isRequired>
            <TextInput
              value={formData.azureVaultName}
              onChange={(value) => handleInputChange(value, 'azureVaultName')}
              placeholder="Enter Key Vault name"
              isRequired
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Environment">
            <Select
              variant={SelectVariant.single}
              selections={formData.azureEnvironment}
              onSelect={(event, selection) => handleInputChange(selection as string, 'azureEnvironment')}
            >
              <SelectOption value="AzureCloud">Azure Cloud</SelectOption>
              <SelectOption value="AzureUSGovernment">Azure US Government</SelectOption>
              <SelectOption value="AzureChinaCloud">Azure China Cloud</SelectOption>
            </Select>
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup label="Timeout (seconds)">
            <NumberInput
              value={formData.azureTimeout}
              onChange={(event) => handleNumberChange(Number(event.target.value), 'azureTimeout')}
              min={1}
              max={300}
            />
          </FormGroup>
        </GridItem>
      </Grid>

      <Divider className="pf-v5-u-my-lg" />

      <FormGroup label="Authentication Method" isRequired>
        <Select
          variant={SelectVariant.single}
          selections={formData.azureAuthMethod}
          onSelect={(event, selection) => handleInputChange(selection as string, 'azureAuthMethod')}
        >
          <SelectOption value="workload-identity">Workload Identity (Recommended)</SelectOption>
          <SelectOption value="service-principal">Service Principal</SelectOption>
          <SelectOption value="managed-identity">Managed Identity</SelectOption>
        </Select>
      </FormGroup>

      {formData.azureAuthMethod === 'service-principal' && (
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup label="Client ID" isRequired>
              <TextInput
                value={formData.azureClientId}
                onChange={(value) => handleInputChange(value, 'azureClientId')}
                placeholder="Enter Azure Client ID"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label="Client Secret" isRequired>
              <TextInput
                type="password"
                value={formData.azureClientSecret}
                onChange={(value) => handleInputChange(value, 'azureClientSecret')}
                placeholder="Enter Azure Client Secret"
                isRequired
              />
            </FormGroup>
          </GridItem>
        </Grid>
      )}
    </FormSection>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Title headingLevel="h2" size="xl">
            {isEdit ? 'Edit Provider' : 'Add New Provider'}
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
            Provider created successfully! Redirecting...
          </Alert>
        )}

        <Form>
          <FormSection title="Basic Information" titleElement="h3">
            <Grid hasGutter>
              <GridItem span={6}>
                <FormGroup label="Provider Name" isRequired>
                  <TextInput
                    value={formData.name}
                    onChange={(value) => handleInputChange(value, 'name')}
                    placeholder="Enter provider name"
                    isRequired
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup label="Provider Type" isRequired>
                  <Select
                    variant={SelectVariant.single}
                    selections={formData.type}
                    onSelect={(event, selection) => handleInputChange(selection as string, 'type')}
                    isDisabled={isEdit}
                  >
                    <SelectOption value="vault">HashiCorp Vault</SelectOption>
                    <SelectOption value="aws">AWS Secrets Manager</SelectOption>
                    <SelectOption value="azure">Azure Key Vault</SelectOption>
                  </Select>
                </FormGroup>
              </GridItem>
            </Grid>

            <FormGroup label="Scopes">
              <div className="pf-v5-u-display-flex pf-v5-u-align-items-center">
                <TextInput
                  value={scopesInput}
                  onChange={handleScopesChange}
                  placeholder="Enter scope name"
                  className="pf-v5-u-mr-sm"
                />
                <Button
                  variant={ButtonVariant.secondary}
                  onClick={addScope}
                  isDisabled={!scopesInput.trim()}
                >
                  Add
                </Button>
              </div>
              {formData.scopes.length > 0 && (
                <div className="pf-v5-u-mt-sm">
                  {formData.scopes.map((scope, index) => (
                    <span
                      key={index}
                      className="pf-v5-c-badge pf-m-outline pf-v5-u-mr-xs pf-v5-u-mb-xs"
                    >
                      {scope}
                      <Button
                        variant={ButtonVariant.plain}
                        onClick={() => removeScope(scope)}
                        className="pf-v5-u-ml-xs"
                      >
                        ×
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </FormGroup>

            <FormGroup label="Labels (key=value, one per line)">
              <TextArea
                value={labelsInput}
                onChange={setLabelsInput}
                placeholder="environment=production&#10;team=engineering&#10;cost-center=12345"
                rows={3}
              />
              <HelperText>
                <HelperTextItem>Enter labels in key=value format, one per line</HelperTextItem>
              </HelperText>
            </FormGroup>

            <FormGroup label="Annotations (key=value, one per line)">
              <TextArea
                value={annotationsInput}
                onChange={setAnnotationsInput}
                placeholder="description=Production database credentials&#10;owner=db-team"
                rows={3}
              />
              <HelperText>
                <HelperTextItem>Enter annotations in key=value format, one per line</HelperTextItem>
              </HelperText>
            </FormGroup>
          </FormSection>

          {formData.type === 'vault' && renderVaultForm()}
          {formData.type === 'aws' && renderAWSForm()}
          {formData.type === 'azure' && renderAzureForm()}

          <FormSection>
            <div className="pf-v5-u-display-flex pf-v5-u-justify-content-flex-end pf-v5-u-gap-md">
              <Button
                variant={ButtonVariant.secondary}
                onClick={() => navigate('/providers')}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!formData.name.trim()}
              >
                {isEdit ? 'Update Provider' : 'Create Provider'}
              </Button>
            </div>
          </FormSection>
        </Form>
      </CardBody>
    </Card>
  );
};

export default ProviderForm;
