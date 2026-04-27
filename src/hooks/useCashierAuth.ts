import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cashier_access_token'

interface CashierAuthState {
  status: 'validating' | 'valid' | 'invalid'
  shopId: string | null
  shopSlug: string
  accessToken: string | null
}

function decodeJwtPayload(token: string): { sub?: string; shopSlug?: string; role?: string } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function getStoredSession(): { token: string; shopId: string; shopSlug: string } | null {
  try {
    const token = sessionStorage.getItem(STORAGE_KEY)
    if (!token) return null
    const payload = decodeJwtPayload(token)
    if (!payload?.sub || !payload?.shopSlug || payload?.role !== 'cashier') return null
    const exp = (payload as { exp?: number }).exp
    if (exp && exp * 1000 < Date.now()) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return { token, shopId: payload.sub, shopSlug: payload.shopSlug }
  } catch {
    return null
  }
}

export function useCashierAuth(): CashierAuthState & { logout: () => void } {
  const params = new URLSearchParams(window.location.search)
  const shopSlug = params.get('shop') ?? ''
  const cashierKey = params.get('key') ?? ''

  const [state, setState] = useState<CashierAuthState>(() => {
    const stored = getStoredSession()
    if (stored && stored.shopSlug === shopSlug) {
      return { status: 'valid', shopId: stored.shopId, shopSlug: stored.shopSlug, accessToken: stored.token }
    }
    return { status: 'validating', shopId: null, shopSlug, accessToken: null }
  })

  useEffect(() => {
    if (state.status !== 'validating') return
    if (!shopSlug || !cashierKey) {
      setState((s) => ({ ...s, status: 'invalid' }))
      return
    }

    const base = import.meta.env.VITE_API_URL as string

    fetch(`${base}/api/v1/cashier/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopSlug, cashierKey }),
    })
      .then(async (res) => {
        if (!res.ok) {
          setState((s) => ({ ...s, status: 'invalid' }))
          return
        }
        const data = await res.json() as { accessToken: string }
        const payload = decodeJwtPayload(data.accessToken)
        if (!payload?.sub) {
          setState((s) => ({ ...s, status: 'invalid' }))
          return
        }
        sessionStorage.setItem(STORAGE_KEY, data.accessToken)
        setState({
          status: 'valid',
          shopId: payload.sub,
          shopSlug: payload.shopSlug ?? shopSlug,
          accessToken: data.accessToken,
        })
      })
      .catch(() => setState((s) => ({ ...s, status: 'invalid' })))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setState({ status: 'invalid', shopId: null, shopSlug, accessToken: null })
  }

  return { ...state, logout }
}
