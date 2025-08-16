// Jest setup file for global polyfills
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder (required by React Router)
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Try to mock window.location, but don't fail if it's not possible
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
  // If we can't mock window.location, that's okay - the tests will use the real one
  console.warn('Could not mock window.location:', error.message);
}

// Polyfill for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
