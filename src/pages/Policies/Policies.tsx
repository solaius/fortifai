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
import ShieldAltIcon from '@patternfly/react-icons/dist/esm/icons/shield-alt-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import UserIcon from '@patternfly/react-icons/dist/esm/icons/user-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';

interface Policy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  roles: string[];
  providers: string[];
  pathPrefixes: string[];
  targetTypes: string[];
  actions: string[];
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const Policies: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [effectFilter, setEffectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEffectFilterOpen, setIsEffectFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const [policies] = useState<Policy[]>([
    {
      id: 'policy-1',
      name: 'Finance Team Access',
      description: 'Allow finance team to access financial secrets',
      effect: 'allow',
      roles: ['finance-admin', 'finance-user'],
      providers: ['Corporate Vault'],
      pathPrefixes: ['kv/data/finance/'],
      targetTypes: ['mcp-server', 'notebook'],
      actions: ['read', 'bind'],
      status: 'active',
      priority: 100,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      createdBy: 'admin'
    },
    {
      id: 'policy-2',
      name: 'Production Secrets Deny',
      description: 'Deny access to production secrets for non-production users',
      effect: 'deny',
      roles: ['developer', 'data-scientist'],
      providers: ['Corporate Vault', 'AWS Secrets Manager'],
      pathPrefixes: ['kv/data/prod/', 'aws/prod/'],
      targetTypes: ['mcp-server', 'agent', 'notebook', 'job'],
      actions: ['read', 'bind'],
      status: 'active',
      priority: 200,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
      createdBy: 'admin'
    },
    {
      id: 'policy-3',
      name: 'ML Team Access',
      description: 'Allow ML team to access AI and data secrets',
      effect: 'allow',
      roles: ['ml-engineer', 'data-scientist'],
      providers: ['Corporate Vault', 'Azure Key Vault'],
      pathPrefixes: ['kv/data/ml/', 'azure/ml/'],
      targetTypes: ['mcp-server', 'notebook', 'job'],
      actions: ['read', 'bind'],
      status: 'active',
      priority: 150,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      createdBy: 'admin'
    },
    {
      id: 'policy-4',
      name: 'Staging Environment Access',
      description: 'Allow staging environment access for testing',
      effect: 'allow',
      roles: ['developer', 'qa-engineer'],
      providers: ['Corporate Vault'],
      pathPrefixes: ['kv/data/staging/'],
      targetTypes: ['mcp-server', 'notebook'],
      actions: ['read', 'bind'],
      status: 'inactive',
      priority: 50,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05',
      createdBy: 'admin'
    }
  ]);

  const getEffectBadge = (effect: string) => {
    switch (effect) {
      case 'allow':
        return <span className="pf-v5-c-badge pf-m-success">Allow</span>;
      case 'deny':
        return <span className="pf-v5-c-badge pf-m-danger">Deny</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Unknown</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="pf-v5-c-badge pf-m-success">Active</span>;
      case 'inactive':
        return <span className="pf-v5-c-badge pf-m-default">Inactive</span>;
      case 'draft':
        return <span className="pf-v5-c-badge pf-m-warning">Draft</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Unknown</span>;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 200) return 'var(--pf-v5-global--danger-color--100)';
    if (priority >= 150) return 'var(--pf-v5-global--warning-color--100)';
    return 'var(--pf-v5-global--success-color--100)';
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchValue.toLowerCase()) ||
                         policy.roles.some(role => role.toLowerCase().includes(searchValue.toLowerCase()));
    const matchesEffect = effectFilter === 'all' || policy.effect === effectFilter;
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    
    return matchesSearch && matchesEffect && matchesStatus;
  });

  const effectOptions = [
    { value: 'all', label: 'All Effects' },
    { value: 'allow', label: 'Allow' },
    { value: 'deny', label: 'Deny' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];

  if (policies.length === 0) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Access Policies
          </Title>
          <p>
            Manage access policies for secret bindings
          </p>
        </div>

        <Card className="pf-v5-u-mt-xl">
          <CardBody style={{ textAlign: 'center', padding: 'var(--pf-v5-global--spacer--xl)' }}>
            <SearchIcon size="lg" style={{ color: 'var(--pf-v5-global--Color--200)', marginBottom: 'var(--pf-v5-global--spacer--md)' }} />
            <Title headingLevel="h4" className="pf-v5-u-mb-md">
              No access policies found
            </Title>
            <p className="pf-v5-u-mb-lg">
              Get started by creating your first access policy to control who can access which secrets.
            </p>
            <Button
              variant={ButtonVariant.primary}
              icon={<PlusIcon />}
              onClick={() => navigate('/policies/new')}
            >
              Create Policy
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
          Access Policies
        </Title>
        <p>
          Manage access policies for secret bindings
        </p>
      </div>

      {/* Summary Alert */}
      <Alert
        variant={AlertVariant.info}
        title="Policy Summary"
        className="pf-v5-u-mt-md"
      >
        {filteredPolicies.length} of {policies.length} policies shown. {policies.filter(p => p.status === 'active').length} are currently active.
      </Alert>

      {/* Toolbar */}
      <Toolbar className="pf-v5-u-mt-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                placeholder="Search policies..."
                value={searchValue}
                onChange={setSearchValue}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isEffectFilterOpen}
                onSelect={(event, selection) => {
                  setEffectFilter(selection as string);
                  setIsEffectFilterOpen(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsEffectFilterOpen(!isEffectFilterOpen)} isExpanded={isEffectFilterOpen}>
                    {effectOptions.find(option => option.value === effectFilter)?.label || 'All Effects'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {effectOptions.map((option) => (
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
                onClick={() => navigate('/policies/new')}
              >
                Create Policy
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      {/* Policy Cards */}
      <Grid hasGutter className="pf-v5-u-mt-md">
        {filteredPolicies.map((policy) => (
          <GridItem key={policy.id} span={6}>
            <Card 
              isClickable 
              onClick={() => navigate(`/policies/${policy.id}`)}
            >
              <CardHeader>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                  <ShieldAltIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                  <div>
                    <CardTitle>{policy.name}</CardTitle>
                                         <small style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                       Priority: {policy.priority}
                     </small>
                  </div>
                </Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  <Flex gap={{ default: 'gapSm' }}>
                    {getEffectBadge(policy.effect)}
                    {getStatusBadge(policy.status)}
                  </Flex>
                </FlexItem>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Description:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.description}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Roles:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                                         {policy.roles.map((role, index) => (
                       <span key={index} className="pf-v5-c-badge pf-m-outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                         {role}
                       </span>
                     ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Providers:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.providers.map((provider, index) => (
                                      <Badge key={index} variant="outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                  {provider}
                </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Path Prefixes:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.pathPrefixes.map((prefix, index) => (
                      <Badge key={index} variant="outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                        {prefix}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Target Types:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.targetTypes.map((type, index) => (
                      <Badge key={index} variant="outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Actions:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.actions.map((action, index) => (
                                      <Badge key={index} variant="outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                  {action}
                </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Created:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.createdAt} by {policy.createdBy}
                  </small>
                </div>

                <div>
                  <small style={{ fontWeight: 'bold' }}>
                    Updated:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {policy.updatedAt}
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

export default Policies;
