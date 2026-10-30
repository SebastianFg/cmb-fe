import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';
import { TextEncoder } from 'node:util';
import { cleanup } from '@testing-library/react';

if (typeof globalThis.TextEncoder === 'undefined') {
  Object.defineProperty(globalThis, 'TextEncoder', {
    configurable: true,
    value: TextEncoder,
    writable: true,
  });
}

if (typeof globalThis.crypto?.subtle === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: webcrypto,
    writable: true,
  });
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    },
    writable: true,
  });
}

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
