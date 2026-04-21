import { useState, useEffect } from 'react'
import { apiClient } from '../lib/api-client'

export interface StampHistoryItem {
  shopName: string
  addedAt: string
}

interface StampHistoryState {
  history: StampHistoryItem[]
  loading: boolean
}

export function useStampHistory(): StampHistoryState {
  const [state, setState] = useState<StampHistoryState>({ history: [], loading: true })

  useEffect(() => {
    apiClient
      .get<{ history: StampHistoryItem[] }>('/api/v1/stamps/history')
      .then(({ history }) => setState({ history, loading: false }))
      .catch(() => setState({ history: [], loading: false }))
  }, [])

  return state
}
