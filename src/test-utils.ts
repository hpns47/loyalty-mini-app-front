import { vi } from 'vitest'

export interface TelegramMock {
  BackButton: {
    show: ReturnType<typeof vi.fn>
    hide: ReturnType<typeof vi.fn>
    onClick: ReturnType<typeof vi.fn>
    offClick: ReturnType<typeof vi.fn>
  }
  MainButton: {
    show: ReturnType<typeof vi.fn>
    hide: ReturnType<typeof vi.fn>
    setText: ReturnType<typeof vi.fn>
    enable: ReturnType<typeof vi.fn>
    disable: ReturnType<typeof vi.fn>
    onClick: ReturnType<typeof vi.fn>
    offClick: ReturnType<typeof vi.fn>
  }
  HapticFeedback: {
    impactOccurred: ReturnType<typeof vi.fn>
    notificationOccurred: ReturnType<typeof vi.fn>
  }
  initData: string
  initDataUnsafe: { user: { id: number; first_name: string; username: string } }
  ready: ReturnType<typeof vi.fn>
  expand: ReturnType<typeof vi.fn>
}

/**
 * Installs a fully-spied Telegram WebApp mock on window.Telegram.WebApp.
 * Returns the mock for assertion access.
 */
export function mockTelegramWebApp(): TelegramMock {
  const mock: TelegramMock = {
    BackButton: {
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    MainButton: {
      show: vi.fn(),
      hide: vi.fn(),
      setText: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    HapticFeedback: {
      impactOccurred: vi.fn(),
      notificationOccurred: vi.fn(),
    },
    initData: 'mock-init-data',
    initDataUnsafe: {
      user: { id: 123456, first_name: 'Test', username: 'testuser' },
    },
    ready: vi.fn(),
    expand: vi.fn(),
  }

  ;(window as any).Telegram = { WebApp: mock }
  return mock
}

/**
 * Reset the Telegram mock to the base setup state.
 */
export function cleanupTelegramMock(): void {
  // Reset to the base mock from test-setup.ts rather than deleting
  ;(window as any).Telegram = {
    WebApp: {
      initData: 'mock-init-data',
      initDataUnsafe: {
        user: { id: 123456, first_name: 'Test', username: 'testuser' },
      },
      themeParams: {},
      ready: () => {},
      expand: () => {},
    },
  }
}

/**
 * Create a successful JSON Response.
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Create an error JSON Response.
 */
export function errorResponse(status: number, code: string): Response {
  return new Response(
    JSON.stringify({ error: { code, message: code } }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )
}

/**
 * Install a fetch mock that routes based on URL patterns.
 * Returns the vi.fn() spy for direct assertions.
 */
export function mockFetchRoutes(
  routes: Record<string, () => Response | Promise<Response>>,
): ReturnType<typeof vi.fn> {
  const spy = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    for (const [pattern, handler] of Object.entries(routes)) {
      if (url.includes(pattern)) return handler()
    }
    return new Response('Not Found', { status: 404 })
  })
  vi.stubGlobal('fetch', spy)
  return spy
}
