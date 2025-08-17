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
  TextInput,
  TextArea,
  Select,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup
} from '@patternfly/react-core';
import { PlusIcon, ShieldAltIcon, UserIcon, PlayIcon } from '@patternfly/react-icons';

const SimpleRBACDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderOverview = () => (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v5-u-mb-md">
        RBAC System Overview
      </Title>
      
      <Grid hasGutter>
        <GridItem span={3}>
          <Card>
            <CardHeader>
              <CardTitle>Total Policies</CardTitle>
            </CardHeader>
            <CardBody>
              <Title headingLevel="h3" size="2xl">12</Title>
              <p>Active access policies</p>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem span={3}>
          <Card>
            <CardHeader>
              <CardTitle>Total Roles</CardTitle>
            </CardHeader>
            <CardBody>
              <Title headingLevel="h3" size="2xl">8</Title>
              <p>User roles defined</p>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem span={3}>
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardBody>
              <Title headingLevel="h3" size="2xl">45</Title>
              <p>Active users</p>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem span={3}>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardBody>
              <Badge variant="success">Healthy</Badge>
              <p>All systems operational</p>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Alert
        variant={AlertVariant.info}
        title="Quick Actions"
        className="pf-v5-u-mt-lg"
      >
        <Flex gap={{ default: 'gapMd' }}>
          <Button variant={ButtonVariant.primary} icon={<PlusIcon />}>
            Create Policy
          </Button>
          <Button variant={ButtonVariant.secondary} icon={<UserIcon />}>
            Manage Roles
          </Button>
          <Button variant={ButtonVariant.secondary} icon={<PlayIcon />}>
            Run Simulation
          </Button>
        </Flex>
      </Alert>
    </div>
  );

  const renderPolicies = () => (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v5-u-mb-md">
        Access Policies
      </Title>
      
      <Toolbar className="pf-v5-u-mb-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <TextInput placeholder="Search policies..." />
            </ToolbarItem>
            <ToolbarItem>
              <Select placeholderText="Filter by effect">
                <SelectOption value="all">All Effects</SelectOption>
                <SelectOption value="allow">Allow</SelectOption>
                <SelectOption value="deny">Deny</SelectOption>
              </Select>
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<PlusIcon />}>
                Create Policy
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      <Grid hasGutter>
        <GridItem span={6}>
          <Card isHoverable>
            <CardHeader>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <ShieldAltIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                <div>
                  <CardTitle>Finance Team Access</CardTitle>
                  <small>Priority: 100</small>
                </div>
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <Badge variant="success">Allow</Badge>
              </FlexItem>
            </CardHeader>
            <CardBody>
              <p>Allow finance team to access financial secrets</p>
              <div className="pf-v5-u-mt-md">
                <small><strong>Roles:</strong> finance-admin, finance-user</small>
              </div>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem span={6}>
          <Card isHoverable>
            <CardHeader>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <ShieldAltIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                <div>
                  <CardTitle>Production Secrets Deny</CardTitle>
                  <small>Priority: 200</small>
                </div>
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <Badge variant="danger">Deny</Badge>
              </FlexItem>
            </CardHeader>
            <CardBody>
              <p>Deny access to production secrets for non-production users</p>
              <div className="pf-v5-u-mt-md">
                <small><strong>Roles:</strong> developer, data-scientist</small>
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );

  const renderRoles = () => (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v5-u-mb-md">
        User Roles
      </Title>
      
      <Toolbar className="pf-v5-u-mb-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <TextInput placeholder="Search roles..." />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<PlusIcon />}>
                Create Role
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      <Grid hasGutter>
        <GridItem span={4}>
          <Card isHoverable>
            <CardHeader>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <UserIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                <CardTitle>admin</CardTitle>
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <Badge variant="success">System</Badge>
              </FlexItem>
            </CardHeader>
            <CardBody>
              <p>Full system administrator with all permissions</p>
              <div className="pf-v5-u-mt-md">
                <small><strong>Permissions:</strong> 25</small>
              </div>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem span={4}>
          <Card isHoverable>
            <CardHeader>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <UserIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                <CardTitle>finance-admin</CardTitle>
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <Badge variant="outline">Custom</Badge>
              </FlexItem>
            </CardHeader>
            <CardBody>
              <p>Finance team administrator with financial data access</p>
              <div className="pf-v5-u-mt-md">
                <small><strong>Permissions:</strong> 12</small>
              </div>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem span={4}>
          <Card isHoverable>
            <CardHeader>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <UserIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />
                <CardTitle>developer</CardTitle>
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <Badge variant="outline">Custom</Badge>
              </FlexItem>
            </CardHeader>
            <CardBody>
              <p>Developer with access to development and staging secrets</p>
              <div className="pf-v5-u-mt-md">
                <small><strong>Permissions:</strong> 8</small>
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );

  return (
    <div>
      <div>
        <Title headingLevel="h1" size="2xl">
          RBAC Dashboard
        </Title>
        <p>
          Manage Role-Based Access Control for your secrets management system
        </p>
      </div>

      <div className="pf-v5-u-mt-lg">
        <Flex gap={{ default: 'gapMd' }}>
          <Button
            variant={activeTab === 'overview' ? ButtonVariant.primary : ButtonVariant.secondary}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'policies' ? ButtonVariant.primary : ButtonVariant.secondary}
            onClick={() => setActiveTab('policies')}
          >
            Policies
          </Button>
          <Button
            variant={activeTab === 'roles' ? ButtonVariant.primary : ButtonVariant.secondary}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </Button>
        </Flex>
      </div>

      <div className="pf-v5-u-mt-lg">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'roles' && renderRoles()}
      </div>
    </div>
  );
};

export default SimpleRBACDashboard;
