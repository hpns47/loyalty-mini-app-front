import { describe, it, expect, beforeAll, beforeEach, afterEach, vi, type MockInstance } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCard } from '../useCard'
import {
  mockTelegramWebApp,
  clearTelegramMock,
  assertApiRunning,
  TEST_USER,
} from '../../test-helpers/setup'

const WAIT_OPTS = { timeout: 15_000 }

let savedFetch: typeof global.fetch

// Use a pre-existing shop from the database instead of seeding one
// This avoids race conditions between parallel test files
let SHOP_ID: string
let SHOP_NAME: string
let SHOP_SLUG: string
let SHOP_THRESHOLD: number

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

  // Get the first available shop
  const res = await fetch('http://localhost:3000/api/v1/shops', {
    headers: { 'X-Telegram-Init-Data': 'mock' },
  })
  const shops = (await res.json()) as Array<{ id: string; name: string; slug: string; stamp_threshold: number }>
  if (shops.length === 0) throw new Error('No shops in DB — seed data required')
  SHOP_ID = shops[0].id
  SHOP_NAME = shops[0].name
  SHOP_SLUG = shops[0].slug
  SHOP_THRESHOLD = shops[0].stamp_threshold
}, 30_000)

describe('useCard', () => {
  beforeEach(() => {
    localStorage.clear()
    mockTelegramWebApp()
    savedFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = savedFetch
    clearTelegramMock()
    vi.restoreAllMocks()
  })

  it('fetches real card for specific shopId', async () => {
    const { result, unmount } = renderHook(() => useCard(SHOP_ID))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    }, WAIT_OPTS)

    expect(result.current.card).not.toBeNull()
    expect((result.current.card as any).shop_id).toBe(SHOP_ID)

    unmount()
  }, 30_000)

  it('returns card + shop info combined from real DB', async () => {
    const { result, unmount } = renderHook(() => useCard(SHOP_ID))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    }, WAIT_OPTS)

    expect(result.current.card).not.toBeNull()
    expect(result.current.shop).not.toBeNull()
    expect(result.current.shop!.id).toBe(SHOP_ID)
    expect(result.current.shop!.name).toBe(SHOP_NAME)
    expect(result.current.shop!.slug).toBe(SHOP_SLUG)
    expect(result.current.shop!.stamp_threshold).toBe(SHOP_THRESHOLD)

    unmount()
  }, 30_000)

  it('caches per shop key in localStorage', async () => {
    const { result, unmount } = renderHook(() => useCard(SHOP_ID))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    }, WAIT_OPTS)

    const cacheKey = `${TEST_USER.id}_loyalty_card_${SHOP_ID}`
    const cached = localStorage.getItem(cacheKey)
    expect(cached).toBeTruthy()

    const parsed = JSON.parse(cached!)
    expect(parsed.data.card).toBeTruthy()
    expect(parsed.data.shop).toBeTruthy()
    expect(parsed.cachedAt).toBeGreaterThan(0)

    unmount()
  }, 30_000)

  it('handles new shopId gracefully — card upserted in real DB', async () => {
    const { result, unmount } = renderHook(() => useCard(SHOP_ID))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    }, WAIT_OPTS)

    expect(result.current.card).not.toBeNull()
    expect((result.current.card as any).stamp_count).toBeGreaterThanOrEqual(0)
    expect((result.current.card as any).status).toBe('active')

    unmount()
  }, 30_000)

  it('when offline with cache: returns cached card + isOffline', async () => {
    // Pre-populate cache
    const cacheKey = `${TEST_USER.id}_loyalty_card_${SHOP_ID}`
    const cachedCard = { id: 'cached', shop_id: SHOP_ID, stamp_count: 3, status: 'active', stamp_threshold: 10 }
    const cachedShop = { id: SHOP_ID, name: SHOP_NAME, slug: SHOP_SLUG, stamp_threshold: SHOP_THRESHOLD }
    localStorage.setItem(cacheKey, JSON.stringify({ data: { card: cachedCard, shop: cachedShop }, cachedAt: Date.now() }))

    global.fetch = () => Promise.reject(new Error('Network error'))

    const { result, unmount } = renderHook(() => useCard(SHOP_ID))

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true)
    }, WAIT_OPTS)

    expect(result.current.card).toEqual(cachedCard)
    expect(result.current.shop).toEqual(cachedShop)
    expect(result.current.error).toBeNull()

    unmount()
  }, 15_000)

  it('when offline without cache: returns error', async () => {
    global.fetch = () => Promise.reject(new Error('Network error'))

    const { result, unmount } = renderHook(() => useCard(SHOP_ID))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, WAIT_OPTS)

    expect(result.current.card).toBeNull()
    expect(result.current.error).toBeTruthy()

    unmount()
  }, 15_000)
})
