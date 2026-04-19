import '@testing-library/jest-dom/vitest'

// Mock Telegram WebApp globally for all component tests
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initData: 'mock-init-data',
      initDataUnsafe: {
        user: { id: 123456, first_name: 'Test', username: 'testuser' },
      },
      themeParams: {},
      ready: () => {},
      expand: () => {},
    },
  },
  writable: true,
})
