# Project Architecture

This document provides a comprehensive overview of the FortifAI project architecture, including system design, component relationships, and architectural decisions.

## 🎯 Overview

FortifAI is a modern web application built with React, TypeScript, and Vite, designed to provide secure secrets management and MCP (Model Context Protocol) server binding capabilities. The architecture follows a service-oriented pattern with comprehensive testing infrastructure.

## 🏗️ High-Level Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  React Components  │  Custom Hooks  │  Context Providers      │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  BindingsService  │  ProvidersService  │  SecretsService      │
├─────────────────────────────────────────────────────────────────┤
│                    RBAC Services                                │
├─────────────────────────────────────────────────────────────────┤
│  RBACService  │  PolicyEngineService  │  PolicyVersioningService │
├─────────────────────────────────────────────────────────────────┤
│                      Mock Data Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Mock Data  │  Mock Services  │  Test Utilities              │
├─────────────────────────────────────────────────────────────────┤
│                      Testing Infrastructure                    │
├─────────────────────────────────────────────────────────────────┤
│  Jest Framework  │  Test Suites  │  Mock Configuration       │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript 5.8.3
- **Testing Framework**: Jest 29.7.0
- **UI Library**: PatternFly 6.3.0
- **State Management**: React Query + Context API
- **HTTP Client**: Axios 1.7.9

## 📁 Project Structure

### Directory Layout

```
fortifai/
├── src/                          # Source code
│   ├── components/               # React components
│   ├── services/                 # Business logic services
│   ├── types/                    # TypeScript type definitions
│   ├── contexts/                 # React context providers
│   ├── hooks/                    # Custom React hooks
│   ├── pages/                    # Page components
│   ├── assets/                   # Static assets
│   └── __tests__/                # Test files
├── documentation/                 # Project documentation
├── __mocks__/                    # Global test mocks
├── public/                       # Public assets
├── jest.config.cjs              # Jest configuration
├── jest.setup.js                # Jest setup file
├── tsconfig.json                # TypeScript configuration
├── vite.config.js               # Vite configuration
└── package.json                 # Project dependencies
```

### Key Directories

#### `src/services/`
Contains the core business logic services:
- **`bindings.ts`**: MCP server binding management
- **`providers.ts`**: Secrets provider management
- **`secrets.ts`**: Secret reference management
- **`rbac.ts`**: Role-based access control management
- **`policyEngine.ts`**: Policy evaluation and decision making
- **`policyVersioning.ts`**: Policy versioning and audit trails
- **`api.ts`**: API utility functions
- **`mockData.ts`**: Mock data and utilities

#### `src/types/`
TypeScript interface definitions:
- **`bindings.ts`**: Binding-related types
- **`secrets.ts`**: Secret-related types
- **`providers.ts`**: Provider-related types
- **`rbac.ts`**: RBAC and policy-related types
- **`api.ts`**: API response types

#### `src/__tests__/`
Test files organized by service:
- **`services/`**: Service layer tests
- **`__mocks__/`**: Global test mocks

## 🔧 Service Architecture

### Service Layer Pattern

The application follows a service-oriented architecture where each service encapsulates specific business logic:

```typescript
class BindingsService {
  private bindings: Map<string, MCPServerBinding> = new Map();
  
  async listBindings(filter?: BindingFilter): Promise<MCPServerBinding[]> {
    // Implementation with mock data fallback
  }
  
  async createBinding(request: CreateBindingRequest): Promise<MCPServerBinding> {
    // Implementation with validation
  }
  
  // ... other methods
}
```

### Service Dependencies

```
BindingsService
├── depends on: SecretsService
├── depends on: ProvidersService
└── uses: MockData utilities

ProvidersService
├── depends on: VaultService (external)
└── uses: MockData utilities

SecretsService
├── depends on: ProvidersService
└── uses: MockData utilities
```

### Mock Data Integration

Services integrate with mock data through environment detection:

```typescript
async listBindings(filter?: BindingFilter): Promise<MCPServerBinding[]> {
  try {
    // Priority 1: Use mock data in test environment
    if (process.env.NODE_ENV === 'test') {
      return this.filterMockBindings(mockBindings, filter);
    }

    // Priority 2: Use mock data if enabled
    if (shouldUseMockData()) {
      return this.filterMockBindings(mockBindings, filter);
    }

    // Priority 3: Make real API call
    const response = await api.get('/bindings', { params: filter });
    return response.data;
  } catch (error) {
    // Priority 4: Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      return this.filterMockBindings(mockBindings, filter);
    }
    throw error;
  }
}
```

## 🧪 Testing Architecture

### Test Organization

Tests are organized to mirror the source code structure:

```
src/__tests__/
├── services/                     # Service layer tests
│   ├── api.test.ts             # API utility tests
│   ├── bindings.test.ts        # Bindings service tests
│   ├── mockData.test.ts        # Mock data tests
│   ├── providers.test.ts       # Providers service tests
│   ├── rbac.test.ts            # RBAC service tests
│   └── secrets.test.ts         # Secrets service tests
└── __mocks__/                   # Global mocks
    ├── svgMock.cjs             # SVG file mocks
    └── iconMock.cjs            # Icon component mocks
```

### Mock Strategy

The testing infrastructure uses a comprehensive mocking strategy:

1. **Service Dependencies**: External services are mocked using `jest.mock()`
2. **API Calls**: HTTP requests are mocked to prevent real network calls
3. **Mock Data**: Realistic mock data conforms to actual TypeScript interfaces
4. **Environment Detection**: Tests automatically use mock data

### Test Configuration

Jest is configured for optimal testing:

```javascript
module.exports = {
  testEnvironment: 'jsdom',           // Browser-like environment
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,                   // ES modules support
      tsconfig: {
        module: 'esnext',
        target: 'es2020',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      }
    }],
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(svg)$': '<rootDir>/__mocks__/svgMock.cjs',
  },
};
```

## 🔐 RBAC Architecture

### RBAC System Components

The RBAC system provides comprehensive access control through three core services:

```
┌─────────────────────────────────────────────────────────────────┐
│                        RBAC Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  RBACService  │  PolicyEngineService  │  PolicyVersioningService │
├─────────────────────────────────────────────────────────────────┤
│                    Policy Evaluation                            │
├─────────────────────────────────────────────────────────────────┤
│  Policy Rules  │  Policy Targets  │  Policy Conditions        │
├─────────────────────────────────────────────────────────────────┤
│                    Access Control                              │
├─────────────────────────────────────────────────────────────────┤
│  Role Checks  │  Permission Validation  │  Policy Enforcement   │
└─────────────────────────────────────────────────────────────────┘
```

### Service Responsibilities

#### RBACService
- **Role Management**: CRUD operations for user roles
- **Permission Management**: Granular permission definitions
- **Policy Management**: Access policy definitions
- **Utility Methods**: Role checking and filtering

#### PolicyEngineService
- **Policy Evaluation**: Deterministic access decisions
- **Conflict Resolution**: Priority-based policy resolution
- **Caching**: Performance optimization through result caching
- **Simulation**: Policy testing before deployment

#### PolicyVersioningService
- **Version Control**: Complete policy change history
- **Audit Trail**: Immutable change records
- **Rollback Support**: Version restoration capabilities
- **Change Tracking**: Detailed change analysis

### Policy Evaluation Flow

```
Access Request → Policy Collection → Rule Evaluation → Condition Checking → Decision Making → Result Caching
```

### Security Features

- **Principle of Least Privilege**: Minimum necessary permissions
- **Policy Validation**: Automatic conflict detection
- **Immutable Audit Logs**: Complete change history
- **Risk Assessment**: Built-in security analysis

## 🔄 Data Flow

### Request Flow

```
User Action → React Component → Custom Hook → Service Method → Mock Data/API → Response → UI Update
```

### Mock Data Flow

```
Test Execution → Service Method → shouldUseMockData() → Mock Data → Test Validation
```

### Error Handling Flow

```
Service Method → API Call → Error → Fallback to Mock Data → Response → UI Update
```

## 🎨 Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Layout
│   │   ├── Navigation
│   │   └── Main Content
│   │       ├── BindingsPage
│   │       ├── ProvidersPage
│   │       └── SecretsPage
│   └── Error Boundaries
└── Context Providers
    ├── ThemeProvider
    ├── AuthProvider
    └── DataProvider
```

### Component Patterns

- **Container Components**: Handle business logic and data fetching
- **Presentational Components**: Focus on UI rendering
- **Custom Hooks**: Encapsulate reusable logic
- **Context Providers**: Manage global state

## 🔐 Security Architecture

### Mock Data Security

- Mock data doesn't contain real secrets or credentials
- All sensitive information is fictional and for testing only
- No production data is used in tests or development

### Environment Isolation

- Test environment is completely isolated from production
- Mock data is only used in development and test environments
- Real API calls are never made during testing

## 📈 Performance Architecture

### Optimization Strategies

1. **Mock-First Approach**: Services check for mock data before making API calls
2. **Lazy Loading**: Mock data is loaded only when needed
3. **Efficient Filtering**: Mock data filtering uses optimized algorithms
4. **Memory Management**: Proper cleanup prevents memory leaks

### Performance Metrics

- **Test Execution**: Full suite completes in < 30 seconds
- **Memory Usage**: Individual tests use < 50MB
- **Startup Time**: Jest starts in < 5 seconds
- **Watch Mode**: Tests re-run in < 2 seconds

## 🔧 Configuration Architecture

### Environment Configuration

The application supports multiple environments:

```bash
# Development
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_MOCK_DATA_ENABLED=true

# Testing
NODE_ENV=test
JEST_WORKERS=4
JEST_TIMEOUT=10000

# Production
NODE_ENV=production
VITE_API_BASE_URL=https://api.production.com
VITE_MOCK_DATA_ENABLED=false
```

### Build Configuration

Vite is configured for optimal development and production builds:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## 🚀 Deployment Architecture

### Build Process

```
Source Code → TypeScript Compilation → Vite Build → Production Bundle → Deployment
```

### Deployment Targets

- **Development**: Local development server
- **Testing**: CI/CD pipeline with automated testing
- **Staging**: Pre-production environment
- **Production**: Live application deployment

## 🔄 Maintenance Architecture

### Code Quality

- **ESLint**: Code linting and style enforcement
- **TypeScript**: Static type checking
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Testing Quality

- **Jest**: Test execution and coverage
- **Testing Library**: Component testing utilities
- **Mock Data**: Comprehensive test data management
- **Coverage Reports**: Automated quality metrics

### Documentation Quality

- **Comprehensive Guides**: Setup, testing, and troubleshooting
- **Code Examples**: Practical implementation examples
- **Best Practices**: Development and testing guidelines
- **Troubleshooting**: Common issues and solutions

## 📚 Architectural Decisions

### 1. Service-Oriented Architecture

**Decision**: Use service classes for business logic
**Rationale**: Better separation of concerns, easier testing, and maintainability

### 2. Mock-First Testing

**Decision**: Prioritize mock data in test environment
**Rationale**: Faster tests, no external dependencies, predictable results

### 3. TypeScript Integration

**Decision**: Use TypeScript throughout the project
**Rationale**: Type safety, better IDE support, reduced runtime errors

### 4. Jest Testing Framework

**Decision**: Use Jest for testing
**Rationale**: Excellent TypeScript support, comprehensive mocking, fast execution

### 5. Vite Build Tool

**Decision**: Use Vite for development and building
**Rationale**: Fast development server, modern build tooling, excellent React support

## 🔮 Future Architecture

### Planned Improvements

1. **Microservices**: Break down services into smaller, focused modules
2. **API Gateway**: Centralized API management and routing
3. **Caching Layer**: Redis or in-memory caching for performance
4. **Event-Driven Architecture**: Async communication between services
5. **Containerization**: Docker support for deployment

### Scalability Considerations

- **Horizontal Scaling**: Stateless services for easy scaling
- **Database Optimization**: Efficient data access patterns
- **CDN Integration**: Static asset delivery optimization
- **Load Balancing**: Traffic distribution across instances

---

*This architecture documentation provides a comprehensive overview of the FortifAI project structure and design decisions. For implementation details, refer to the specific service and component documentation.*
