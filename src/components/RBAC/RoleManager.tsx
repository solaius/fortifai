import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Button,
  ButtonVariant,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  TextInput,
  TextArea,
  Select,
  SelectOption,
  SelectVariant,
  Chip,
  ChipGroup,
  Badge,
  Alert,
  AlertVariant,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  FormSection,
  Divider,
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  Th,
  Td,
  Tr,
  ActionsColumn,
  IAction,
  Tooltip,
  TooltipPosition,
  Icon,
  Popover,
  PopoverPosition,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger
} from '@patternfly/react-core';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
  ShieldAltIcon,
  QuestionCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@patternfly/react-icons';
import { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '../../types/rbac';

interface RoleManagerProps {
  roles: Role[];
  permissions: Permission[];
  onCreateRole: (role: CreateRoleRequest) => Promise<void>;
  onUpdateRole: (roleId: string, role: UpdateRoleRequest) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
}

interface RoleFormState {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  metadata: {
    category: string;
    priority: number;
    tags: string[];
    labels: Record<string, string>;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const RoleManager: React.FC<RoleManagerProps> = ({
  roles,
  permissions,
  onCreateRole,
  onUpdateRole,
  onDeleteRole
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formState, setFormState] = useState<RoleFormState>({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
    metadata: {
      category: '',
      priority: 100,
      tags: [],
      labels: {}
    },
    errors: {},
    isSubmitting: false
  });

  const categories = [
    'administrative',
    'operational',
    'specialized',
    'temporary',
    'system',
    'custom'
  ];

  const priorityLevels = [
    { value: 100, label: 'Low (100)' },
    { value: 200, label: 'Medium (200)' },
    { value: 300, label: 'High (300)' },
    { value: 400, label: 'Critical (400)' },
    { value: 500, label: 'Emergency (500)' }
  ];

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || role.metadata.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'system' && role.isSystem) ||
                         (statusFilter === 'default' && role.isDefault);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.name.trim()) {
      errors.name = 'Role name is required';
    }

    if (!formState.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (!formState.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formState.permissions.length === 0) {
      errors.permissions = 'At least one permission is required';
    }

    if (!formState.metadata.category) {
      errors.category = 'Category is required';
    }

    if (formState.metadata.priority < 1 || formState.metadata.priority > 1000) {
      errors.priority = 'Priority must be between 1 and 1000';
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleCreateRole = async () => {
    if (!validateForm()) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const roleData: CreateRoleRequest = {
        name: formState.name,
        displayName: formState.displayName,
        description: formState.description,
        permissions: formState.permissions,
        metadata: formState.metadata
      };

      await onCreateRole(roleData);
      handleCloseCreateModal();
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !validateForm()) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const roleData: UpdateRoleRequest = {
        name: formState.name,
        displayName: formState.displayName,
        description: formState.description,
        permissions: formState.permissions,
        metadata: formState.metadata
      };

      await onUpdateRole(editingRole.id, roleData);
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteRole = async () => {
    if (!deletingRole) return;

    try {
      await onDeleteRole(deletingRole.id);
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setFormState({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      metadata: {
        category: '',
        priority: 100,
        tags: [],
        labels: {}
      },
      errors: {},
      isSubmitting: false
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setFormState({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
      metadata: {
        category: role.metadata.category,
        priority: role.metadata.priority,
        tags: role.metadata.tags,
        labels: role.metadata.labels
      },
      errors: {},
      isSubmitting: false
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormState({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      metadata: {
        category: '',
        priority: 100,
        tags: [],
        labels: {}
      },
      errors: {},
      isSubmitting: false
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRole(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingRole(null);
  };

  const addPermission = (permissionId: string) => {
    if (!formState.permissions.includes(permissionId)) {
      setFormState(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId]
      }));
    }
  };

  const removePermission = (permissionId: string) => {
    setFormState(prev => ({
      ...prev,
      permissions: prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formState.metadata.tags.includes(tag.trim())) {
      setFormState(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, tag.trim()]
        }
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormState(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter(t => t !== tag)
      }
    }));
  };

  const getPermissionById = (id: string): Permission | undefined => {
    return permissions.find(p => p.id === id);
  };

  const getRoleActions = (role: Role): IAction[] => [
    {
      title: 'Edit Role',
      onClick: () => handleOpenEditModal(role),
      isDisabled: role.isSystem
    },
    {
      title: 'Delete Role',
      onClick: () => handleOpenDeleteModal(role),
      isDisabled: role.isSystem || role.isDefault
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Icon>
                  <ShieldAltIcon />
                </Icon>
                Role Management
              </FlexItem>
              <FlexItem>
                <Badge isRead>{roles.length} Roles</Badge>
              </FlexItem>
            </Flex>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Grid hasGutter>
            <GridItem span={4}>
              <TextInput
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(_, value) => setSearchTerm(value)}
                iconVariant="search"
              />
            </GridItem>
            <GridItem span={4}>
              <Select
                placeholderText="Filter by category"
                variant={SelectVariant.single}
                selections={categoryFilter}
                onSelect={(_, selection) => setCategoryFilter(selection as string)}
              >
                <SelectOption value="all">All Categories</SelectOption>
                {categories.map(category => (
                  <SelectOption key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </GridItem>
            <GridItem span={4}>
              <Select
                placeholderText="Filter by status"
                variant={SelectVariant.single}
                selections={statusFilter}
                onSelect={(_, selection) => setStatusFilter(selection as string)}
              >
                <SelectOption value="all">All Status</SelectOption>
                <SelectOption value="system">System Roles</SelectOption>
                <SelectOption value="default">Default Roles</SelectOption>
                <SelectOption value="custom">Custom Roles</SelectOption>
              </Select>
            </GridItem>
          </Grid>

          <Table
            variant={TableVariant.compact}
            aria-label="Roles table"
            className="pf-v5-u-mt-md"
          >
            <TableHeader>
              <Tr>
                <Th>Name</Th>
                <Th>Display Name</Th>
                <Th>Category</Th>
                <Th>Permissions</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {filteredRoles.map(role => (
                <Tr key={role.id}>
                  <Td>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        {role.name}
                      </FlexItem>
                      {role.isSystem && (
                        <FlexItem>
                          <Badge isRead>System</Badge>
                        </FlexItem>
                      )}
                      {role.isDefault && (
                        <FlexItem>
                          <Badge isRead>Default</Badge>
                        </FlexItem>
                      )}
                    </Flex>
                  </Td>
                  <Td>{role.displayName}</Td>
                  <Td>
                    <Badge isRead>{role.metadata.category}</Badge>
                  </Td>
                  <Td>
                    <ChipGroup>
                      {role.permissions.slice(0, 3).map(permission => (
                        <Chip key={permission.id} isReadOnly>
                          {permission.name}
                        </Chip>
                      ))}
                      {role.permissions.length > 3 && (
                        <Chip isReadOnly>
                          +{role.permissions.length - 3} more
                        </Chip>
                      )}
                    </ChipGroup>
                  </Td>
                  <Td>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <Icon>
                          {role.isSystem ? <ShieldAltIcon /> : <UserIcon />}
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        {role.isSystem ? 'System' : 'Custom'}
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td>
                    <ActionsColumn
                      items={getRoleActions(role)}
                      isDisabled={role.isSystem}
                    />
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </Table>
        </CardBody>
        <CardFooter>
          <Button
            variant={ButtonVariant.primary}
            onClick={handleOpenCreateModal}
            icon={<PlusIcon />}
          >
            Create Role
          </Button>
        </CardFooter>
      </Card>

      {/* Create Role Modal */}
      <Modal
        variant={ModalVariant.large}
        title="Create New Role"
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        actions={[
          <Button
            key="create"
            variant={ButtonVariant.primary}
            onClick={handleCreateRole}
            isLoading={formState.isSubmitting}
            isDisabled={formState.isSubmitting}
          >
            Create Role
          </Button>,
          <Button key="cancel" variant={ButtonVariant.secondary} onClick={handleCloseCreateModal}>
            Cancel
          </Button>
        ]}
      >
        <RoleForm
          formState={formState}
          setFormState={setFormState}
          permissions={permissions}
          onAddPermission={addPermission}
          onRemovePermission={removePermission}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        variant={ModalVariant.large}
        title="Edit Role"
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        actions={[
          <Button
            key="update"
            variant={ButtonVariant.primary}
            onClick={handleUpdateRole}
            isLoading={formState.isSubmitting}
            isDisabled={formState.isSubmitting}
          >
            Update Role
          </Button>,
          <Button key="cancel" variant={ButtonVariant.secondary} onClick={handleCloseEditModal}>
            Cancel
          </Button>
        ]}
      >
        <RoleForm
          formState={formState}
          setFormState={setFormState}
          permissions={permissions}
          onAddPermission={addPermission}
          onRemovePermission={removePermission}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
      </Modal>

      {/* Delete Role Modal */}
      <Modal
        variant={ModalVariant.small}
        title="Delete Role"
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        actions={[
          <Button
            key="delete"
            variant={ButtonVariant.danger}
            onClick={handleDeleteRole}
          >
            Delete
          </Button>,
          <Button key="cancel" variant={ButtonVariant.secondary} onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
        ]}
      >
        <Alert
          variant={AlertVariant.warning}
          title="Are you sure you want to delete this role?"
          className="pf-v5-u-mb-md"
        >
          <p>
            This action cannot be undone. Deleting the role "{deletingRole?.displayName}" will:
          </p>
          <ul>
            <li>Remove the role from all users who currently have it assigned</li>
            <li>Delete all associated role assignments</li>
            <li>Potentially affect access to resources</li>
          </ul>
        </Alert>
      </Modal>
    </>
  );
};

interface RoleFormProps {
  formState: RoleFormState;
  setFormState: React.Dispatch<React.SetStateAction<RoleFormState>>;
  permissions: Permission[];
  onAddPermission: (permissionId: string) => void;
  onRemovePermission: (permissionId: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  formState,
  setFormState,
  permissions,
  onAddPermission,
  onRemovePermission,
  onAddTag,
  onRemoveTag
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <Form>
      <FormSection title="Basic Information">
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup
              label="Role Name"
              isRequired
              fieldId="role-name"
              helperText="Unique identifier for the role"
              validated={formState.errors.name ? 'error' : 'default'}
              helperTextInvalid={formState.errors.name}
            >
              <TextInput
                id="role-name"
                value={formState.name}
                onChange={(_, value) => setFormState(prev => ({ ...prev, name: value }))}
                placeholder="e.g., ml-engineer"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup
              label="Display Name"
              isRequired
              fieldId="role-display-name"
              helperText="Human-readable name for the role"
              validated={formState.errors.displayName ? 'error' : 'default'}
              helperTextInvalid={formState.errors.displayName}
            >
              <TextInput
                id="role-display-name"
                value={formState.displayName}
                onChange={(_, value) => setFormState(prev => ({ ...prev, displayName: value }))}
                placeholder="e.g., ML Engineer"
                isRequired
              />
            </FormGroup>
          </GridItem>
          <GridItem span={12}>
            <FormGroup
              label="Description"
              isRequired
              fieldId="role-description"
              helperText="Detailed description of the role's purpose and responsibilities"
              validated={formState.errors.description ? 'error' : 'default'}
              helperTextInvalid={formState.errors.description}
            >
              <TextArea
                id="role-description"
                value={formState.description}
                onChange={(_, value) => setFormState(prev => ({ ...prev, description: value }))}
                placeholder="Describe what this role allows users to do..."
                rows={3}
                isRequired
              />
            </FormGroup>
          </GridItem>
        </Grid>
      </FormSection>

      <Divider />

      <FormSection title="Permissions">
        <FormGroup
          label="Assigned Permissions"
          isRequired
          fieldId="role-permissions"
          helperText="Select the permissions this role should grant"
          validated={formState.errors.permissions ? 'error' : 'default'}
          helperTextInvalid={formState.errors.permissions}
        >
          <Select
            placeholderText="Select permissions..."
            variant={SelectVariant.typeaheadMulti}
            onSelect={(_, selection) => {
              if (typeof selection === 'string') {
                onAddPermission(selection);
              }
            }}
          >
            {permissions.map(permission => (
              <SelectOption key={permission.id} value={permission.id}>
                {permission.displayName} - {permission.description}
              </SelectOption>
            ))}
          </Select>

          {formState.permissions.length > 0 && (
            <ChipGroup className="pf-v5-u-mt-sm">
              {formState.permissions.map(permissionId => {
                const permission = permissions.find(p => p.id === permissionId);
                return permission ? (
                  <Chip
                    key={permissionId}
                    onClick={() => onRemovePermission(permissionId)}
                    isReadOnly={false}
                  >
                    {permission.displayName}
                  </Chip>
                ) : null;
              })}
            </ChipGroup>
          )}
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection title="Metadata">
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup
              label="Category"
              isRequired
              fieldId="role-category"
              helperText="Role category for organization"
              validated={formState.errors.category ? 'error' : 'default'}
              helperTextInvalid={formState.errors.category}
            >
              <Select
                placeholderText="Select category"
                variant={SelectVariant.single}
                selections={formState.metadata.category}
                onSelect={(_, selection) => setFormState(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, category: selection as string }
                }))}
              >
                {categories.map(category => (
                  <SelectOption key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup
              label="Priority"
              fieldId="role-priority"
              helperText="Role priority level"
            >
              <Select
                placeholderText="Select priority"
                variant={SelectVariant.single}
                selections={formState.metadata.priority}
                onSelect={(_, selection) => setFormState(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, priority: selection as number }
                }))}
              >
                {priorityLevels.map(level => (
                  <SelectOption key={level.value} value={level.value}>
                    {level.label}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={12}>
            <FormGroup
              label="Tags"
              fieldId="role-tags"
              helperText="Add tags to help organize and categorize the role"
            >
              <Flex>
                <FlexItem>
                  <TextInput
                    value={newTag}
                    onChange={(_, value) => setNewTag(value)}
                    placeholder="Enter tag name..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                </FlexItem>
                <FlexItem>
                  <Button variant={ButtonVariant.secondary} onClick={handleAddTag}>
                    Add Tag
                  </Button>
                </FlexItem>
              </Flex>

              {formState.metadata.tags.length > 0 && (
                <ChipGroup className="pf-v5-u-mt-sm">
                  {formState.metadata.tags.map(tag => (
                    <Chip
                      key={tag}
                      onClick={() => onRemoveTag(tag)}
                      isReadOnly={false}
                    >
                      {tag}
                    </Chip>
                  ))}
                </ChipGroup>
              )}
            </FormGroup>
          </GridItem>
        </Grid>
      </FormSection>
    </Form>
  );
};

export default RoleManager;
