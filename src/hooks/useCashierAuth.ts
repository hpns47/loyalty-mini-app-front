import { useState, useEffect } from 'react'

interface CashierAuthState {
  status: 'validating' | 'valid' | 'invalid'
  shopId: string | null
  shopSlug: string
  cashierKey: string
}

export function useCashierAuth(): CashierAuthState {
  const params = new URLSearchParams(window.location.search)
  const shopSlug = params.get('shop') ?? ''
  const cashierKey = params.get('key') ?? ''

  const [state, setState] = useState<CashierAuthState>({
    status: 'validating',
    shopId: null,
    shopSlug,
    cashierKey,
  })

  useEffect(() => {
    if (!shopSlug || !cashierKey) {
      setState((s) => ({ ...s, status: 'invalid' }))
      return
    }

    const base = import.meta.env.VITE_API_URL as string

    fetch(`${base}/api/v1/cashier/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopSlug, cashierKey }),
    })
      .then(async (res) => {
        const data = await res.json() as { valid: boolean; shopId: string }
        if (data.valid && data.shopId) {
          setState((s) => ({ ...s, status: 'valid', shopId: data.shopId }))
        } else {
          setState((s) => ({ ...s, status: 'invalid' }))
        }
      })
      .catch(() => {
        setState((s) => ({ ...s, status: 'invalid' }))
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
