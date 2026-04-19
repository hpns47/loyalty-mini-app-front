import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCards } from '../useCards'
import {
  mockTelegramWebApp,
  clearTelegramMock,
  assertApiRunning,
  TEST_USER,
} from '../../test-helpers/setup'

const WAIT_OPTS = { timeout: 10_000 }

let savedFetch: typeof global.fetch

beforeAll(async () => {
  await assertApiRunning()

  // Ensure test user exists
  await fetch('http://localhost:3000/api/v1/auth/me', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': 'mock',
    },
    body: JSON.stringify({}),
  })
}, 15_000)

describe('useCards', () => {
  beforeEach(() => {
    localStorage.clear()
    mockTelegramWebApp()
    savedFetch = global.fetch
  })

  afterEach(() => {
    // Always restore fetch, even if a test fails
    global.fetch = savedFetch
    clearTelegramMock()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('initial render: cards empty, loading true', () => {
    const { result, unmount } = renderHook(() => useCards())

    expect(result.current.cards).toEqual([])
    expect(result.current.loading).toBe(true)

    unmount()
  })

  it('after fetch: returns real cards from DB for test user', async () => {
    const { result, unmount } = renderHook(() => useCards())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(Array.isArray(result.current.cards)).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.isOffline).toBe(false)

    unmount()
  }, 15_000)

  it('caches in localStorage via offline-cache', async () => {
    const { result, unmount } = renderHook(() => useCards())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    const cacheKey = `${TEST_USER.id}_loyalty_cards_all`
    const cached = localStorage.getItem(cacheKey)
    expect(cached).toBeTruthy()

    const parsed = JSON.parse(cached!)
    expect(parsed).toHaveProperty('data')
    expect(parsed).toHaveProperty('cachedAt')
    expect(Array.isArray(parsed.data)).toBe(true)

    unmount()
  }, 15_000)

  it('when offline (fetch fails): returns cached cards + isOffline', async () => {
    // Pre-populate cache manually
    const cacheKey = `${TEST_USER.id}_loyalty_cards_all`
    const cachedCards = [{ id: 'cached-card', shop_id: 'shop-1', shop_name: 'Test', stamp_count: 3, status: 'active', stamp_threshold: 10 }]
    localStorage.setItem(cacheKey, JSON.stringify({ data: cachedCards, cachedAt: Date.now() }))

    // Replace fetch with failing one
    global.fetch = () => Promise.reject(new Error('Network error'))

    const { result, unmount } = renderHook(() => useCards())

    // Wait for the effect to fire and update state to offline
    await waitFor(() => {
      expect(result.current.isOffline).toBe(true)
    }, WAIT_OPTS)

    expect(result.current.cards).toEqual(cachedCards)
    expect(result.current.error).toBeNull()

    unmount()
  }, 15_000)

  it('when stale (>5min old cache): isStale true', async () => {
    const cacheKey = `${TEST_USER.id}_loyalty_cards_all`
    const sixMinAgo = Date.now() - 6 * 60 * 1000
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data: [{ id: 'stale-card' }], cachedAt: sixMinAgo }),
    )

    global.fetch = () => Promise.reject(new Error('Network error'))

    const { result, unmount } = renderHook(() => useCards())

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true)
    }, WAIT_OPTS)

    expect(result.current.isStale).toBe(true)

    unmount()
  }, 15_000)

  it('when status stale (>30s old cache): isStatusStale true', async () => {
    const cacheKey = `${TEST_USER.id}_loyalty_cards_all`
    const fortySecAgo = Date.now() - 40 * 1000
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data: [{ id: 'status-stale-card' }], cachedAt: fortySecAgo }),
    )

    global.fetch = () => Promise.reject(new Error('Network error'))

    const { result, unmount } = renderHook(() => useCards())

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true)
    }, WAIT_OPTS)

    expect(result.current.isStatusStale).toBe(true)

    unmount()
  }, 15_000)

  it('refetch() triggers a new real API call', async () => {
    const { result, unmount } = renderHook(() => useCards())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    const fetchSpy = vi.spyOn(global, 'fetch')

    result.current.refetch()

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled()
    }, WAIT_OPTS)

    expect(result.current.error).toBeNull()

    unmount()
  }, 15_000)
})
