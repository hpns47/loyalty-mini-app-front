import { useState, useEffect } from 'react'
import { apiClient } from '../lib/api-client'
import { getCachedCard, setCachedCard, isStale, isStatusUntrusted } from '../lib/offline-cache'
import { showToast } from '../lib/toast'
import type { LoyaltyCard, CoffeeShop } from '../types'

type ShopSummary = Pick<CoffeeShop, 'id' | 'name' | 'slug' | 'stamp_threshold'>

interface CardState {
  card: LoyaltyCard | null
  shop: ShopSummary | null
  loading: boolean
  error: string | null
  isOffline: boolean
  isStale: boolean
  isStatusStale: boolean
}

export function useCard(shopId: string): CardState & { refetch: () => void } {
  const [tick, setTick] = useState(0)
  const [state, setState] = useState<CardState>(() => {
    const cached = getCachedCard(shopId)
    if (cached) {
      return {
        card: cached.data.card,
        shop: cached.data.shop,
        loading: false,
        error: null,
        isOffline: false,
        isStale: isStale(cached.cachedAt),
        isStatusStale: isStatusUntrusted(cached.cachedAt),
      }
    }
    return {
      card: null,
      shop: null,
      loading: true,
      error: null,
      isOffline: false,
      isStale: false,
      isStatusStale: false,
    }
  })

  useEffect(() => {
    let cancelled = false

    Promise.all([
      apiClient.get<{ card: LoyaltyCard }>(`/api/v1/cards/${shopId}`).then((r) => r.card),
      apiClient.get<ShopSummary[]>('/api/v1/shops'),
    ])
      .then(([card, shops]) => {
        if (cancelled) return
        const shop = shops.find((s) => s.id === shopId) ?? null
        if (shop) setCachedCard(shopId, card, shop)
        setState({
          card,
          shop,
          loading: false,
          error: null,
          isOffline: false,
          isStale: false,
          isStatusStale: false,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const cached = getCachedCard(shopId)
        if (cached) {
          setState({
            card: cached.data.card,
            shop: cached.data.shop,
            loading: false,
            error: null,
            isOffline: true,
            isStale: isStale(cached.cachedAt),
            isStatusStale: isStatusUntrusted(cached.cachedAt),
          })
          showToast('Using offline data')
        } else {
          const message = err instanceof Error ? err.message : 'CARD_FETCH_FAILED'
          setState({
            card: null,
            shop: null,
            loading: false,
            error: message,
            isOffline: false,
            isStale: false,
            isStatusStale: false,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [shopId, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch: () => setTick((t) => t + 1) }
}
