import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  Title,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Alert,
  AlertVariant
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';
import LinkIcon from '@patternfly/react-icons/dist/esm/icons/link-icon';
import ShieldAltIcon from '@patternfly/react-icons/dist/esm/icons/shield-alt-icon';
import ClipboardIcon from '@patternfly/react-icons/dist/esm/icons/clipboard-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - in real app this would come from API
  const stats = {
    providers: 3,
    secrets: 127,
    bindings: 89,
    policies: 12,
    recentEvents: 5,
    healthStatus: 'healthy' as 'healthy' | 'warning' | 'critical'
  };

  const recentEvents = [
    { id: 1, action: 'Secret accessed', target: 'openai-api-key', user: 'admin', time: '2 minutes ago', status: 'success' },
    { id: 2, action: 'Provider health check', target: 'vault-corp', user: 'system', time: '5 minutes ago', status: 'success' },
    { id: 3, action: 'Binding created', target: 'mcp-server-1', user: 'engineer', time: '10 minutes ago', status: 'success' },
    { id: 4, action: 'Policy updated', target: 'finance-policy', user: 'admin', time: '15 minutes ago', status: 'success' },
    { id: 5, action: 'Secret rotation', target: 'database-password', user: 'system', time: '1 hour ago', status: 'success' }
  ];

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon style={{ color: 'var(--pf-v5-global--success-color--100)' }} />;
      case 'warning':
        return <ExclamationTriangleIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      case 'critical':
        return <ExclamationTriangleIcon style={{ color: 'var(--pf-v5-global--danger-color--100)' }} />;
      default:
        return null;
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="pf-v5-c-badge pf-m-success">Healthy</span>;
      case 'warning':
        return <span className="pf-v5-c-badge pf-m-warning">Warning</span>;
      case 'critical':
        return <span className="pf-v5-c-badge pf-m-danger">Critical</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Unknown</span>;
    }
  };

  return (
    <div>
      <div>
        <Title headingLevel="h1" size="2xl">
          Secrets Management Dashboard
        </Title>
        <p>
          Monitor and manage your secret providers, references, and access policies
        </p>
      </div>

      {/* Health Status Alert */}
      <Alert
        variant={stats.healthStatus === 'healthy' ? AlertVariant.success : AlertVariant.warning}
        title={`System Status: ${stats.healthStatus.charAt(0).toUpperCase() + stats.healthStatus.slice(1)}`}
        className="pf-v5-u-mt-md"
      >
        All secret providers are operational and accessible.
      </Alert>

      {/* Quick Actions */}
      <Card className="pf-v5-u-mt-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <Flex gap={{ default: 'gapMd' }} wrap="wrap">
            <FlexItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<PlusIcon />}
                onClick={() => navigate('/providers/new')}
              >
                Add Provider
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant={ButtonVariant.secondary}
                icon={<KeyIcon />}
                onClick={() => navigate('/secrets/new')}
              >
                Create Secret Reference
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant={ButtonVariant.secondary}
                icon={<LinkIcon />}
                onClick={() => navigate('/bindings/new')}
              >
                Create Binding
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant={ButtonVariant.secondary}
                icon={<ShieldAltIcon />}
                onClick={() => navigate('/policies/new')}
              >
                Create Policy
              </Button>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <Grid hasGutter className="pf-v5-u-mt-lg pf-v5-u-mb-md">
        <GridItem span={3}>
          <Card className="pf-v5-u-mb-sm">
            <CardBody>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <DatabaseIcon size={24} style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                                 <div>
                   <h2>{stats.providers}</h2>
                   <small>Secret Providers</small>
                 </div>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card className="pf-v5-u-mb-sm">
            <CardBody>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <KeyIcon size={24} style={{ color: 'var(--pf-v5-global--success-color--100)' }} />
                                 <div>
                   <h2>{stats.secrets}</h2>
                   <small>Secret References</small>
                 </div>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card className="pf-v5-u-mb-sm">
            <CardBody>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <LinkIcon size={24} style={{ color: 'var(--pf-v5-global--success-color--100)' }} />
                                 <div>
                   <h2>{stats.bindings}</h2>
                   <small>Active Bindings</small>
                 </div>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={3}>
          <Card className="pf-v5-u-mb-sm">
            <CardBody>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <ShieldAltIcon size={24} style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />
                                 <div>
                   <h2>{stats.policies}</h2>
                   <small>Access Policies</small>
                 </div>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Recent Activity */}
      <Card className="pf-v5-u-mt-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {recentEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: 'var(--pf-v5-global--spacer--sm) 0',
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                                 <div>
                   <p style={{ fontWeight: 'bold' }}>
                     {event.action}
                   </p>
                   <small style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                     {event.target} • {event.user}
                   </small>
                 </div>
                <div style={{ textAlign: 'right' }}>
                                     <small style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                     {event.time}
                   </small>
                                                         <span className="pf-v5-c-badge pf-m-success" style={{ marginLeft: 'var(--pf-v5-global--spacer--sm)' }}>
                      {event.status}
                    </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--pf-v5-global--spacer--md)' }}>
            <Button
              variant={ButtonVariant.link}
              onClick={() => navigate('/audit')}
            >
              View Full Audit Log
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
