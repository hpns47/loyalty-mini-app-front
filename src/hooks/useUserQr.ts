import { useState, useEffect } from 'react'
import { getInitData } from '../lib/telegram'
import type { UserQrResponse } from '../types'

interface UserQrState {
  qrDataUrl: string | null
  expiresAt: number | null
  loading: boolean
  error: string | null
}

export function useUserQr(): UserQrState {
  const [state, setState] = useState<UserQrState>({
    qrDataUrl: null,
    expiresAt: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchQr() {
      setState((s) => ({ ...s, loading: true, error: null }))

      const initData = getInitData()
      if (!initData) {
        setState({ qrDataUrl: null, expiresAt: null, loading: false, error: 'NO_INIT_DATA' })
        return
      }

      const base = import.meta.env.VITE_API_URL as string

      try {
        const res = await fetch(`${base}/api/v1/user/qr`, {
          headers: { 'X-Telegram-Init-Data': initData },
        })
        if (!res.ok) {
          const body = await res.json() as { error: { code: string } }
          throw new Error(body.error?.code ?? 'QR_FETCH_FAILED')
        }
        const data = await res.json() as UserQrResponse
        if (!cancelled) {
          setState({ qrDataUrl: data.qrDataUrl, expiresAt: data.expiresAt, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ qrDataUrl: null, expiresAt: null, loading: false, error: (err as Error).message })
        }
      }
    }

    fetchQr()

    const interval = setInterval(fetchQr, 55_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return state
}
