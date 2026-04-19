import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import {
  mockTelegramWebApp,
  clearTelegramMock,
  assertApiRunning,
  TEST_USER,
} from '../../test-helpers/setup'

const WAIT_OPTS = { timeout: 10_000 }

beforeAll(async () => {
  await assertApiRunning()
}, 15_000)

describe('useAuth', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockTelegramWebApp()
  })

  afterEach(() => {
    clearTelegramMock()
    vi.restoreAllMocks()
  })

  it('initial render: loading true, user null, error null', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('after successful auth: returns real user from DB', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.user).not.toBeNull()
    expect(result.current.user!.id).toBeTruthy()
    expect(result.current.user!.first_name).toBe(TEST_USER.first_name)
    expect(result.current.user!.telegram_id).toBe(TEST_USER.id)
    expect(result.current.error).toBeNull()
  }, 15_000)

  it('with invalid initData: hook returns error from real 401', async () => {
    clearTelegramMock()
    mockTelegramWebApp({ initData: 'invalid-data' })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeTruthy()
  }, 15_000)

  it('on network error: returns error state', async () => {
    const originalFetch = global.fetch
    global.fetch = () => Promise.reject(new Error('NETWORK_ERROR'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeTruthy()

    global.fetch = originalFetch
  }, 15_000)

  it('caches user in sessionStorage after success', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    const cached = sessionStorage.getItem('auth_user')
    expect(cached).toBeTruthy()
    const parsed = JSON.parse(cached!)
    expect(parsed.telegram_id).toBe(TEST_USER.id)
  }, 15_000)

  it('reads from sessionStorage on mount if cached — no re-fetch', async () => {
    const cachedUser = { id: 'cached-id', telegram_id: 123456, first_name: 'Cached', username: 'cached' }
    sessionStorage.setItem('auth_user', JSON.stringify(cachedUser))

    const fetchSpy = vi.spyOn(global, 'fetch')

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(cachedUser)
    expect(result.current.error).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
