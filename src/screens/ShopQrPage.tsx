import { useState } from 'react'

type PageState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; qrDataUrl: string; deepLink: string; slug: string }
  | { status: 'error'; message: string }

const S = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E121B',
    color: '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#99A0AE',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    border: '1.5px solid #2A3040',
    backgroundColor: '#0E121B',
    color: '#ffffff',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: 14,
    border: 'none',
    backgroundColor: '#88E60D',
    color: '#0E121B',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  btnSecondary: {
    width: '100%',
    padding: '13px',
    borderRadius: 14,
    border: '1.5px solid #2A3040',
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #2A3040',
    borderTopColor: '#88E60D',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
  },
  qrBox: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  deepLink: {
    fontSize: 11,
    color: '#99A0AE',
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
    backgroundColor: '#0E121B',
    borderRadius: 10,
    padding: '10px 12px',
    lineHeight: 1.5,
  },
  errorCard: {
    backgroundColor: '#2D1515',
    border: '1px solid #7B2D2D',
    borderRadius: 14,
    padding: '20px 24px',
    textAlign: 'center' as const,
    maxWidth: 360,
    width: '100%',
  },
}

export function ShopQrPage() {
  const [slug, setSlug] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [pageState, setPageState] = useState<PageState>({ status: 'idle' })

  const base = import.meta.env.VITE_API_URL as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim() || !adminKey.trim()) return

    setPageState({ status: 'loading' })

    try {
      const res = await fetch(
        `${base}/api/v1/shops/slug/${encodeURIComponent(slug.trim())}/qr`,
        { headers: { 'X-Admin-Key': adminKey.trim() } },
      )

      if (res.status === 401) {
        setPageState({ status: 'error', message: 'Неверный admin ключ' })
        return
      }
      if (res.status === 404) {
        setPageState({ status: 'error', message: `Кофейня "${slug}" не найдена` })
        return
      }
      if (!res.ok) {
        setPageState({ status: 'error', message: 'Ошибка сервера. Попробуйте ещё раз.' })
        return
      }

      const data = await res.json() as { qrDataUrl: string; deepLink: string }
      setPageState({ status: 'success', qrDataUrl: data.qrDataUrl, deepLink: data.deepLink, slug: slug.trim() })
    } catch {
      setPageState({ status: 'error', message: 'Нет соединения с сервером' })
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => window.print()

  const handleReset = () => {
    setPageState({ status: 'idle' })
    setCopied(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #88E60D !important; }
        @media print {
          body > *:not(#print-qr) { display: none; }
          #print-qr { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>☕</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>QR-код кофейни</h1>
        <p style={{ fontSize: 13, color: '#99A0AE', margin: '6px 0 0' }}>
          Для размещения на кассе
        </p>
      </div>

      {/* Idle — form */}
      {pageState.status === 'idle' && (
        <form onSubmit={handleSubmit} style={S.card}>
          <div>
            <p style={S.label}>Slug кофейни</p>
            <input
              style={S.input}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="diar-coffee"
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>
          <div>
            <p style={S.label}>Admin ключ</p>
            <input
              style={S.input}
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            style={{ ...S.btn, opacity: slug && adminKey ? 1 : 0.5 }}
            disabled={!slug || !adminKey}
          >
            Получить QR-код
          </button>
        </form>
      )}

      {/* Loading */}
      {pageState.status === 'loading' && (
        <div style={{ textAlign: 'center', color: '#99A0AE' }}>
          <div style={S.spinner} />
          <p style={{ marginTop: 16 }}>Генерируем QR-код…</p>
        </div>
      )}

      {/* Success */}
      {pageState.status === 'success' && (
        <div style={{ ...S.card, alignItems: 'center' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
            {pageState.slug}
          </p>

          {/* QR image */}
          <div style={S.qrBox} id="print-qr">
            <img
              src={pageState.qrDataUrl}
              alt="Shop QR code"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
            />
          </div>

          {/* Deep link */}
          <div style={S.deepLink}>{pageState.deepLink}</div>

          {/* Actions */}
          <button
            style={S.btn}
            onClick={() => handleCopy(pageState.deepLink)}
          >
            {copied ? '✓ Скопировано' : 'Скопировать ссылку'}
          </button>
          <button style={S.btn} onClick={handlePrint}>
            Распечатать QR
          </button>
          <button style={S.btnSecondary} onClick={handleReset}>
            Другая кофейня
          </button>
        </div>
      )}

      {/* Error */}
      {pageState.status === 'error' && (
        <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={S.errorCard}>
            <p style={{ margin: '0 0 4px', fontSize: 32 }}>⚠️</p>
            <p style={{ margin: 0, color: '#FF6B6B', fontWeight: 600, fontSize: 15 }}>
              {pageState.message}
            </p>
          </div>
          <button style={S.btnSecondary} onClick={handleReset}>
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  )
}
