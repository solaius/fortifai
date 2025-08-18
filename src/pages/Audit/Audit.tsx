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
  ToolbarGroup,
  Pagination,
  PaginationVariant
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import ClipboardIcon from '@patternfly/react-icons/dist/esm/icons/clipboard-icon';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import UserIcon from '@patternfly/react-icons/dist/esm/icons/user-icon';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  targetType: 'secret' | 'binding' | 'provider' | 'policy';
  outcome: 'success' | 'failure' | 'denied';
  details: string;
  correlationId: string;
  ipAddress: string;
  userAgent: string;
}

const Audit: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [isActionFilterOpen, setIsActionFilterOpen] = useState(false);
  const [isOutcomeFilterOpen, setIsOutcomeFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [auditEvents] = useState<AuditEvent[]>([
    {
      id: 'event-1',
      timestamp: '2024-01-20T10:30:00Z',
      action: 'secret_access',
      actor: 'admin',
      target: 'openai-api-key',
      targetType: 'secret',
      outcome: 'success',
      details: 'Secret accessed for MCP server deployment',
      correlationId: 'corr-12345',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'event-2',
      timestamp: '2024-01-20T10:25:00Z',
      action: 'binding_created',
      actor: 'engineer',
      target: 'mcp-server-1',
      targetType: 'binding',
      outcome: 'success',
      details: 'New binding created for OpenAI API key',
      correlationId: 'corr-12344',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'event-3',
      timestamp: '2024-01-20T10:20:00Z',
      action: 'secret_access',
      actor: 'developer',
      target: 'database-password',
      targetType: 'secret',
      outcome: 'denied',
      details: 'Access denied due to insufficient permissions',
      correlationId: 'corr-12343',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'event-4',
      timestamp: '2024-01-20T10:15:00Z',
      action: 'provider_health_check',
      actor: 'system',
      target: 'vault-corp',
      targetType: 'provider',
      outcome: 'success',
      details: 'Provider health check completed successfully',
      correlationId: 'corr-12342',
      ipAddress: '192.168.1.103',
      userAgent: 'System/1.0'
    },
    {
      id: 'event-5',
      timestamp: '2024-01-20T10:10:00Z',
      action: 'policy_updated',
      actor: 'admin',
      target: 'finance-policy',
      targetType: 'policy',
      outcome: 'success',
      details: 'Policy updated to include new finance team members',
      correlationId: 'corr-12341',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'event-6',
      timestamp: '2024-01-20T10:05:00Z',
      action: 'secret_rotation',
      actor: 'system',
      target: 'aws-access-key',
      targetType: 'secret',
      outcome: 'success',
      details: 'Automatic secret rotation completed',
      correlationId: 'corr-12340',
      ipAddress: '192.168.1.104',
      userAgent: 'System/1.0'
    },
    {
      id: 'event-7',
      timestamp: '2024-01-20T10:00:00Z',
      action: 'binding_deleted',
      actor: 'engineer',
      target: 'old-mcp-server',
      targetType: 'binding',
      outcome: 'success',
      details: 'Binding deleted for decommissioned server',
      correlationId: 'corr-12339',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'event-8',
      timestamp: '2024-01-20T09:55:00Z',
      action: 'secret_access',
      actor: 'data-scientist',
      target: 'ml-api-key',
      targetType: 'secret',
      outcome: 'success',
      details: 'Secret accessed for notebook execution',
      correlationId: 'corr-12338',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0...'
    }
  ]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'secret_access':
        return <KeyIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />;
      case 'binding_created':
      case 'binding_deleted':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--success-color--100)' }} />;
      case 'provider_health_check':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--info-color--100)' }} />;
      case 'policy_updated':
        return <ClipboardIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      case 'secret_rotation':
        return <KeyIcon style={{ color: 'var(--pf-v5-global--info-color--100)' }} />;
      default:
        return <ClipboardIcon />;
    }
  };

  const getActionLabel = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <span className="pf-v5-c-badge pf-m-success">Success</span>;
      case 'failure':
        return <span className="pf-v5-c-badge pf-m-danger">Failure</span>;
      case 'denied':
        return <span className="pf-v5-c-badge pf-m-warning">Denied</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-default">Unknown</span>;
    }
  };

  const getTargetTypeBadge = (targetType: string) => {
    switch (targetType) {
      case 'secret':
        return <span className="pf-v5-c-badge pf-m-outline">Secret</span>;
      case 'binding':
        return <span className="pf-v5-c-badge pf-m-outline">Binding</span>;
      case 'provider':
        return <span className="pf-v5-c-badge pf-m-outline">Provider</span>;
      case 'policy':
        return <span className="pf-v5-c-badge pf-m-outline">Policy</span>;
      default:
        return <span className="pf-v5-c-badge pf-m-outline">{targetType}</span>;
    }
  };

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = event.action.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.actor.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.target.toLowerCase().includes(searchValue.toLowerCase()) ||
                         event.details.toLowerCase().includes(searchValue.toLowerCase());
    const matchesAction = actionFilter === 'all' || event.action === actionFilter;
    const matchesOutcome = outcomeFilter === 'all' || event.outcome === outcomeFilter;
    
    return matchesSearch && matchesAction && matchesOutcome;
  });

  const paginatedEvents = filteredEvents.slice((page - 1) * perPage, page * perPage);

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'secret_access', label: 'Secret Access' },
    { value: 'binding_created', label: 'Binding Created' },
    { value: 'binding_deleted', label: 'Binding Deleted' },
    { value: 'provider_health_check', label: 'Provider Health Check' },
    { value: 'policy_updated', label: 'Policy Updated' },
    { value: 'secret_rotation', label: 'Secret Rotation' }
  ];

  const outcomeOptions = [
    { value: 'all', label: 'All Outcomes' },
    { value: 'success', label: 'Success' },
    { value: 'failure', label: 'Failure' },
    { value: 'denied', label: 'Denied' }
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (auditEvents.length === 0) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Audit Log
          </Title>
          <p>
            View and export audit events for compliance and security monitoring
          </p>
        </div>

        <Card className="pf-v5-u-mt-xl">
          <CardBody style={{ textAlign: 'center', padding: 'var(--pf-v5-global--spacer--xl)' }}>
            <SearchIcon size="lg" style={{ color: 'var(--pf-v5-global--Color--200)', marginBottom: 'var(--pf-v5-global--spacer--md)' }} />
            <Title headingLevel="h4" className="pf-v5-u-mb-md">
              No audit events found
            </Title>
            <p className="pf-v5-u-mb-lg">
              Audit events will appear here as users interact with the secrets management system.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Title headingLevel="h1" size="2xl">
          Audit Log
        </Title>
        <p>
          View and export audit events for compliance and security monitoring
        </p>
      </div>

      {/* Summary Alert */}
      <Alert
        variant={AlertVariant.info}
        title="Audit Summary"
        className="pf-v5-u-mt-md"
      >
        {filteredEvents.length} of {auditEvents.length} events shown. {auditEvents.filter(e => e.outcome === 'success').length} successful events in the last 24 hours.
      </Alert>

      {/* Toolbar */}
      <Toolbar className="pf-v5-u-mt-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                placeholder="Search audit events..."
                value={searchValue}
                onChange={setSearchValue}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isActionFilterOpen}
                onSelect={(event, selection) => {
                  setActionFilter(selection as string);
                  setIsActionFilterOpen(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsActionFilterOpen(!isActionFilterOpen)} isExpanded={isActionFilterOpen}>
                    {actionOptions.find(option => option.value === actionFilter)?.label || 'All Actions'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {actionOptions.map((option) => (
                    <DropdownItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isOutcomeFilterOpen}
                onSelect={(event, selection) => {
                  setOutcomeFilter(selection as string);
                  setIsOutcomeFilterOpen(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsOutcomeFilterOpen(!isOutcomeFilterOpen)} isExpanded={isOutcomeFilterOpen}>
                    {outcomeOptions.find(option => option.value === outcomeFilter)?.label || 'All Outcomes'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {outcomeOptions.map((option) => (
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
                variant={ButtonVariant.secondary}
                icon={<DownloadIcon />}
                onClick={() => {
                  // Export functionality would be implemented here
                  console.log('Export audit log');
                }}
              >
                Export
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      {/* Audit Events */}
      <Card className="pf-v5-u-mt-md">
        <CardBody>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {paginatedEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: 'var(--pf-v5-global--spacer--md)',
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--pf-v5-global--spacer--md)'
                }}
              >
                <div style={{ marginTop: 'var(--pf-v5-global--spacer--xs)' }}>
                  {getActionIcon(event.action)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                                         <h4 style={{ margin: 0 }}>
                       {getActionLabel(event.action)}
                     </h4>
                    {getOutcomeBadge(event.outcome)}
                    {getTargetTypeBadge(event.targetType)}
                  </Flex>
                  
                                     <p style={{ margin: 'var(--pf-v5-global--spacer--xs) 0' }}>
                     {event.details}
                   </p>
                  
                  <div style={{ display: 'flex', gap: 'var(--pf-v5-global--spacer--lg)', flexWrap: 'wrap' }}>
                    <div>
                                           <small style={{ fontWeight: 'bold' }}>
                       Actor:
                     </small>
                     <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                       {event.actor}
                     </small>
                    </div>
                    
                    <div>
                                           <small style={{ fontWeight: 'bold' }}>
                       Target:
                     </small>
                     <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                       {event.target}
                     </small>
                    </div>
                    
                    <div>
                                           <small style={{ fontWeight: 'bold' }}>
                       Time:
                     </small>
                     <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                       {formatTimestamp(event.timestamp)}
                     </small>
                    </div>
                    
                    <div>
                                           <small style={{ fontWeight: 'bold' }}>
                       Correlation ID:
                     </small>
                     <small style={{ marginLeft: 'var(--pf-v5-global--spacer--xs)' }}>
                       {event.correlationId}
                     </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div style={{ marginTop: 'var(--pf-v5-global--spacer--md)' }}>
            <Pagination
              itemCount={filteredEvents.length}
              page={page}
              perPage={perPage}
              onSetPage={setPage}
              onPerPageSelect={(event, newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
              variant={PaginationVariant.bottom}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Audit;
