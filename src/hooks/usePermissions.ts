import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { hasRole, hasPermission, user } = useAuth();

  const canReadProviders = () => hasPermission('providers:read');
  const canWriteProviders = () => hasPermission('providers:write');
  const canManageProviders = () => hasPermission('providers:write');

  const canReadSecrets = () => hasPermission('secrets:read');
  const canWriteSecrets = () => hasPermission('secrets:write');
  const canManageSecrets = () => hasPermission('secrets:write');

  const canReadBindings = () => hasPermission('bindings:read');
  const canWriteBindings = () => hasPermission('bindings:write');
  const canManageBindings = () => hasPermission('bindings:write');

  const canReadPolicies = () => hasPermission('policies:read');
  const canWritePolicies = () => hasPermission('policies:write');
  const canManagePolicies = () => hasPermission('policies:write');

  const canReadAudit = () => hasPermission('audit:read');
  const canExportAudit = () => hasPermission('audit:export');

  const isOrgAdmin = () => hasRole('org-admin');
  const isProjectAdmin = () => hasRole('project-admin');
  const isSecretEditor = () => hasRole('secret-editor');
  const isSecretViewer = () => hasRole('secret-viewer');

  const getUserRoles = () => user?.roles || [];
  const getUserGroups = () => user?.groups || [];
  const getUserNamespace = () => user?.namespace || '';

  return {
    // Provider permissions
    canReadProviders,
    canWriteProviders,
    canManageProviders,
    
    // Secret permissions
    canReadSecrets,
    canWriteSecrets,
    canManageSecrets,
    
    // Binding permissions
    canReadBindings,
    canWriteBindings,
    canManageBindings,
    
    // Policy permissions
    canReadPolicies,
    canWritePolicies,
    canManagePolicies,
    
    // Audit permissions
    canReadAudit,
    canExportAudit,
    
    // Role checks
    isOrgAdmin,
    isProjectAdmin,
    isSecretEditor,
    isSecretViewer,
    
    // User info
    getUserRoles,
    getUserGroups,
    getUserNamespace
  };
};
