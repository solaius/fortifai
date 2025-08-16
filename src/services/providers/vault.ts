import { api } from '../api';
import { VaultProvider, VaultConfig, VaultAuth, ProviderHealth, ProviderTestResult } from '../../types/providers';

export interface VaultSecret {
  path: string;
  data: Record<string, any>;
  metadata: {
    createdTime: string;
    deletionTime?: string;
    destroyed: boolean;
    version: number;
  };
}

export interface VaultSecretList {
  keys: string[];
  path: string;
}

export interface VaultMount {
  type: string;
  description: string;
  accessor: string;
  config: {
    default_lease_ttl: number;
    max_lease_ttl: number;
    force_no_cache: boolean;
  };
  options: Record<string, string>;
  local: boolean;
  seal_wrap: boolean;
  external_entropy_access: boolean;
}

export class VaultService {
  private baseUrl: string;
  private token: string | null = null;
  private namespace: string | null = null;

  constructor(config: VaultConfig) {
    this.baseUrl = config.address;
    this.namespace = config.namespace || null;
  }

  // Authentication methods
  async authenticateWithAppRole(roleId: string, secretId: string): Promise<boolean> {
    try {
      const response = await api.post('/v1/auth/approle/login', {
        role_id: roleId,
        secret_id: secretId
      }, {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });

      if (response.success && response.data.auth?.client_token) {
        this.token = response.data.auth.client_token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('AppRole authentication failed:', error);
      return false;
    }
  }

  async authenticateWithKubernetes(role: string, jwt: string, mountPath: string = 'kubernetes'): Promise<boolean> {
    try {
      const response = await api.post(`/v1/auth/${mountPath}/login`, {
        role: role,
        jwt: jwt
      }, {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });

      if (response.success && response.data.auth?.client_token) {
        this.token = response.data.auth.client_token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Kubernetes authentication failed:', error);
      return false;
    }
  }

  async authenticateWithToken(token: string): Promise<boolean> {
    try {
      this.token = token;
      // Test the token by making a simple API call
      const response = await api.get('/v1/auth/token/lookup-self', {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });
      return response.success;
    } catch (error) {
      console.error('Token authentication failed:', error);
      this.token = null;
      return false;
    }
  }

  // Secret operations
  async readSecret(path: string): Promise<VaultSecret | null> {
    try {
      const response = await api.get(`/v1/${path}`, {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });

      if (response.success && response.data.data) {
        return {
          path,
          data: response.data.data,
          metadata: response.data.metadata || {}
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to read secret at ${path}:`, error);
      return null;
    }
  }

  async writeSecret(path: string, data: Record<string, any>): Promise<boolean> {
    try {
      const response = await api.post(`/v1/${path}`, { data }, {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to write secret at ${path}:`, error);
      return false;
    }
  }

  async deleteSecret(path: string): Promise<boolean> {
    try {
      const response = await api.delete(`/v1/${path}`, {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });
      return response.success;
    } catch (error) {
      console.error(`Failed to delete secret at ${path}:`, error);
      return false;
    }
  }

  async listSecrets(path: string): Promise<VaultSecretList | null> {
    try {
      const response = await api.get(`/v1/${path}?list=true`, {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });

      if (response.success && response.data.data) {
        return {
          path,
          keys: response.data.data.keys || []
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to list secrets at ${path}:`, error);
      return null;
    }
  }

  // Mount operations
  async listMounts(): Promise<Record<string, VaultMount> | null> {
    try {
      const response = await api.get('/v1/sys/mounts', {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });

      if (response.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to list mounts:', error);
      return null;
    }
  }

  // Health and status
  async getHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      const response = await api.get('/v1/sys/health', {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });

      const responseTime = Date.now() - startTime;
      
      if (response.success) {
        const data = response.data;
        return {
          status: this.determineHealthStatus(data),
          lastCheck: new Date().toISOString(),
          responseTime,
          details: {
            version: data.version,
            uptime: data.server_time_utc ? Date.now() - new Date(data.server_time_utc).getTime() : undefined,
            connections: data.cluster_id ? 1 : 0
          }
        };
      } else {
        return {
          status: 'critical',
          lastCheck: new Date().toISOString(),
          responseTime,
          error: 'Health check failed',
          details: {}
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'disconnected',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {}
      };
    }
  }

  async testConnection(): Promise<ProviderTestResult> {
    const startTime = Date.now();
    
    try {
      // Test 1: Basic connectivity
      const healthCheck = await this.getHealth();
      if (healthCheck.status === 'disconnected') {
        return {
          success: false,
          message: 'Cannot connect to Vault server',
          error: healthCheck.error
        };
      }

      // Test 2: Authentication
      if (!this.token) {
        return {
          success: false,
          message: 'No authentication token available',
          error: 'Authentication required'
        };
      }

      // Test 3: Permissions
      const canRead = await this.testReadPermission();
      const canList = await this.testListPermission();

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: 'Connection test successful',
        details: {
          authTest: true,
          connectionTest: true,
          permissionTest: canRead && canList,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          authTest: false,
          connectionTest: false,
          permissionTest: false,
          responseTime
        }
      };
    }
  }

  // Utility methods
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['X-Vault-Token'] = this.token;
    }

    if (this.namespace) {
      headers['X-Vault-Namespace'] = this.namespace;
    }

    return headers;
  }

  private determineHealthStatus(healthData: any): 'healthy' | 'warning' | 'critical' {
    if (healthData.initialized === false) {
      return 'critical';
    }
    
    if (healthData.sealed === true) {
      return 'critical';
    }
    
    if (healthData.standby === true) {
      return 'warning';
    }
    
    if (healthData.performance_standby === true) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private async testReadPermission(): Promise<boolean> {
    try {
      // Try to read a non-existent secret to test permissions
      // This will fail with 403 if no permission, 404 if permission but no secret
      await api.get('/v1/secret/test-permission', {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });
      return true;
    } catch (error: any) {
      // 404 means we have permission but secret doesn't exist (which is fine)
      // 403 means we don't have permission
      return error.status === 404;
    }
  }

  private async testListPermission(): Promise<boolean> {
    try {
      // Try to list secrets to test list permissions
      await api.get('/v1/secret?list=true', {
        baseURL: this.baseUrl,
        headers: this.getHeaders()
      });
      return true;
    } catch (error: any) {
      // 403 means we don't have permission
      return error.status !== 403;
    }
  }

  // Cleanup
  logout(): void {
    this.token = null;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export default VaultService;
