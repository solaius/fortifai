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
  Alert,
  AlertVariant
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

interface Provider {
  id: string;
  name: string;
  type: 'vault' | 'aws' | 'azure';
  status: 'healthy' | 'warning' | 'critical' | 'disconnected';
  authMethod: string;
  address: string;
  scopes: string[];
  lastHealthCheck: string;
  secretCount: number;
}

const Providers: React.FC = () => {
  const navigate = useNavigate();
  const [providers] = useState<Provider[]>([
    {
      id: 'vault-1',
      name: 'Corporate Vault',
      type: 'vault',
      status: 'healthy',
      authMethod: 'AppRole',
      address: 'https://vault.corp.example.com:8200',
      scopes: ['finance', 'engineering'],
      lastHealthCheck: '2 minutes ago',
      secretCount: 45
    },
    {
      id: 'aws-1',
      name: 'AWS Secrets Manager',
      type: 'aws',
      status: 'healthy',
      authMethod: 'IAM Role',
      address: 'us-east-1',
      scopes: ['production', 'staging'],
      lastHealthCheck: '5 minutes ago',
      secretCount: 32
    },
    {
      id: 'azure-1',
      name: 'Azure Key Vault',
      type: 'azure',
      status: 'warning',
      authMethod: 'Workload Identity',
      address: 'eastus',
      scopes: ['development'],
      lastHealthCheck: '1 hour ago',
      secretCount: 18
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon style={{ color: 'var(--pf-v5-global--success-color--100)' }} />;
      case 'warning':
        return <ExclamationTriangleIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      case 'critical':
        return <ExclamationCircleIcon style={{ color: 'var(--pf-v5-global--danger-color--100)' }} />;
      default:
        return <ExclamationCircleIcon style={{ color: 'var(--pf-v5-global--Color--200)' }} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="pf-v5-c-badge pf-m-success">Healthy</span>;
      case 'warning':
        return <span className="pf-v5-c-badge pf-m-warning">Warning</span>;
      case 'critical':
        return <span className="pf-v5-c-badge pf-m-danger">Critical</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Disconnected</span>;
    }
  };

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

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'vault':
        return 'HashiCorp Vault';
      case 'aws':
        return 'AWS Secrets Manager';
      case 'azure':
        return 'Azure Key Vault';
      default:
        return type;
    }
  };

  if (providers.length === 0) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Secret Providers
          </Title>
          <p>
            Configure and manage your secret providers
          </p>
        </div>

        <Card className="pf-v5-u-mt-xl">
          <CardBody style={{ textAlign: 'center', padding: 'var(--pf-v5-global--spacer--xl)' }}>
            <SearchIcon size={24} style={{ color: 'var(--pf-v5-global--Color--200)', marginBottom: 'var(--pf-v5-global--spacer--md)' }} />
            <Title headingLevel="h4" className="pf-v5-u-mb-md">
              No providers configured
            </Title>
            <p className="pf-v5-u-mb-lg">
              Get started by adding your first secret provider to begin managing secrets.
            </p>
            <Button
              variant={ButtonVariant.primary}
              icon={<PlusIcon />}
              onClick={() => navigate('/providers/new')}
            >
              Add Provider
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
          Secret Providers
        </Title>
        <p>
          Configure and manage your secret providers
        </p>
      </div>

      {/* Health Summary */}
      <Alert
        variant={AlertVariant.info}
        title="Provider Health Summary"
        className="pf-v5-u-mt-md"
      >
        {providers.filter(p => p.status === 'healthy').length} of {providers.length} providers are healthy.
      </Alert>

      {/* Actions */}
      <Flex className="pf-v5-u-mt-md">
        <FlexItem>
          <Button
            variant={ButtonVariant.primary}
            icon={<PlusIcon />}
            onClick={() => navigate('/providers/new')}
          >
            Add Provider
          </Button>
        </FlexItem>
      </Flex>

      {/* Provider Cards */}
      <Grid hasGutter className="pf-v5-u-mt-md">
        {providers.map((provider) => (
          <GridItem key={provider.id} span={4}>
            <Card 
              isClickable 
              onClick={() => navigate(`/providers/${provider.id}`)}
            >
              <CardHeader>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                  {getProviderIcon(provider.type)}
                  <div>
                    <CardTitle>{provider.name}</CardTitle>
                    <small style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                      {getProviderTypeLabel(provider.type)}
                    </small>
                  </div>
                </Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  {getStatusIcon(provider.status)}
                </FlexItem>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Status:
                  </small>
                  <span style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {getStatusBadge(provider.status)}
                  </span>
                </div>
                
                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Auth Method:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {provider.authMethod}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Address:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {provider.address}
                  </small>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Scopes:
                  </small>
                  <div style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                                         {provider.scopes.map((scope, index) => (
                       <span key={index} className="pf-v5-c-badge pf-m-outline" style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>
                         {scope}
                       </span>
                     ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  <small style={{ fontWeight: 'bold' }}>
                    Secrets:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {provider.secretCount} references
                  </small>
                </div>

                <div>
                  <small style={{ fontWeight: 'bold' }}>
                    Last Health Check:
                  </small>
                  <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                    {provider.lastHealthCheck}
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

export default Providers;
