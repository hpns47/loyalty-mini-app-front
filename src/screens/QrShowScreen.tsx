/**
 * QrShowScreen — Displays the user's personal QR code for stamp collection.
 * Fetches a short-lived JWT QR from the API and auto-refreshes every 55 seconds.
 */

import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Dock, type DockTab } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { ShopQrCode } from '../components/ShopQrCode'
import { getTelegramWebApp } from '../lib/telegram'
import { useUserQr } from '../hooks/useUserQr'

export interface QrShowScreenProps {
  userName?: string
  activeTab?: DockTab
  onTabChange?: (tab: DockTab) => void
  onBack?: () => void
}

export const QrShowScreen: FC<QrShowScreenProps> = ({
  userName = '',
  activeTab = 'home',
  onTabChange,
  onBack,
}) => {
  const { qrDataUrl, expiresAt, loading } = useUserQr()
  const [countdown, setCountdown] = useState<number>(60)

  // Countdown timer — updates every second based on expiresAt
  useEffect(() => {
    if (!expiresAt) return

    const tick = () => {
      const remaining = expiresAt - Math.floor(Date.now() / 1000)
      setCountdown(Math.max(0, remaining))
    }

    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [expiresAt])

  // Telegram MainButton + BackButton
  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.BackButton?.hide?.()
    tg?.MainButton?.setText('Показать кассиру')
    tg?.MainButton?.disable?.()
    tg?.MainButton?.show?.()

    return () => {
      tg?.MainButton?.hide?.()
    }
  }, [])

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--tg-theme-bg-color, #ffffff)' }}
    >
      {/* Top bar */}
      <div className="flex items-center px-4 pt-6 pb-4">
        <IconButton icon="Back" onClick={onBack} aria-label="Go back" />
        <h1
          className="ml-3 text-base font-semibold"
          style={{ color: 'var(--tg-theme-text-color, #0E121B)' }}
        >
          Мой QR-код
        </h1>
      </div>

      {/* QR code section, vertically centered */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-28">
        {/* Instruction text above QR */}
        <p
          className="text-sm text-center"
          style={{ color: 'var(--tg-theme-text-color, #0D111B)' }}
        >
          Предъявите QR-код кассиру для получения бонусов
        </p>

        {/* QR container: 336×338 white card */}
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 336, height: 338, backgroundColor: '#ffffff' }}
        >
          {loading || !qrDataUrl ? (
            <div
              className="flex h-56 w-56 items-center justify-center rounded-2xl"
              style={{ backgroundColor: '#E1E4EA' }}
            >
              <span className="text-sm" style={{ color: '#99A0AE' }}>
                {loading ? 'Загрузка...' : 'QR не доступен'}
              </span>
            </div>
          ) : (
            <ShopQrCode shopName={userName} qrDataUrl={qrDataUrl} />
          )}
        </div>

        {/* Countdown */}
        {!loading && qrDataUrl && (
          <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}>
            Обновится через {countdown}с
          </p>
        )}
      </div>

      {/* Floating bottom dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
