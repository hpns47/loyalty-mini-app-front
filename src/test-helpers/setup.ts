/**
 * Shared test helpers for frontend tests.
 * Provides Telegram WebApp mock and API connectivity utilities.
 */

export const API_BASE_URL = 'http://localhost:3000'

/**
 * Dev-bypass initData string. The API accepts 'mock' in development mode
 * and treats it as a valid session for telegram_id=123456.
 */
export const TEST_INIT_DATA = 'mock'

/** The test user returned by the API dev bypass (initData='mock') */
export const TEST_USER = {
  id: 123456,
  first_name: 'Test',
  username: 'testuser',
}

/**
 * Set up window.Telegram.WebApp mock with dev-bypass initData.
 * Call in beforeEach; pairs with clearTelegramMock() in afterEach.
 */
export function mockTelegramWebApp(overrides?: {
  initData?: string
  startParam?: string
}) {
  const initData = overrides?.initData ?? TEST_INIT_DATA
  ;(window as any).Telegram = {
    WebApp: {
      initData,
      initDataUnsafe: {
        user: { ...TEST_USER },
        ...(overrides?.startParam ? { start_param: overrides.startParam } : {}),
      },
      themeParams: {},
      ready: () => {},
      expand: () => {},
    },
  }
}

/** Remove the Telegram WebApp mock from window */
export function clearTelegramMock() {
  ;(window as any).Telegram = undefined
}

/**
 * Assert the local API is reachable. Call once in a top-level beforeAll
 * so tests fail fast with a helpful message instead of timing out.
 */
export async function assertApiRunning() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/shops`, {
      headers: { 'X-Telegram-Init-Data': TEST_INIT_DATA },
    })
    if (!res.ok) throw new Error(`API responded with ${res.status}`)
  } catch (err) {
    throw new Error(
      `Local API is not running on ${API_BASE_URL}. ` +
        'Start it with: bun run dev --filter=api\n' +
        `Original error: ${(err as Error).message}`,
    )
  }
}
