import { useState, useEffect } from 'react'
import { apiClient } from '../lib/api-client'
import { getCachedCards, setCachedCards, isStale, isStatusUntrusted } from '../lib/offline-cache'
import { showToast } from '../lib/toast'

export interface CardSummary {
  id: string
  shop_id: string
  shop_name: string
  stamp_count: number
  status: string
  stamp_threshold: number
}

interface CardsState {
  cards: CardSummary[]
  loading: boolean
  error: string | null
  isOffline: boolean
  isStale: boolean
  isStatusStale: boolean
}

export function useCards(): CardsState & { refetch: () => void } {
  const [tick, setTick] = useState(0)
  const [state, setState] = useState<CardsState>(() => {
    const cached = getCachedCards()
    if (cached) {
      return {
        cards: cached.data,
        loading: false,
        error: null,
        isOffline: false,
        isStale: isStale(cached.cachedAt),
        isStatusStale: isStatusUntrusted(cached.cachedAt),
      }
    }
    return {
      cards: [],
      loading: true,
      error: null,
      isOffline: false,
      isStale: false,
      isStatusStale: false,
    }
  })

  useEffect(() => {
    let cancelled = false

    apiClient
      .get<{ cards: CardSummary[] }>('/api/v1/cards')
      .then(({ cards }) => {
        if (cancelled) return
        setCachedCards(cards)
        setState({
          cards,
          loading: false,
          error: null,
          isOffline: false,
          isStale: false,
          isStatusStale: false,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const cached = getCachedCards()
        if (cached) {
          setState({
            cards: cached.data,
            loading: false,
            error: null,
            isOffline: true,
            isStale: isStale(cached.cachedAt),
            isStatusStale: isStatusUntrusted(cached.cachedAt),
          })
          showToast('Using offline data')
        } else {
          const message = err instanceof Error ? err.message : 'CARDS_FETCH_FAILED'
          setState({
            cards: [],
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
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch: () => setTick((t) => t + 1) }
}
