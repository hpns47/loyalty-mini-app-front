import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { LoyaltyCardScreen } from '../LoyaltyCardScreen'
import {
  mockTelegramWebApp,
  cleanupTelegramMock,
  jsonResponse,
  type TelegramMock,
} from '../../test-utils'

let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

const MOCK_CARD = {
  id: 'card-1',
  user_id: 'u1',
  shop_id: 'shop-1',
  stamp_count: 5,
  status: 'active' as 'active' | 'reward_ready',
  total_stamps_earned: 5,
  created_at: '2026-03-01',
  updated_at: '2026-03-30',
}

const MOCK_SHOPS = [
  { id: 'shop-1', name: 'Bean Bar', slug: 'bean-bar', stamp_threshold: 10 },
]

function setupFetch(card = MOCK_CARD, shops = MOCK_SHOPS) {
  // Order matters: more specific patterns first
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/v1/cards/')) return jsonResponse({ card })
    if (url.includes('/api/v1/shops')) return jsonResponse(shops)
    return new Response('Not Found', { status: 404 })
  }))
}

describe('LoyaltyCardScreen', () => {
  const defaultProps = { shopId: 'shop-1', onBack: vi.fn() }

  it('shows shop name and stamp data after loading', async () => {
    setupFetch()
    render(<LoyaltyCardScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getAllByText('Bean Bar').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows remaining stamps counter', async () => {
    setupFetch()
    render(<LoyaltyCardScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('5 more to go!')).toBeInTheDocument()
    })
  })

  it('delegates to RewardScreen when status is reward_ready', async () => {
    const rewardCard = { ...MOCK_CARD, stamp_count: 10, status: 'reward_ready' as const }
    setupFetch(rewardCard)
    render(<LoyaltyCardScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Show this screen to the cashier')).toBeInTheDocument()
    })
  })

  it('shows normal card when status is active', async () => {
    setupFetch()
    render(<LoyaltyCardScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('5 more to go!')).toBeInTheDocument()
    })
    expect(screen.queryByText('Show this screen to the cashier')).not.toBeInTheDocument()
  })

  it('shows offline indicator when fetch fails with cache', async () => {
    // Prime the cache — key format: ${userId}_loyalty_card_${shopId}
    const cacheKey = `123456_loyalty_card_shop-1`
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: { card: MOCK_CARD, shop: MOCK_SHOPS[0] },
        cachedAt: Date.now(),
      }),
    )
    // 4xx errors don't retry — fast failure path
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/v1/cards/')) return jsonResponse({ error: { code: 'FORBIDDEN' } }, 403)
      if (url.includes('/api/v1/shops')) return jsonResponse({ error: { code: 'FORBIDDEN' } }, 403)
      return new Response('Not Found', { status: 404 })
    }))
    render(<LoyaltyCardScreen {...defaultProps} />)
    await waitFor(() => {
      // apiClient throws ApiError on 4xx, useCard catches and falls back to cache
      expect(screen.getByText('Using offline data')).toBeInTheDocument()
    })
  })

  it('shows BackButton on mount and wires onBack', () => {
    setupFetch()
    render(<LoyaltyCardScreen {...defaultProps} />)
    expect(tg.BackButton.show).toHaveBeenCalled()
    expect(tg.BackButton.onClick).toHaveBeenCalledWith(defaultProps.onBack)
  })

  it('hides MainButton on mount', () => {
    setupFetch()
    render(<LoyaltyCardScreen {...defaultProps} />)
    expect(tg.MainButton.hide).toHaveBeenCalled()
  })

  it('cleans up BackButton on unmount', () => {
    setupFetch()
    const { unmount } = render(<LoyaltyCardScreen {...defaultProps} />)
    unmount()
    expect(tg.BackButton.hide).toHaveBeenCalled()
    expect(tg.BackButton.offClick).toHaveBeenCalledWith(defaultProps.onBack)
  })

  it('shows loading skeleton initially', () => {
    // Never resolve — keeps loading state
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<LoyaltyCardScreen {...defaultProps} />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error state with retry button on fetch failure', async () => {
    // 4xx errors don't retry in apiClient — fast failure
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/v1/cards/')) return jsonResponse({ error: { code: 'NOT_FOUND' } }, 404)
      if (url.includes('/api/v1/shops')) return jsonResponse({ error: { code: 'NOT_FOUND' } }, 404)
      return new Response('Not Found', { status: 404 })
    }))
    render(<LoyaltyCardScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Could not load your card')).toBeInTheDocument()
    })
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })
})
