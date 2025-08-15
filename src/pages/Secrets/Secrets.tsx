import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Title,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Badge,
  Alert,
  AlertVariant,
  SearchInput,
  Select,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import TagIcon from '@patternfly/react-icons/dist/esm/icons/tag-icon';
import CalendarAltIcon from '@patternfly/react-icons/dist/esm/icons/calendar-alt-icon';

interface SecretReference {
  id: string;
  name: string;
  path: string;
  provider: string;
  providerType: 'vault' | 'aws' | 'azure';
  version: string;
  labels: string[];
  lastRotated: string;
  bindings: number;
  status: 'active' | 'inactive' | 'expired';
}

const Secrets: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isProviderFilterOpen, setIsProviderFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const [secrets] = useState<SecretReference[]>([
    {
      id: 'secret-1',
      name: 'OpenAI API Key',
      path: 'kv/data/openai/api-key',
      provider: 'Corporate Vault',
      providerType: 'vault',
      version: 'latest',
      labels: ['ai', 'api', 'production'],
      lastRotated: '2024-01-15',
      bindings: 3,
      status: 'active'
    },
    {
      id: 'secret-2',
      name: 'Database Password',
      path: 'kv/data/database/password',
      provider: 'Corporate Vault',
      providerType: 'vault',
      version: 'v2',
      labels: ['database', 'production'],
      lastRotated: '2024-01-10',
      bindings: 1,
      status: 'active'
    },
    {
      id: 'secret-3',
      name: 'AWS Access Key',
      path: 'aws/access-keys/app-1',
      provider: 'AWS Secrets Manager',
      providerType: 'aws',
      version: 'latest',
      labels: ['aws', 'access-key', 'staging'],
      lastRotated: '2024-01-20',
      bindings: 2,
      status: 'active'
    },
    {
      id: 'secret-4',
      name: 'Azure Service Principal',
      path: 'azure/service-principals/ml-service',
      provider: 'Azure Key Vault',
      providerType: 'azure',
      version: 'v1',
      labels: ['azure', 'service-principal', 'ml'],
      lastRotated: '2024-01-05',
      bindings: 0,
      status: 'inactive'
    }
  ]);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'vault':
        return <DatabaseIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />;
      case 'aws':
        return <DatabaseIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      case 'azure':
        return <DatabaseIcon style={{ color: 'var(--pf-v5-global--info-color--100)' }} />;
      default:
        return <DatabaseIcon />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="pf-v5-c-badge pf-m-success">Active</span>;
      case 'inactive':
        return <span className="pf-v5-c-badge pf-m-default">Inactive</span>;
      case 'expired':
        return <span className="pf-v5-c-badge pf-m-danger">Expired</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Unknown</span>;
    }
  };

  const filteredSecrets = secrets.filter(secret => {
    const matchesSearch = secret.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         secret.path.toLowerCase().includes(searchValue.toLowerCase()) ||
                         secret.labels.some(label => label.toLowerCase().includes(searchValue.toLowerCase()));
    const matchesProvider = providerFilter === 'all' || secret.providerType === providerFilter;
    const matchesStatus = statusFilter === 'all' || secret.status === statusFilter;
    
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const providerOptions = [
    { value: 'all', label: 'All Providers' },
    { value: 'vault', label: 'HashiCorp Vault' },
    { value: 'aws', label: 'AWS Secrets Manager' },
    { value: 'azure', label: 'Azure Key Vault' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' }
  ];

  if (secrets.length === 0) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Secrets Catalog
          </Title>
          <p>
            Browse and manage your secret references
          </p>
        </div>

        <Card className="pf-v5-u-mt-xl">
          <CardBody style={{ textAlign: 'center', padding: 'var(--pf-v5-global--spacer--xl)' }}>
            <SearchIcon size="lg" style={{ color: 'var(--pf-v5-global--Color--200)', marginBottom: 'var(--pf-v5-global--spacer--md)' }} />
            <Title headingLevel="h4" className="pf-v5-u-mb-md">
              No secret references found
            </Title>
            <p className="pf-v5-u-mb-lg">
              Get started by creating your first secret reference from an available provider.
            </p>
            <Button
              variant={ButtonVariant.primary}
              icon={<PlusIcon />}
              onClick={() => navigate('/secrets/new')}
            >
              Create Secret Reference
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Title headingLevel="h1" size="2xl">
          Secrets Catalog
        </Title>
        <p>
          Browse and manage your secret references
        </p>
      </div>

      {/* Summary Alert */}
      <Alert
        variant={AlertVariant.info}
        title="Secret References Summary"
        className="pf-v5-u-mt-md"
      >
        {filteredSecrets.length} of {secrets.length} secret references shown. {secrets.filter(s => s.status === 'active').length} are currently active.
      </Alert>

      {/* Toolbar */}
      <Toolbar className="pf-v5-u-mt-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                placeholder="Search secrets..."
                value={searchValue}
                onChange={setSearchValue}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Select
                isOpen={isProviderFilterOpen}
                onToggle={() => setIsProviderFilterOpen(!isProviderFilterOpen)}
                selections={providerFilter}
                onSelect={(event, selection) => {
                  setProviderFilter(selection as string);
                  setIsProviderFilterOpen(false);
                }}
              >
                {providerOptions.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <Select
                isOpen={isStatusFilterOpen}
                onToggle={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                selections={statusFilter}
                onSelect={(event, selection) => {
                  setStatusFilter(selection as string);
                  setIsStatusFilterOpen(false);
                }}
              >
                {statusOptions.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<PlusIcon />}
                onClick={() => navigate('/secrets/new')}
              >
                Create Reference
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      {/* Secret Cards */}
      <Grid hasGutter className="pf-v5-u-mt-md">
        {filteredSecrets.map((secret) => (
          <GridItem key={secret.id} span={6}>
            <Card isHoverable onClick={() => navigate(`/secrets/${secret.id}`)}>
              <CardHeader>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                  {getProviderIcon(secret.providerType)}
                  <div>
                    <CardTitle>{secret.name}</CardTitle>
                    <small style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                      {secret.provider}
                    </small>
                  </div>
                </Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  {getStatusBadge(secret.status)}
                </FlexItem>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Path:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {secret.path}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Version:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {secret.version}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Labels:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                                         {secret.labels.map((label, index) => (
                       <span key={index} className="pf-v5-c-badge pf-m-outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                         {label}
                       </span>
                     ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Bindings:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {secret.bindings} active binding{secret.bindings !== 1 ? 's' : ''}
                  </small>
                </div>

                <div>
                  <small style={{ fontWeight: 'bold' }}>
                    Last Rotated:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {secret.lastRotated}
                  </small>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default Secrets;
