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
  TooltipPosition
} from '@patternfly/react-core';
import {
  EyeIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  KeyIcon,
  DatabaseIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  LockIcon,
  UnlockIcon
} from '@patternfly/react-icons';
import { SecretReference } from '../../types/secrets';
import { formatDistanceToNow } from 'date-fns';

interface SecretCardProps {
  secret: SecretReference;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyReference: (id: string) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const SecretCard: React.FC<SecretCardProps> = ({
  secret,
  onView,
  onEdit,
  onDelete,
  onCopyReference,
  isSelectable = false,
  isSelected = false,
  onSelect
}) => {
  const [showMetadata, setShowMetadata] = useState(false);

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'outline',
      medium: 'outline',
      high: 'outline',
      critical: 'danger'
    };

    const colors: Record<string, string> = {
      low: 'var(--pf-v5-global--Color--200)',
      medium: 'var(--pf-v5-global--Color--100)',
      high: 'var(--pf-v5-global--warning-color--100)',
      critical: 'var(--pf-v5-global--danger-color--100)'
    };

    return (
      <Badge
        variant={variants[priority] || 'outline'}
        style={{ color: colors[priority] || 'inherit' }}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getClassificationBadge = (classification: string) => {
    const variants: Record<string, string> = {
      public: 'outline',
      internal: 'outline',
      confidential: 'outline',
      restricted: 'outline',
      secret: 'danger'
    };

    const colors: Record<string, string> = {
      public: 'var(--pf-v5-global--Color--200)',
      internal: 'var(--pf-v5-global--Color--100)',
      confidential: 'var(--pf-v5-global--warning-color--100)',
      restricted: 'var(--pf-v5-global--warning-color--200)',
      secret: 'var(--pf-v5-global--danger-color--100)'
    };

    return (
      <Badge
        variant={variants[classification] || 'outline'}
        style={{ color: colors[classification] || 'inherit' }}
      >
        {classification.toUpperCase()}
      </Badge>
    );
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

  const getSecretTypeIcon = (type: string) => {
    switch (type) {
      case 'password':
        return <KeyIcon style={{ color: 'var(--pf-v5-global--Color--100)' }} />;
      case 'api-key':
        return <KeyIcon style={{ color: 'var(--pf-v5-global--primary-color--100)' }} />;
      case 'certificate':
        return <KeyIcon style={{ color: 'var(--pf-v5-global--success-color--100)' }} />;
      case 'private-key':
        return <LockIcon style={{ color: 'var(--pf-v5-global--warning-color--100)' }} />;
      case 'database':
        return <DatabaseIcon style={{ color: 'var(--pf-v5-global--info-color--100)' }} />;
      default:
        return <KeyIcon />;
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
      onSelect(secret.id, !isSelected);
    }
  };

  const metadataPopover = (
    <Popover
      position={PopoverPosition.bottom}
      bodyContent={
        <div style={{ minWidth: '300px' }}>
                      <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-sm">Secret Metadata</div>
          <div>
            <Grid hasGutter>
              <GridItem span={6}>
                              <div>
                <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                  Type:
                </div>
                <div>
                  {secret.metadata.secretType}
                </div>
              </div>
              </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Format:
                   </div>
                   <div>
                     {secret.metadata.format}
                   </div>
                 </div>
               </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Owner:
                   </div>
                   <div>
                     {secret.metadata.owner}
                   </div>
                 </div>
               </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Team:
                   </div>
                   <div>
                     {secret.metadata.team}
                   </div>
                 </div>
               </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Environment:
                   </div>
                   <div>
                     {secret.metadata.environment}
                   </div>
                 </div>
               </GridItem>
                             <GridItem span={6}>
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Usage Count:
                   </div>
                   <div>
                     {secret.metadata.usageCount}
                   </div>
                 </div>
               </GridItem>
                             {secret.metadata.lastRotated && (
                 <GridItem span={6}>
                   <div>
                     <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                       Last Rotated:
                     </div>
                     <div>
                       {formatDate(secret.metadata.lastRotated)}
                     </div>
                   </div>
                 </GridItem>
               )}
                             {secret.metadata.nextRotation && (
                 <GridItem span={6}>
                   <div>
                     <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                       Next Rotation:
                     </div>
                     <div>
                       {formatDate(secret.metadata.nextRotation)}
                     </div>
                   </div>
                 </GridItem>
               )}
            </Grid>
            
                         {secret.metadata.compliance.length > 0 && (
               <>
                 <Divider className="pf-v5-u-my-md" />
                 <div>
                   <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
                     Compliance:
                   </div>
                   <div className="pf-v5-u-mt-xs">
                     {secret.metadata.compliance.map((item, index) => (
                       <Badge key={index} variant="outline" className="pf-v5-u-mr-xs">
                         {item}
                       </Badge>
                     ))}
                   </div>
                 </div>
               </>
             )}
          </div>
        </div>
      }
      showClose={true}
    >
      <Button
        variant={ButtonVariant.plain}
        aria-label="View metadata"
        className="pf-v5-u-p-0"
      >
        <EyeIcon />
      </Button>
    </Popover>
  );

  return (
    <Card
      isClickable
      isSelectable={isSelectable}
      isSelected={isSelected}
      onClick={isSelectable ? handleSelect : undefined}
      className="secret-card"
      selectableActions={{
        selectableActionAriaLabel: `View ${secret.metadata.name} secret details`
      }}
    >
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
          {getSecretTypeIcon(secret.metadata.secretType)}
          <div>
            <CardTitle>{secret.name}</CardTitle>
                         <div className="pf-v5-u-color-200">
               {secret.path}
             </div>
          </div>
        </Flex>
        <FlexItem align={{ default: 'alignRight' }}>
          <Flex gap={{ default: 'gapSm' }}>
            {getProviderIcon(secret.providerType)}
            {metadataPopover}
          </Flex>
        </FlexItem>
      </CardHeader>

      <CardBody>
        <Grid hasGutter>
          <GridItem span={8}>
                         <div>
               {secret.description && (
                 <p className="pf-v5-u-mb-md">
                   {secret.description}
                 </p>
               )}
               
               <div className="pf-v5-u-mb-sm">
                 <div className="pf-v5-u-font-weight-bold">
                   Category:
                 </div>
                 <div className="pf-v5-u-ml-sm">
                   {secret.metadata.category}
                 </div>
               </div>

               <div className="pf-v5-u-mb-sm">
                 <div className="pf-v5-u-font-weight-bold">
                   Priority:
                 </div>
                 <span className="pf-v5-u-ml-sm">
                   {getPriorityBadge(secret.metadata.priority)}
                 </span>
               </div>

               <div className="pf-v5-u-mb-sm">
                 <div className="pf-v5-u-font-weight-bold">
                   Classification:
                 </div>
                 <span className="pf-v5-u-ml-sm">
                   {getClassificationBadge(secret.metadata.classification)}
                 </span>
               </div>
             </div>
          </GridItem>

          <GridItem span={4}>
                         <div className="pf-v5-u-mb-sm">
               <div className="pf-v5-u-font-weight-bold">
                 Created:
               </div>
               <div className="pf-v5-u-ml-sm">
                 {formatDate(secret.createdAt)}
               </div>
             </div>

             <div className="pf-v5-u-mb-sm">
               <div className="pf-v5-u-font-weight-bold">
                 Updated:
               </div>
               <div className="pf-v5-u-ml-sm">
                 {formatDate(secret.updatedAt)}
               </div>
             </div>

             <div className="pf-v5-u-mb-sm">
               <div className="pf-v5-u-font-weight-bold">
                 Created By:
               </div>
               <div className="pf-v5-u-ml-sm">
                 {secret.createdBy}
               </div>
             </div>

             {secret.metadata.lastAccessed && (
               <div className="pf-v5-u-mb-sm">
                 <div className="pf-v5-u-font-weight-bold">
                   Last Accessed:
                 </div>
                 <div className="pf-v5-u-ml-sm">
                   {formatDate(secret.metadata.lastAccessed)}
                 </div>
               </div>
             )}
          </GridItem>
        </Grid>

                 {secret.tags.length > 0 && (
           <div className="pf-v5-u-mt-md">
             <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
               Tags:
             </div>
             <div>
               {secret.tags.map((tag, index) => (
                 <Badge key={index} variant="outline" className="pf-v5-u-mr-xs">
                   {tag}
                 </Badge>
               ))}
             </div>
           </div>
         )}

         {Object.keys(secret.labels).length > 0 && (
           <div className="pf-v5-u-mt-md">
             <div className="pf-v5-u-font-weight-bold pf-v5-u-mb-xs">
               Labels:
             </div>
             <div>
               {Object.entries(secret.labels).map(([key, value], index) => (
                 <Badge key={index} variant="outline" className="pf-v5-u-mr-xs">
                   {key}={value}
                 </Badge>
               ))}
             </div>
           </div>
         )}
      </CardBody>

      <CardFooter>
        <Tooltip content="View secret details" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.primary}
            onClick={() => onView(secret.id)}
            aria-label="View secret"
          >
            View
          </Button>
        </Tooltip>
        
        <Tooltip content="Edit secret reference" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => onEdit(secret.id)}
            aria-label="Edit secret"
          >
            <EditIcon />
          </Button>
        </Tooltip>
        
        <Tooltip content="Copy reference ID" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => onCopyReference(secret.id)}
            aria-label="Copy reference"
          >
            <CopyIcon />
          </Button>
        </Tooltip>
        
        <Tooltip content="Delete secret reference" position={TooltipPosition.top}>
          <Button
            variant={ButtonVariant.danger}
            onClick={() => onDelete(secret.id)}
            aria-label="Delete secret"
          >
            <TrashIcon />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

export default SecretCard;
