// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCachedCard,
  setCachedCard,
  getCachedCards,
  setCachedCards,
  isStale,
  isStatusUntrusted,
  STALE_THRESHOLD_MS,
  STATUS_TRUST_MS,
} from '../offline-cache'

let mockUserId: number | null = 12345

vi.mock('../telegram', () => ({
  getTelegramUser: () => mockUserId ? { id: mockUserId, first_name: 'Test' } : null,
}))

beforeEach(() => {
  mockUserId = 12345
  localStorage.clear()
})

const card = {
  id: 'card-1', user_id: 'u1', shop_id: 'shop-1',
  stamp_count: 5, status: 'active' as const,
  total_stamps_earned: 5, created_at: '', updated_at: '',
}
const shop = { id: 'shop-1', name: 'Test Shop', slug: 'test', stamp_threshold: 10 }
const cards = [{ id: '1', shop_id: 's1', shop_name: 'A', stamp_count: 3, status: 'active', stamp_threshold: 10 }]

describe('single card cache', () => {
  it('returns null when no cache', () => {
    expect(getCachedCard('shop-1')).toBeNull()
  })

  it('round-trips card + shop', () => {
    setCachedCard('shop-1', card, shop)
    const entry = getCachedCard('shop-1')
    expect(entry).not.toBeNull()
    expect(entry!.data.card.stamp_count).toBe(5)
    expect(entry!.data.shop.name).toBe('Test Shop')
    expect(entry!.cachedAt).toBeGreaterThan(0)
  })

  it('uses userId prefix in key', () => {
    setCachedCard('shop-1', card, shop)
    expect(localStorage.getItem('12345_loyalty_card_shop-1')).not.toBeNull()
  })
})

describe('cards list cache', () => {
  it('returns null when no cache', () => {
    expect(getCachedCards()).toBeNull()
  })

  it('round-trips cards list', () => {
    setCachedCards(cards)
    const entry = getCachedCards()
    expect(entry!.data).toEqual(cards)
  })

  it('uses userId prefix in key', () => {
    setCachedCards(cards)
    expect(localStorage.getItem('12345_loyalty_cards_all')).not.toBeNull()
  })
})

describe('user isolation', () => {
  it('user A cannot read user B cache', () => {
    mockUserId = 111
    setCachedCards(cards)
    mockUserId = 222
    expect(getCachedCards()).toBeNull()
  })

  it('each user reads their own data for same shopId', () => {
    const cardA = { ...card, stamp_count: 3 }
    const cardB = { ...card, stamp_count: 7 }

    mockUserId = 111
    setCachedCard('shop-1', cardA, shop)
    mockUserId = 222
    setCachedCard('shop-1', cardB, shop)

    mockUserId = 111
    expect(getCachedCard('shop-1')!.data.card.stamp_count).toBe(3)
    mockUserId = 222
    expect(getCachedCard('shop-1')!.data.card.stamp_count).toBe(7)
  })
})

describe('no Telegram user', () => {
  it('getCachedCard returns null when no user', () => {
    mockUserId = null
    setCachedCard('shop-1', card, shop)
    expect(getCachedCard('shop-1')).toBeNull()
  })

  it('getCachedCards returns null when no user', () => {
    mockUserId = null
    setCachedCards(cards)
    expect(getCachedCards()).toBeNull()
  })
})

describe('staleness checks', () => {
  it('isStale returns false for fresh data', () => {
    expect(isStale(Date.now())).toBe(false)
  })
  it('isStale returns true for old data', () => {
    expect(isStale(Date.now() - STALE_THRESHOLD_MS - 1)).toBe(true)
  })
  it('isStatusUntrusted returns false within 30s', () => {
    expect(isStatusUntrusted(Date.now())).toBe(false)
  })
  it('isStatusUntrusted returns true after 30s', () => {
    expect(isStatusUntrusted(Date.now() - STATUS_TRUST_MS - 1)).toBe(true)
  })
})

describe('staleness with fake timers', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('isStale returns false just before threshold', () => {
    vi.setSystemTime(1_000_000)
    const cachedAt = Date.now()
    vi.advanceTimersByTime(STALE_THRESHOLD_MS - 1)
    expect(isStale(cachedAt)).toBe(false)
  })

  it('isStale returns true at threshold + 1', () => {
    vi.setSystemTime(1_000_000)
    const cachedAt = Date.now()
    vi.advanceTimersByTime(STALE_THRESHOLD_MS + 1)
    expect(isStale(cachedAt)).toBe(true)
  })

  it('isStatusUntrusted returns false just before 30s', () => {
    vi.setSystemTime(1_000_000)
    const cachedAt = Date.now()
    vi.advanceTimersByTime(STATUS_TRUST_MS - 1)
    expect(isStatusUntrusted(cachedAt)).toBe(false)
  })

  it('isStatusUntrusted returns true at 30s + 1', () => {
    vi.setSystemTime(1_000_000)
    const cachedAt = Date.now()
    vi.advanceTimersByTime(STATUS_TRUST_MS + 1)
    expect(isStatusUntrusted(cachedAt)).toBe(true)
  })
})

describe('error resilience', () => {
  it('returns null on corrupt JSON', () => {
    localStorage.setItem('12345_loyalty_card_bad', '{corrupt')
    expect(getCachedCard('bad')).toBeNull()
  })

  it('setCachedCard silently ignores QuotaExceededError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })
    expect(() => setCachedCard('shop-1', card, shop)).not.toThrow()
    vi.restoreAllMocks()
  })
})
