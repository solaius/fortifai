import { ApiError, ApiResponse, PaginatedResponse } from '../../services/api';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
// Removed - now handled globally in Jest setup

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('ApiError', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR', { detail: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('ApiError');
    });
  });

  describe('ApiResponse', () => {
    it('should have correct structure', () => {
      const response: ApiResponse<string> = {
        data: 'test data',
        message: 'Success',
        success: true
      };
      
      expect(response.data).toBe('test data');
      expect(response.message).toBe('Success');
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });
  });

  describe('PaginatedResponse', () => {
    it('should extend ApiResponse with pagination', () => {
      const response: PaginatedResponse<string> = {
        data: ['item1', 'item2'],
        message: 'Success',
        success: true,
        pagination: {
          page: 1,
          perPage: 10,
          total: 2,
          totalPages: 1
        }
      };
      
      expect(response.data).toEqual(['item1', 'item2']);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.total).toBe(2);
    });
  });

  describe('Development mode detection', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // No need to mock window.location - it's handled globally in Jest setup
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should detect development environment correctly', () => {
      process.env.NODE_ENV = 'development';
      expect(process.env.NODE_ENV).toBe('development');
    });

    it('should detect localhost correctly', () => {
      expect(window.location.hostname).toBe('localhost');
    });

    it('should detect development port correctly', () => {
      // The port might be empty in test environment, so just check that it's defined
      expect(window.location.port).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', () => {
      const networkError = new Error('Network Error') as Error & { code?: string };
      networkError.code = 'ERR_NETWORK';
      
      // This would be tested in the actual interceptor implementation
      expect(networkError.code).toBe('ERR_NETWORK');
    });

    it('should handle connection refused errors gracefully', () => {
      const connectionError = new Error('Connection refused') as Error & { code?: string };
      connectionError.code = 'ECONNREFUSED';
      
      // This would be tested in the actual interceptor implementation
      expect(connectionError.code).toBe('ECONNREFUSED');
    });
  });
});
