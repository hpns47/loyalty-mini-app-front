import { useState, useCallback } from 'react'
import type { FC } from 'react'
import { CashierScanner } from '../components/CashierScanner'
import { useCashierAuth } from '../hooks/useCashierAuth'
import type { StampRedeemResponse } from '../types'

type PageState =
  | { status: 'validating' | 'invalid' | 'scanning' }
  | { status: 'stamp_success'; firstName: string; stampCount: number; stampThreshold: number }
  | { status: 'qr_used' }
  | { status: 'reward_ready'; firstName: string; userId: string }

function decodeJwtSub(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub as string
  } catch {
    return null
  }
}

export const CashierPage: FC = () => {
  const auth = useCashierAuth()
  const [pageState, setPageState] = useState<PageState>({ status: 'validating' })
  const [scanKey, setScanKey] = useState(0)

  // Sync auth status into page state on first transition
  if (auth.status !== 'validating' && pageState.status === 'validating') {
    setPageState({ status: auth.status === 'valid' ? 'scanning' : 'invalid' })
  }

  const base = import.meta.env.VITE_API_URL as string

  const handleScan = useCallback(
    async (qrToken: string) => {
      if (!auth.shopId) return

      const userId = decodeJwtSub(qrToken)

      try {
        const res = await fetch(`${base}/api/v1/stamps/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrToken,
            shopId: auth.shopId,
            cashierKey: auth.cashierKey,
          }),
        })

        if (res.status === 409) {
          setPageState({ status: 'qr_used' })
          setTimeout(() => {
            setPageState({ status: 'scanning' })
            setScanKey((k) => k + 1)
          }, 3000)
          return
        }

        if (!res.ok) {
          setPageState({ status: 'qr_used' })
          setTimeout(() => {
            setPageState({ status: 'scanning' })
            setScanKey((k) => k + 1)
          }, 3000)
          return
        }

        const data = await res.json() as StampRedeemResponse
        const { newStampCount, isRewardReady, userName, stampThreshold } = data.stamp

        if (isRewardReady) {
          setPageState({
            status: 'reward_ready',
            firstName: userName,
            userId: userId ?? '',
          })
        } else {
          setPageState({
            status: 'stamp_success',
            firstName: userName,
            stampCount: newStampCount,
            stampThreshold,
          })
          setTimeout(() => {
            setPageState({ status: 'scanning' })
            setScanKey((k) => k + 1)
          }, 3000)
        }
      } catch {
        setPageState({ status: 'qr_used' })
        setTimeout(() => {
          setPageState({ status: 'scanning' })
          setScanKey((k) => k + 1)
        }, 3000)
      }
    },
    [auth.shopId, auth.cashierKey, base],
  )

  const handleRedeem = useCallback(async () => {
    if (pageState.status !== 'reward_ready' || !auth.shopId) return

    const { userId } = pageState

    try {
      await fetch(`${base}/api/v1/rewards/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          shopId: auth.shopId,
          cashierKey: auth.cashierKey,
        }),
      })
    } catch {
      // Best-effort — reset to scanning regardless
    }

    setPageState({ status: 'scanning' })
    setScanKey((k) => k + 1)
  }, [pageState, auth.shopId, auth.cashierKey, base])

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0E121B',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px 16px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Cashier Scanner</h1>
      </div>

      {/* State machine render */}
      {pageState.status === 'validating' && (
        <div style={{ textAlign: 'center', color: '#99A0AE' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #99A0AE',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ margin: 0 }}>Checking cashier credentials…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {pageState.status === 'invalid' && (
        <div
          style={{
            backgroundColor: '#2D1515',
            border: '1px solid #7B2D2D',
            borderRadius: 12,
            padding: '20px 24px',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          <p style={{ margin: 0, color: '#FF6B6B', fontWeight: 500 }}>
            Invalid cashier key or shop not found
          </p>
        </div>
      )}

      {pageState.status === 'scanning' && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <p style={{ textAlign: 'center', color: '#99A0AE', marginBottom: 16 }}>
            Scan customer QR code
          </p>
          <CashierScanner key={scanKey} onScan={handleScan} />
        </div>
      )}

      {pageState.status === 'stamp_success' && (
        <div
          style={{
            backgroundColor: '#0D2B1A',
            border: '1px solid #1A5C35',
            borderRadius: 16,
            padding: '32px 28px',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#4ADE80' }}>
            Stamp added for {pageState.firstName}!
          </p>
          <p style={{ margin: '8px 0 0', color: '#99A0AE' }}>
            {pageState.stampCount}/{pageState.stampThreshold} stamps
          </p>
        </div>
      )}

      {pageState.status === 'qr_used' && (
        <div
          style={{
            backgroundColor: '#2B2200',
            border: '1px solid #5C4A00',
            borderRadius: 16,
            padding: '32px 28px',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#FACC15' }}>
            QR already scanned
          </p>
        </div>
      )}

      {pageState.status === 'reward_ready' && (
        <div
          style={{
            backgroundColor: '#1A0D2B',
            border: '1px solid #5C1A8C',
            borderRadius: 16,
            padding: '32px 28px',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: '#C084FC' }}>
            {pageState.firstName} has a free coffee!
          </p>
          <p style={{ margin: '0 0 24px', color: '#99A0AE' }}>Redeem?</p>
          <button
            onClick={handleRedeem}
            style={{
              backgroundColor: '#7C3AED',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Redeem Free Coffee
          </button>
        </div>
      )}
    </div>
  )
}
