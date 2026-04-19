import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUserQr } from '../useUserQr'
import {
  mockTelegramWebApp,
  clearTelegramMock,
  assertApiRunning,
} from '../../test-helpers/setup'

const WAIT_OPTS = { timeout: 10_000 }

beforeAll(async () => {
  await assertApiRunning()

  // Ensure test user exists by calling auth endpoint
  await fetch('http://localhost:3000/api/v1/auth/me', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': 'mock',
    },
    body: JSON.stringify({}),
  })
}, 15_000)

describe('useUserQr', () => {
  beforeEach(() => {
    mockTelegramWebApp()
  })

  afterEach(() => {
    clearTelegramMock()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('initial render: loading true, qrDataUrl null', () => {
    const { result, unmount } = renderHook(() => useUserQr())

    expect(result.current.loading).toBe(true)
    expect(result.current.qrDataUrl).toBeNull()

    unmount()
  })

  it('after fetch: returns real QR data URL and expiry', async () => {
    const { result, unmount } = renderHook(() => useUserQr())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.qrDataUrl).toMatch(/^data:image\/png;base64,/)
    expect(result.current.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000))
    expect(result.current.error).toBeNull()

    unmount()
  }, 15_000)

  it('auto-refreshes every 55 seconds (interval is set)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    const fetchSpy = vi.spyOn(global, 'fetch')

    const { result, unmount } = renderHook(() => useUserQr())

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    const initialCallCount = fetchSpy.mock.calls.length

    await act(async () => {
      vi.advanceTimersByTime(55_000)
    })

    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBeGreaterThan(initialCallCount)
    }, WAIT_OPTS)

    unmount()
  }, 30_000)

  it('cleanup: clears interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { result, unmount } = renderHook(() => useUserQr())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  }, 15_000)

  it('on error (no initData): returns error state', async () => {
    clearTelegramMock()

    const { result } = renderHook(() => useUserQr())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.qrDataUrl).toBeNull()
    expect(result.current.error).toBeTruthy()
  }, 15_000)

  it('on API error (invalid initData): returns error code from response', async () => {
    // Use invalid initData that will get a 401 from the API
    clearTelegramMock()
    mockTelegramWebApp({ initData: 'invalid-init-data' })

    const { result, unmount } = renderHook(() => useUserQr())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.qrDataUrl).toBeNull()
    expect(result.current.error).toBeTruthy()

    unmount()
  }, 15_000)

  it('on network error: returns error state', async () => {
    const savedFetch = global.fetch
    global.fetch = () => Promise.reject(new Error('NETWORK_ERROR'))

    const { result, unmount } = renderHook(() => useUserQr())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.qrDataUrl).toBeNull()
    expect(result.current.error).toBe('NETWORK_ERROR')

    global.fetch = savedFetch
    unmount()
  }, 15_000)
})
