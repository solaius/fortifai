import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  Button,
  ButtonVariant,
  Badge,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  PopoverContent,
  Divider,
  Tooltip,
  TooltipPosition,
  ChipGroup,
  Chip,
  Progress,
  ProgressSize,
  ProgressVariant
} from '@patternfly/react-core';
import {
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  SyncIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  QuestionCircleIcon,
  ServerIcon,
  DatabaseIcon,
  KeyIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  RocketIcon
} from '@patternfly/react-icons';
import { MCPServerBinding, SecretBinding } from '../../types/bindings';
import { formatDistanceToNow } from 'date-fns';

interface BindingCardProps {
  binding: MCPServerBinding;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDeploy: (id: string) => void;
  onValidate: (id: string) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const BindingCard: React.FC<BindingCardProps> = ({
  binding,
  onView,
  onEdit,
  onDelete,
  onDeploy,
  onValidate,
  isSelectable = false,
  isSelected = false,
  onSelect
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'success',
      inactive: 'outline',
      draft: 'outline',
      archived: 'outline'
    };

    const colors: Record<string, string> = {
      active: 'var(--pf-v5-global--success-color--100)',
      inactive: 'var(--pf-v5-global--Color--200)',
      draft: 'var(--pf-v5-global--Color--100)',
      archived: 'var(--pf-v5-global--Color--300)'
    };

    return (
      <Badge
        variant={variants[status] || 'outline'}
        style={{ color: colors[status] || 'inherit' }}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getHealthBadge = (health: string) => {
    const variants: Record<string, string> = {
      healthy: 'success',
      warning: 'warning',
      critical: 'danger',
      unknown: 'outline'
    };

    const colors: Record<string, string> = {
      healthy: 'var(--pf-v5-global--success-color--100)',
      warning: 'var(--pf-v5-global--warning-color--100)',
      critical: 'var(--pf-v5-global--danger-color--100)',
      unknown: 'var(--pf-v5-global--Color--200)'
    };

    return (
      <Badge
        variant={variants[health] || 'outline'}
        style={{ color: colors[health] || 'inherit' }}
      >
        {health.toUpperCase()}
      </Badge>
    );
  };

  const getValidationBadge = (validation: any) => {
    const status = validation?.status || 'unknown';
    const variants: Record<string, string> = {
      valid: 'success',
      invalid: 'danger',
      warning: 'warning',
      unknown: 'outline'
    };

    const colors: Record<string, string> = {
      valid: 'var(--pf-v5-global--success-color--100)',
      invalid: 'var(--pf-v5-global--danger-color--100)',
      warning: 'var(--pf-v5-global--warning-color--100)',
      unknown: 'var(--pf-v5-global--Color--200)'
    };

    return (
      <Badge
        variant={variants[status] || 'outline'}
        style={{ color: colors[status] || 'inherit' }}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getEnvironmentBadge = (environment: string) => {
    const variants: Record<string, string> = {
      development: 'outline',
      staging: 'outline',
      production: 'danger',
      testing: 'outline'
    };

    const colors: Record<string, string> = {
      development: 'var(--pf-v5-global--Color--100)',
      staging: 'var(--pf-v5-global--warning-color--100)',
      production: 'var(--pf-v5-global--danger-color--100)',
      testing: 'var(--pf-v5-global--info-color--100)'
    };

    return (
      <Badge
        variant={variants[environment] || 'outline'}
        style={{ color: colors[environment] || 'inherit' }}
      >
        {environment.toUpperCase()}
      </Badge>
    );
  };

  const getServerTypeIcon = (type: string) => {
    switch (type) {
      case 'mcp-server':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />;
      case 'mcp-client':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--info-color--100)' }} />;
      case 'custom':
        return <ServerIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      default:
        return <ServerIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(binding.id, !isSelected);
    }
  };

  const getValidationProgress = () => {
    const validation = binding.validationStatus;
    if (!validation) return { value: 0, variant: ProgressVariant.default };

    const total = validation.errors.length + validation.warnings.length;
    if (total === 0) return { value: 100, variant: ProgressVariant.success };

    const errorPercentage = (validation.errors.length / total) * 100;
    const warningPercentage = (validation.warnings.length / total) * 100;

    if (errorPercentage > 50) {
      return { value: 100 - errorPercentage, variant: ProgressVariant.danger };
    } else if (warningPercentage > 30) {
      return { value: 100 - warningPercentage, variant: ProgressVariant.warning };
    } else {
      return { value: 100 - total * 10, variant: ProgressVariant.success };
    }
  };

  const detailsPopover = (
    <Popover
      position={PopoverPosition.bottom}
      bodyContent={
        <div style={{ minWidth: '400px' }}>
                      <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-sm">Binding Details</div>
          <div>
            <Grid hasGutter>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Server Type:
                   </div>
                   <div>
                     {binding.serverType}
                   </div>
                 </div>
               </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Namespace:
                   </div>
                   <div>
                     {binding.namespace}
                   </div>
                 </div>
               </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Project:
                   </div>
                   <div>
                     {binding.project || 'N/A'}
                   </div>
                 </div>
               </GridItem>
               <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Deployment Count:
                   </div>
                   <div>
                     {binding.deploymentCount}
                   </div>
                 </div>
               </GridItem>
              {binding.lastDeployed && (
                <GridItem span={6}>
                  <TextContent>
                    <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                      Last Deployed:
                    </Text>
                    <Text component={TextVariants.small}>
                      {formatDate(binding.lastDeployed)}
                    </Text>
                  </TextContent>
                </GridItem>
              )}
              <GridItem span={6}>
                <TextContent>
                  <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                    Created By:
                  </Text>
                  <Text component={TextVariants.small}>
                    {binding.createdBy}
                  </Text>
                </TextContent>
              </GridItem>
            </Grid>
            
            {binding.runtimeConfig && (
              <>
                <Divider className="pf-v5-u-my-md" />
                <TextContent>
                  <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                    Runtime Configuration:
                  </Text>
                  <div className="pf-v5-u-mt-xs">
                    <Text component={TextVariants.small}>
                      Strategy: {binding.runtimeConfig.deploymentStrategy}
                    </Text>
                    <Text component={TextVariants.small}>
                      Replicas: {binding.runtimeConfig.replicas}
                    </Text>
                    <Text component={TextVariants.small}>
                      CPU: {binding.runtimeConfig.resources.cpu.request} / {binding.runtimeConfig.resources.cpu.limit}
                    </Text>
                    <Text component={TextVariants.small}>
                      Memory: {binding.runtimeConfig.resources.memory.request} / {binding.runtimeConfig.resources.memory.limit}
                    </Text>
                  </div>
                </TextContent>
              </>
            )}
          </div>
        </div>
      }
      showClose={true}
    >
      <Button
        variant={ButtonVariant.plain}
        aria-label="View details"
        className="pf-v5-u-p-0"
      >
        <EyeIcon />
      </Button>
    </Popover>
  );

  const validationProgress = getValidationProgress();

  return (
    <Card
      isHoverable
      isSelectable={isSelectable}
      isSelected={isSelected}
      onClick={isSelectable ? handleSelect : undefined}
      className="binding-card"
    >
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
          {getServerTypeIcon(binding.serverType)}
          <div>
            <CardTitle>{binding.name}</CardTitle>
            <Text component={TextVariants.small} className="pf-v5-u-color-200">
              {binding.serverName}
            </Text>
          </div>
        </Flex>
        <FlexItem align={{ default: 'alignRight' }}>
          <Flex gap={{ default: 'gapSm' }}>
            {detailsPopover}
          </Flex>
        </FlexItem>
      </CardHeader>

      <CardBody>
        <Grid hasGutter>
          <GridItem span={8}>
            <TextContent>
              {binding.description && (
                <Text component={TextVariants.p} className="pf-v5-u-mb-md">
                  {binding.description}
                </Text>
              )}
              
              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Status:
                </Text>
                <span className="pf-v5-u-ml-sm">
                  {getStatusBadge(binding.status)}
                </span>
              </div>

              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Health:
                </Text>
                <span className="pf-v5-u-ml-sm">
                  {getHealthBadge(binding.healthStatus)}
                </span>
              </div>

              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Environment:
                </Text>
                <span className="pf-v5-u-ml-sm">
                  {getEnvironmentBadge(binding.environment)}
                </span>
              </div>

              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Validation:
                </Text>
                <span className="pf-v5-u-ml-sm">
                  {getValidationBadge(binding.validationStatus)}
                </span>
              </div>

              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Secret Bindings:
                </Text>
                <span className="pf-v5-u-ml-sm">
                  {binding.secretBindings.length}
                </span>
              </div>

              {/* Validation Progress */}
              <div className="pf-v5-u-mt-md">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                  Validation Progress:
                </Text>
                <Progress
                  value={validationProgress.value}
                  variant={validationProgress.variant}
                  size={ProgressSize.sm}
                  className="pf-v5-u-mt-xs"
                />
              </div>
            </TextContent>
          </GridItem>

          <GridItem span={4}>
            <div className="pf-v5-u-mb-sm">
              <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                Created:
              </Text>
              <Text component={TextVariants.small} className="pf-v5-u-ml-sm">
                {formatDate(binding.createdAt)}
              </Text>
            </div>

            <div className="pf-v5-u-mb-sm">
              <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                Updated:
              </Text>
              <Text component={TextVariants.small} className="pf-v5-u-ml-sm">
                {formatDate(binding.updatedAt)}
              </Text>
            </div>

            {binding.lastValidation && (
              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Last Validated:
                </Text>
                <Text component={TextVariants.small} className="pf-v5-u-ml-sm">
                  {formatDate(binding.lastValidation)}
                </Text>
              </div>
            )}

            {binding.lastDeployed && (
              <div className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">
                  Last Deployed:
                </Text>
                <Text component={TextVariants.small} className="pf-v5-u-ml-sm">
                  {formatDate(binding.lastDeployed)}
                </Text>
              </div>
            )}
          </GridItem>
        </Grid>

        {/* Secret Bindings Preview */}
        {binding.secretBindings.length > 0 && (
          <div className="pf-v5-u-mt-md">
            <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
              Secret Bindings:
            </Text>
            <div className="pf-v5-u-mb-xs">
              {binding.secretBindings.slice(0, 3).map((secretBinding, index) => (
                <Chip key={index} className="pf-v5-u-mr-xs pf-v5-u-mb-xs">
                  {secretBinding.envVarName} → {secretBinding.secretName}
                </Chip>
              ))}
              {binding.secretBindings.length > 3 && (
                <Chip className="pf-v5-u-mr-xs pf-v5-u-mb-xs">
                  +{binding.secretBindings.length - 3} more
                </Chip>
              )}
            </div>
          </div>
        )}

        {/* Labels and Tags */}
        {binding.tags.length > 0 && (
          <div className="pf-v5-u-mt-md">
            <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
              Tags:
            </Text>
            <div>
              {binding.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="pf-v5-u-mr-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {Object.keys(binding.labels).length > 0 && (
          <div className="pf-v5-u-mt-md">
            <Text component={TextVariants.small} className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
              Labels:
            </Text>
            <div>
              {Object.entries(binding.labels).map(([key, value], index) => (
                <Badge key={index} variant="outline" className="pf-v5-u-mr-xs">
                  {key}={value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <Tooltip content="View binding details" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.primary}
            onClick={() => onView(binding.id)}
            aria-label="View binding"
          >
            View
          </Button>
        </Tooltip>
        
        <Tooltip content="Edit binding" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => onEdit(binding.id)}
            aria-label="Edit binding"
          >
            <EditIcon />
          </Button>
        </Tooltip>
        
        <Tooltip content="Deploy binding" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => onDeploy(binding.id)}
            aria-label="Deploy binding"
            isDisabled={binding.status !== 'active'}
          >
            <RocketIcon />
          </Button>
        </Tooltip>
        
        <Tooltip content="Validate binding" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => onValidate(binding.id)}
            aria-label="Validate binding"
          >
            <CheckCircleIcon />
          </Button>
        </Tooltip>
        
        <Tooltip content="Delete binding" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.danger}
            onClick={() => onDelete(binding.id)}
            aria-label="Delete binding"
          >
            <TrashIcon />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

export default BindingCard;
