import { useEffect, useState, useMemo } from 'react'
import { useAuth } from './hooks/useAuth'
import { useDeepLink } from './hooks/useDeepLink'
import { useStampHistory } from './hooks/useStampHistory'
import { getTelegramWebApp } from './lib/telegram'
import type { DockTab } from './components/Dock'
import type { ScoreState } from './components/Score'
import { HomeScreen } from './screens/HomeScreen'
import { LoyaltyCardScreen } from './screens/LoyaltyCardScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { QrScanScreen } from './screens/QrScanScreen'
import { QrShowScreen } from './screens/QrShowScreen'
import { CashierPage } from './screens/CashierPage'
import { ShopQrPage } from './screens/ShopQrPage'
import { ErrorBoundary } from './components/ErrorBoundary'

type Screen = 'home' | 'profile' | 'scan' | 'qrShow' | 'loyaltyCard'

const SHOP_QR_RE = /[?&]startapp=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i

function parseShopQr(scanned: string): string | null {
  return SHOP_QR_RE.exec(scanned)?.[1] ?? null
}

function App() {
  const { user, loading } = useAuth()
  const { shopId } = useDeepLink()
  const { history: stampHistory, loading: stampHistoryLoading } = useStampHistory()
  const [screen, setScreen] = useState<Screen>('home')
  const [cardDismissed, setCardDismissed] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)

  const transactions = useMemo(() =>
    stampHistory.map((item) => ({
      description: item.shopName,
      timestamp: new Date(item.addedAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      scoreState: 'add' as ScoreState,
      scoreValue: 1,
    })),
    [stampHistory],
  )

  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.ready()
    tg?.expand()
  }, [])

  const handleTabChange = (tab: DockTab) => {
    if (tab === 'home') setScreen('home')
    else if (tab === 'profile') setScreen('profile')
    else if (tab === 'scan') setScreen('scan')
  }

  if (window.location.pathname === '/cashier') {
    return <CashierPage />
  }

  if (window.location.pathname === '/shop-qr') {
    return <ShopQrPage />
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
      >
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  // Deep-link from Telegram (tg://resolve?start=shop_<id>) takes priority
  if (shopId && !cardDismissed) {
    return (
      <ErrorBoundary key="deeplink">
        <LoyaltyCardScreen shopId={shopId} onBack={() => setCardDismissed(true)} />
      </ErrorBoundary>
    )
  }

  const activeTab: DockTab =
    screen === 'profile' ? 'profile' : screen === 'scan' ? 'scan' : 'home'

  if (screen === 'qrShow') {
    return (
      <ErrorBoundary key="qrShow">
        <QrShowScreen
          userName={user?.first_name}
          activeTab="home"
          onTabChange={handleTabChange}
          onBack={() => setScreen('home')}
        />
      </ErrorBoundary>
    )
  }

  if (screen === 'profile') {
    return (
      <ErrorBoundary key="profile">
        <ProfileScreen
          userName={user?.first_name}
          username={user?.username ?? undefined}
          telegramId={user?.telegram_id}
          transactions={transactions}
          transactionsLoading={stampHistoryLoading}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onShowQr={() => setScreen('qrShow')}
        />
      </ErrorBoundary>
    )
  }

  if (screen === 'scan') {
    return (
      <ErrorBoundary key="scan">
        <QrScanScreen
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onBack={() => setScreen('home')}
          onScanSuccess={(data) => {
            const scannedShopId = parseShopQr(data)
            if (scannedShopId) {
              setSelectedShopId(scannedShopId)
              setScreen('loyaltyCard')
            } else {
              setScreen('home')
            }
          }}
        />
      </ErrorBoundary>
    )
  }

  if (screen === 'loyaltyCard' && selectedShopId) {
    return (
      <ErrorBoundary key="loyaltyCard">
        <LoyaltyCardScreen
          shopId={selectedShopId}
          onBack={() => setScreen('home')}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary key="home">
      <HomeScreen
        userName={user?.first_name}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onQrClick={() => setScreen('qrShow')}
        onShopClick={(id) => { setSelectedShopId(id); setScreen('loyaltyCard') }}
      />
    </ErrorBoundary>
  )
}

export default App
