# FortifAI - Enterprise AI Secrets Management Platform

**FortifAI** is a comprehensive enterprise platform for managing AI workloads, secrets, and MCP server bindings with Red Hat AI (OpenShift AI) integration. Built with modern enterprise technologies and designed for production AI environments.

## 🚀 Technology Stack

This project is built with modern enterprise technologies:
- [PatternFly](https://www.patternfly.org/) (v6.2, React 19 compatible) - Enterprise UI components
- [Vite](https://vitejs.dev/) - Fast development and build tooling
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [React 19](https://react.dev/) - Modern React with concurrent features
- [Jest](https://jestjs.io/) - Comprehensive testing framework
- [OpenShift AI](https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai) - Enterprise AI platform integration

---

## 🚀 Vibe Coding & AI Documentation Support

This project supports **vibe coding** workflows, where you can direct an AI agent to use the [`ai_docs/`](./ai_docs/) directory as a primary source for developing with PatternFly. The documentation in this directory provides:
- Core rules and best practices for PatternFly React development
- Component usage guidelines, layout rules, and troubleshooting
- Quick navigation to specialized rules and resources

**Tip:** When using an AI coding assistant (like Cursor), you can instruct it to prioritize the `ai_docs` directory for authoritative guidance on PatternFly usage in this codebase.

### Cursor Rule
If you are using the Cursor editor, there is a **Cursor rule** you can leverage to further enhance AI-driven development. This rule helps the agent understand how to use the `ai_docs` directory as the primary source for PatternFly-related questions and implementation details.

---

## 📚 Project Documentation

Comprehensive documentation is available in the [`documentation/`](./documentation/) folder:

### 🏗️ Architecture & Design
- [**Architecture Overview**](./documentation/architecture/README.md) - System architecture and design principles
- [**API Documentation**](./documentation/api/README.md) - API endpoints and integration guides

### 🚀 Getting Started
- [**Development Setup**](./documentation/getting-started/development-setup.md) - Complete development environment setup
- [**Quick Start Guide**](./ai-docs/setup/quick-start.md) - Get up and running quickly
- [**Common Issues**](./documentation/getting-started/common-issues.md) - Troubleshooting common problems

### 🧪 Testing & Quality
- [**Testing Infrastructure**](./documentation/testing/README.md) - Comprehensive testing guide and patterns
- [**RHAI Unit Tests**](./documentation/testing/rhai-unit-tests-implementation.md) - RHAI-specific testing implementation
- [**Test Writing Guidelines**](./documentation/testing/test-writing-guidelines.md) - Best practices for writing tests
- [**Mock Data Management**](./documentation/testing/mock-data-management.md) - Managing test data and mocks

### 🔧 Development & Deployment
- [**Component Architecture**](./ai_docs/guidelines/component-architecture.md) - PatternFly component development patterns
- [**Styling Standards**](./ai_docs/guidelines/styling-standards.md) - CSS and design system guidelines
- [**Deployment Guide**](./ai_docs/guidelines/deployment-guide.md) - Production deployment instructions

---

## 🎯 Key Features & Capabilities

### 🔐 AI Secrets Management
- **Comprehensive Secret Management**: Centralized management of API keys, database credentials, and AI service secrets
- **Provider Integration**: Support for HashiCorp Vault, AWS Secrets Manager, and Azure Key Vault
- **Secret Rotation**: Automated secret rotation policies with enterprise-grade security
- **Access Control**: Role-based access control (RBAC) for secret management
- **Enterprise Compliance**: SOC 2, GDPR, and enterprise security standards compliance

### 🤖 MCP Server Bindings
- **Model Context Protocol**: Full support for MCP server integration and management
- **AI Workload Binding**: Secure binding of AI workloads to MCP servers
- **Runtime Configuration**: Comprehensive runtime configuration management for AI workloads
- **Health Monitoring**: Real-time health monitoring and validation of MCP server bindings

### ☁️ OpenShift AI Integration
- **Enterprise AI Platform**: Native integration with Red Hat OpenShift AI
- **Multi-Tenant Support**: Team isolation and project management for AI workloads
- **OAuth Integration**: Secure authentication and authorization for AI services
- **Resource Management**: Resource quotas, network policies, and service account management
- **Enterprise Workflows**: MLOps, AI research, and production AI workload management

### 🧪 Testing & Quality Assurance
- **Comprehensive Testing**: 12 test suites with 100% success rate
- **RHAI-Specific Tests**: 58 specialized tests for Red Hat AI functionality
- **Mock-First Approach**: Comprehensive mocking strategy for reliable testing
- **Type Safety**: Full TypeScript compliance with proper interfaces
- **Test Coverage**: Complete coverage of AI workload management, OpenShift AI integration, and enterprise workflows

For detailed testing information, see [`documentation/testing/README.md`](./documentation/testing/README.md) and [`documentation/testing/rhai-unit-tests-implementation.md`](./documentation/testing/rhai-unit-tests-implementation.md).

**Current Test Status**: All 58 RHAI-specific tests passing successfully! 🎉

## 🏢 Enterprise Use Cases

### **Industries Served**
- **Financial Services**: Secure AI model deployment with compliance requirements
- **Healthcare**: HIPAA-compliant AI workload management and data protection
- **Manufacturing**: Industrial AI with secure MCP server integration
- **Research & Development**: Multi-tenant AI research environments
- **Government**: FedRAMP and security clearance compliance

### **Key Enterprise Scenarios**
- **MLOps Production**: End-to-end machine learning pipeline management
- **AI Research Collaboration**: Multi-team AI experimentation and development
- **Enterprise AI Governance**: Centralized AI workload management and compliance
- **Secure AI Deployment**: Production AI model deployment with enterprise security

### 🏗️ Project Structure
- **`src/pages/`**: Each page (Dashboard, Settings, Instances, Documentation) has its own directory with tests and index exports
- **`src/components/`**: Reusable UI components organized by feature (Bindings, Layout, Providers, Secrets)
- **`src/services/`**: Service layer for API integration, secrets management, and provider integration
- **`src/__tests__/`**: Comprehensive test suite with 12 test files including RHAI-specific tests
- **`documentation/`**: Complete project documentation covering architecture, testing, and development guides
- **`ai-docs/`**: AI development guidelines and PatternFly best practices

Main navigation and layout are managed in `App.tsx` using PatternFly's `Page`, `Masthead`, and `Sidebar` components.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Git**: For version control

### Installation & Setup
```sh
# Clone the repository
git clone <repository-url>
cd fortifai

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🧪 Running Tests
```sh
# Run all tests (12 test suites)
npm test

# Run RHAI-specific tests only
npm test -- --testPathPattern="rhai|openshift|enterprise"

# Run tests in watch mode
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose
```

### 🏗️ Development Commands
```sh
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

For comprehensive development setup instructions, see [`documentation/getting-started/development-setup.md`](./documentation/getting-started/development-setup.md).

## 📊 Project Status

### ✅ **Recent Achievements**
- **RHAI Testing Complete**: Successfully implemented 58 RHAI-specific unit tests covering enterprise AI workflows
- **Testing Infrastructure**: 12 test suites with 100% success rate and comprehensive coverage
- **Documentation**: Complete documentation suite covering architecture, testing, and development guides
- **PatternFly 6.2**: Fully upgraded to latest PatternFly version with React 19 support
- **Enterprise AI Features**: Complete MCP server binding management and OpenShift AI integration

### 🎯 **Current Status**
- **Development**: Active development with comprehensive testing coverage
- **Documentation**: Complete documentation suite covering architecture, testing, and development
- **Testing**: Robust testing infrastructure with RHAI-specific test coverage
- **Quality**: Enterprise-grade code quality with TypeScript and comprehensive testing

### 🚀 **Next Steps**
- **CI/CD Integration**: Integrate comprehensive testing into automated pipelines
- **Performance Testing**: Add performance benchmarks for AI workloads
- **Security Testing**: Implement security testing for AI workload features
- **Production Deployment**: Deploy to production environments

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and ensure all tests pass before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**FortifAI** demonstrates best practices for building maintainable, accessible, and enterprise-ready AI management platforms with PatternFly, Vite, TypeScript, and React 19.
