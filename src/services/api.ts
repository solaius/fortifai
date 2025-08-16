import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Development mode configuration
const isDevelopment = (
  process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
  (typeof window !== 'undefined' && window.location.port === '5173')
);
const MAX_RETRIES_DEV = 1; // Reduce retries in development
const MAX_RETRIES_PROD = 3; // Normal retries in production

// Request/Response interfaces
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add correlation ID for tracing
      config.headers['X-Correlation-ID'] = generateCorrelationId();

      // Log request (in development)
      if (isDevelopment) {
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: config.headers,
        });
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response (in development)
      if (isDevelopment) {
        console.log('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Handle 401 Unauthorized - try to refresh token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token } = refreshResponse.data;
            localStorage.setItem('auth_token', access_token);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const apiError = createApiError(error);
      
      // In development, provide more helpful error messages
      if (isDevelopment) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('🔴 Backend API server is not running. Please start the backend server on port 8080 or update VITE_API_BASE_URL environment variable.');
          console.warn('📝 For development, you can use mock data by setting VITE_USE_MOCK_DATA=true');
        }
      }
      
      console.error('API Error:', apiError);
      return Promise.reject(apiError);
    }
  );

  return client;
};

// Utility functions
const generateCorrelationId = (): string => {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || error.message;
    const code = data?.code || 'UNKNOWN_ERROR';
    return new ApiError(message, status, code, data);
  } else if (error.request) {
    // Network error - provide more specific message in development
    if (isDevelopment && error.code === 'ERR_NETWORK') {
      return new ApiError('Backend server is not running. Please start the API server.', 0, 'NETWORK_ERROR');
    }
    return new ApiError('Network error - no response received', 0, 'NETWORK_ERROR');
  } else {
    return new ApiError(error.message, 0, 'REQUEST_ERROR');
  }
};

// Retry logic with development mode consideration
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries?: number,
  delay: number = 1000
): Promise<T> => {
  // Use different retry limits for development vs production
  const retryLimit = maxRetries ?? (isDevelopment ? MAX_RETRIES_DEV : MAX_RETRIES_PROD);
  let lastError: Error;

  for (let attempt = 1; attempt <= retryLimit; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (error instanceof ApiError) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error; // Don't retry client errors (except rate limiting)
        }
      }

      // In development, don't retry network errors as aggressively
      if (isDevelopment && error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        if (attempt === 1) {
          console.warn('🔄 Network error detected. In development mode, this usually means the backend server is not running.');
        }
        throw error; // Don't retry network errors in development
      }

      if (attempt === retryLimit) {
        throw lastError;
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
};

// API client instance
export const apiClient = createApiClient();

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data;
    });
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    });
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    });
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    });
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return retryRequest(async () => {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    });
  },

  // Paginated GET request
  getPaginated: async <T>(
    url: string,
    page: number = 1,
    perPage: number = 50,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> => {
    const params = { page, per_page: perPage };
    return retryRequest(async () => {
      const response = await apiClient.get<PaginatedResponse<T>>(url, {
        ...config,
        params: { ...config?.params, ...params },
      });
      return response.data;
    });
  },
};

export default api;
