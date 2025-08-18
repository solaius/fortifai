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
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import LinkIcon from '@patternfly/react-icons/dist/esm/icons/link-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import UserIcon from '@patternfly/react-icons/dist/esm/icons/user-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';

interface Binding {
  id: string;
  name: string;
  targetType: 'mcp-server' | 'agent' | 'notebook' | 'job';
  targetName: string;
  secretName: string;
  secretPath: string;
  envVarName: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  lastUsed: string;
  required: boolean;
}

const Bindings: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isTargetTypeFilterOpen, setIsTargetTypeFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const [bindings] = useState<Binding[]>([
    {
      id: 'binding-1',
      name: 'OpenAI API Key for MCP Server',
      targetType: 'mcp-server',
      targetName: 'openai-mcp-server',
      secretName: 'OpenAI API Key',
      secretPath: 'kv/data/openai/api-key',
      envVarName: 'OPENAI_API_KEY',
      provider: 'Corporate Vault',
      status: 'active',
      createdAt: '2024-01-15',
      lastUsed: '2 minutes ago',
      required: true
    },
    {
      id: 'binding-2',
      name: 'Database Password for Notebook',
      targetType: 'notebook',
      targetName: 'ml-training-notebook',
      secretName: 'Database Password',
      secretPath: 'kv/data/database/password',
      envVarName: 'DB_PASSWORD',
      provider: 'Corporate Vault',
      status: 'active',
      createdAt: '2024-01-10',
      lastUsed: '1 hour ago',
      required: true
    },
    {
      id: 'binding-3',
      name: 'AWS Access Key for Agent',
      targetType: 'agent',
      targetName: 'data-processing-agent',
      secretName: 'AWS Access Key',
      secretPath: 'aws/access-keys/app-1',
      envVarName: 'AWS_ACCESS_KEY_ID',
      provider: 'AWS Secrets Manager',
      status: 'active',
      createdAt: '2024-01-20',
      lastUsed: '30 minutes ago',
      required: true
    },
    {
      id: 'binding-4',
      name: 'Azure Service Principal for Job',
      targetType: 'job',
      targetName: 'batch-inference-job',
      secretName: 'Azure Service Principal',
      secretPath: 'azure/service-principals/ml-service',
      envVarName: 'AZURE_CLIENT_ID',
      provider: 'Azure Key Vault',
      status: 'inactive',
      createdAt: '2024-01-05',
      lastUsed: 'Never',
      required: false
    }
  ]);

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'mcp-server':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />;
      case 'agent':
        return <UserIcon style={{ color: 'var(--pf-v5-global--success-color--100)' }} />;
      case 'notebook':
        return <DatabaseIcon style={{ color: 'var(--pf-v5-global--info-color--100)' }} />;
      case 'job':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      default:
        return <ServerIcon />;
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'mcp-server':
        return 'MCP Server';
      case 'agent':
        return 'Agent';
      case 'notebook':
        return 'Notebook';
      case 'job':
        return 'Job';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="pf-v5-c-badge pf-m-success">Active</span>;
      case 'inactive':
        return <span className="pf-v5-c-badge pf-m-default">Inactive</span>;
      case 'error':
        return <span className="pf-v5-c-badge pf-m-danger">Error</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Unknown</span>;
    }
  };

  const filteredBindings = bindings.filter(binding => {
    const matchesSearch = binding.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         binding.targetName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         binding.secretName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         binding.envVarName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesTargetType = targetTypeFilter === 'all' || binding.targetType === targetTypeFilter;
    const matchesStatus = statusFilter === 'all' || binding.status === statusFilter;
    
    return matchesSearch && matchesTargetType && matchesStatus;
  });

  const targetTypeOptions = [
    { value: 'all', label: 'All Targets' },
    { value: 'mcp-server', label: 'MCP Servers' },
    { value: 'agent', label: 'Agents' },
    { value: 'notebook', label: 'Notebooks' },
    { value: 'job', label: 'Jobs' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'error', label: 'Error' }
  ];

  if (bindings.length === 0) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Secret Bindings
          </Title>
          <p>
            Manage secret bindings to MCP servers, agents, notebooks, and jobs
          </p>
        </div>

        <Card className="pf-v5-u-mt-xl">
          <CardBody style={{ textAlign: 'center', padding: 'var(--pf-v5-global--spacer--xl)' }}>
            <SearchIcon size="lg" style={{ color: 'var(--pf-v5-global--Color--200)', marginBottom: 'var(--pf-v5-global--spacer--md)' }} />
            <Title headingLevel="h4" className="pf-v5-u-mb-md">
              No secret bindings found
            </Title>
            <p className="pf-v5-u-mb-lg">
              Get started by creating your first secret binding to connect secrets to your workloads.
            </p>
            <Button
              variant={ButtonVariant.primary}
              icon={<PlusIcon />}
              onClick={() => navigate('/bindings/new')}
            >
              Create Binding
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
          Secret Bindings
        </Title>
        <p>
          Manage secret bindings to MCP servers, agents, notebooks, and jobs
        </p>
      </div>

      {/* Summary Alert */}
      <Alert
        variant={AlertVariant.info}
        title="Bindings Summary"
        className="pf-v5-u-mt-md"
      >
        {filteredBindings.length} of {bindings.length} bindings shown. {bindings.filter(b => b.status === 'active').length} are currently active.
      </Alert>

      {/* Toolbar */}
      <Toolbar className="pf-v5-u-mt-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                placeholder="Search bindings..."
                value={searchValue}
                onChange={setSearchValue}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isTargetTypeFilterOpen}
                onSelect={(event, selection) => {
                  setTargetTypeFilter(selection as string);
                  setIsTargetTypeFilterOpen(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsTargetTypeFilterOpen(!isTargetTypeFilterOpen)} isExpanded={isTargetTypeFilterOpen}>
                    {targetTypeOptions.find(option => option.value === targetTypeFilter)?.label || 'All Target Types'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {targetTypeOptions.map((option) => (
                    <DropdownItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isStatusFilterOpen}
                onSelect={(event, selection) => {
                  setStatusFilter(selection as string);
                  setIsStatusFilterOpen(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)} isExpanded={isStatusFilterOpen}>
                    {statusOptions.find(option => option.value === statusFilter)?.label || 'All Status'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {statusOptions.map((option) => (
                    <DropdownItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<PlusIcon />}
                onClick={() => navigate('/bindings/new')}
              >
                Create Binding
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      {/* Binding Cards */}
      <Grid hasGutter className="pf-v5-u-mt-md">
        {filteredBindings.map((binding) => (
          <GridItem key={binding.id} span={6}>
            <Card isClickable onClick={() => navigate(`/bindings/${binding.id}`)}>
              <CardHeader>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                  {getTargetTypeIcon(binding.targetType)}
                  <div>
                    <CardTitle>{binding.name}</CardTitle>
                                         <small style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                       {getTargetTypeLabel(binding.targetType)}: {binding.targetName}
                     </small>
                  </div>
                </Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  {getStatusBadge(binding.status)}
                </FlexItem>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Secret:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {binding.secretName}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Environment Variable:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {binding.envVarName}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Provider:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {binding.provider}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Required:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {binding.required ? 'Yes' : 'No'}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Created:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {binding.createdAt}
                  </small>
                </div>

                <div>
                  <small style={{ fontWeight: 'bold' }}>
                    Last Used:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {binding.lastUsed}
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

export default Bindings;
