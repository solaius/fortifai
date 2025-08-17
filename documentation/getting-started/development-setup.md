# Development Setup

This document provides step-by-step instructions for setting up the FortifAI development environment, including prerequisites, installation, and configuration.

## 🎯 Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: Version 2.30.0 or higher
- **Code Editor**: VS Code, WebStorm, or similar

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Disk Space**: At least 2GB free space
- **Network**: Internet connection for package downloads

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version
npm --version
# Should output: 9.0.0 or higher

# Check Git version
git --version
# Should output: 2.30.0 or higher
```

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
# Clone the FortifAI repository
git clone https://github.com/your-org/fortifai.git

# Navigate to the project directory
cd fortifai

# Verify the project structure
ls -la
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

Create environment-specific configuration files:

```bash
# Create environment file for development
cp .env.example .env.local

# Edit the environment file
nano .env.local
```

**Example `.env.local` content:**
```bash
# Development Environment
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_MOCK_DATA_ENABLED=true

# Testing Configuration
JEST_WORKERS=4
JEST_TIMEOUT=10000

# Development Server
VITE_PORT=5173
VITE_HOST=localhost
```

### 4. Verify Installation

```bash
# Check if all dependencies are properly installed
npm run build

# Run tests to verify everything works
npm test

# Start development server
npm run dev
```

## ⚙️ Configuration Files

### Package.json

The main project configuration file:

```json
{
  "name": "patternfly-vite-seed-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite build && vite preview",
    "test": "jest"
  }
}
```

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
})
```

### Jest Configuration (`jest.config.cjs`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(svg)$': '<rootDir>/__mocks__/svgMock.cjs',
    '^@patternfly/react-icons/dist/esm/icons/(.*)$': '<rootDir>/__mocks__/iconMock.cjs',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@patternfly|@testing-library)/)'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
```

## 🧪 Testing Setup

### Jest Setup (`jest.setup.js`)

```javascript
// Jest setup file for global polyfills
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder (required by React Router)
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock window.location for consistent test environment
try {
  if (!window.location) {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        port: '5173',
        href: 'http://localhost:5173/',
        origin: 'http://localhost:5173',
        protocol: 'http:',
        host: 'localhost:5173',
        pathname: '/',
        search: '',
        hash: ''
      },
      writable: true,
      configurable: true
    });
  }
} catch (error) {
  console.warn('Could not mock window.location:', error.message);
}

// Additional polyfills and mocks...
```

### Mock Files (`__mocks__/`)

```
__mocks__/
├── svgMock.cjs      # SVG file mocks
└── iconMock.cjs     # Icon component mocks
```

## 🔧 Development Tools

### VS Code Extensions (Recommended)

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### ESLint Configuration (`eslint.config.js`)

```javascript
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
```

## 🚀 Development Workflow

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- --testPathPattern=bindings.test.ts

# Run tests with coverage
npm test -- --coverage
```

### 3. Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### 4. Code Quality

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Node Version Issues

**Problem**: `SyntaxError: Unexpected token '??'`
**Solution**: Update Node.js to version 18.0.0 or higher

```bash
# Check current version
node --version

# Update Node.js (using nvm)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

#### 2. Dependency Installation Issues

**Problem**: `npm ERR! code ENOENT`
**Solution**: Clear npm cache and reinstall

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### 3. TypeScript Compilation Errors

**Problem**: TypeScript errors during build
**Solution**: Check TypeScript configuration and types

```bash
# Check TypeScript version
npx tsc --version

# Run TypeScript compiler
npx tsc --noEmit

# Check for type issues
npx tsc --noEmit --strict
```

#### 4. Test Environment Issues

**Problem**: Tests fail with environment-related errors
**Solution**: Verify Jest configuration and setup

```bash
# Check Jest configuration
npx jest --showConfig

# Run tests with verbose output
npm test -- --verbose

# Check Jest setup file
cat jest.setup.js
```

### Performance Issues

#### 1. Slow Test Execution

```bash
# Run tests with performance profiling
npm test -- --verbose --detectOpenHandles

# Check memory usage
npm test -- --maxWorkers=1 --maxOldSpaceSize=4096
```

#### 2. Slow Development Server

```bash
# Check for large dependencies
npm ls --depth=0

# Analyze bundle size
npm run build -- --analyze
```

## 📚 Additional Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [PatternFly Documentation](https://www.patternfly.org/)

### Community

- [GitHub Issues](https://github.com/your-org/fortifai/issues)
- [Discord Community](https://discord.gg/your-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/fortifai)

### Development Tools

- [VS Code](https://code.visualstudio.com/)
- [WebStorm](https://www.jetbrains.com/webstorm/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

## ✅ Verification Checklist

Before starting development, ensure you have:

- [ ] Node.js 18.0.0+ installed
- [ ] npm 9.0.0+ installed
- [ ] Git 2.30.0+ installed
- [ ] Repository cloned locally
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file configured (`.env.local`)
- [ ] Development server running (`npm run dev`)
- [ ] Tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Code editor configured with recommended extensions
- [ ] ESLint and Prettier configured

## 🎯 Next Steps

After completing the setup:

1. **Read the Testing Documentation**: [Testing Infrastructure](../testing/README.md)
2. **Explore the Codebase**: Familiarize yourself with the project structure
3. **Run the Application**: Start the dev server and explore the UI
4. **Write Your First Test**: Follow the [Test Writing Guidelines](../testing/test-writing-guidelines.md)
5. **Join the Community**: Connect with other developers

---

*If you encounter any issues during setup, please check the troubleshooting section or create an issue in the project repository.*
