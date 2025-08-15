import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  groups: string[];
  namespace: string;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user data for development - in production this would come from OpenShift OAuth
  const mockUser: User = {
    id: 'user-123',
    username: 'admin',
    email: 'admin@example.com',
    roles: ['org-admin', 'project-admin', 'secret-editor'],
    groups: ['admin-group', 'finance-group'],
    namespace: 'default',
    isAuthenticated: true
  };

  // Simulate authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // In production, this would check OpenShift OAuth token
        // For now, we'll simulate a successful auth check
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser(mockUser);
        setError(null);
      } catch (err) {
        setError('Authentication failed');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    // In production, this would redirect to OpenShift OAuth
    console.log('Redirecting to OpenShift OAuth...');
    // For demo purposes, we'll just set the mock user
    setUser(mockUser);
    setError(null);
  };

  const logout = () => {
    // In production, this would clear tokens and redirect to logout
    setUser(null);
    setError(null);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Define permission mappings
    const permissionMap: Record<string, string[]> = {
      'providers:read': ['org-admin', 'project-admin', 'secret-viewer'],
      'providers:write': ['org-admin', 'project-admin'],
      'secrets:read': ['org-admin', 'project-admin', 'secret-editor', 'secret-viewer'],
      'secrets:write': ['org-admin', 'project-admin', 'secret-editor'],
      'bindings:read': ['org-admin', 'project-admin', 'secret-editor', 'secret-viewer'],
      'bindings:write': ['org-admin', 'project-admin', 'secret-editor'],
      'policies:read': ['org-admin', 'project-admin'],
      'policies:write': ['org-admin'],
      'audit:read': ['org-admin', 'project-admin'],
      'audit:export': ['org-admin']
    };

    const requiredRoles = permissionMap[permission] || [];
    return requiredRoles.some(role => hasRole(role));
  };

  const refreshUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // In production, this would refresh the OAuth token and user info
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
      setError(null);
    } catch (err) {
      setError('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
