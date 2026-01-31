// tests/setup.ts
// Test setup file for Vitest

import '@testing-library/jest-dom'

// Mock Electron APIs
const mockApi = {
  scripts: {
    create: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  characters: {
    create: vi.fn(),
    get: vi.fn(),
    getByScript: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  locations: {
    create: vi.fn(),
    get: vi.fn(),
    getByScript: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  notes: {
    create: vi.fn(),
    get: vi.fn(),
    getByScript: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // Legacy API
  addScript: vi.fn(),
  getScript: vi.fn(),
  updateScript: vi.fn(),
  getAllScripts: vi.fn(),
}

// Expose mock API to window
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
