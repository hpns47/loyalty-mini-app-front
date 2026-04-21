import { useState, useEffect, useCallback } from 'react'
import type { FC } from 'react'
import { Dock, type DockTab } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { getTelegramWebApp, showScanQrPopup, closeScanQrPopup } from '../lib/telegram'

export interface QrScanScreenProps {
  activeTab?: DockTab
  onTabChange?: (tab: DockTab) => void
  onBack?: () => void
  /** Called with raw QR data when a code is successfully scanned */
  onScanSuccess?: (data: string) => void
}

export const QrScanScreen: FC<QrScanScreenProps> = ({
  activeTab = 'scan',
  onTabChange,
  onBack,
  onScanSuccess,
}) => {
  const [unsupported, setUnsupported] = useState(false)
  const [devInput, setDevInput] = useState('')

  const openScanner = useCallback(() => {
    const opened = showScanQrPopup('Наведите камеру на QR-код кофейни', (scanned) => {
      onScanSuccess?.(scanned)
      return true
    })
    if (!opened) setUnsupported(true)
  }, [onScanSuccess])

  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.BackButton?.hide?.()
    tg?.MainButton?.hide?.()

    openScanner()

    return () => { closeScanQrPopup() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative flex min-h-screen flex-col items-center"
      style={{ backgroundColor: '#0E121B' }}
    >
      {/* Top bar */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center px-4">
        <IconButton icon="Back" onClick={onBack} aria-label="Go back" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center w-full gap-8 px-8">
        {unsupported ? (
          /* Dev fallback — paste QR URL manually */
          <>
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Telegram QR API недоступен. Вставьте ссылку вручную (dev):
            </p>
            <input
              value={devInput}
              onChange={(e) => setDevInput(e.target.value)}
              placeholder="https://t.me/bot/app?startapp=..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #333',
                backgroundColor: '#1A1F2E',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={() => { if (devInput) { onScanSuccess?.(devInput); onBack?.() } }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                backgroundColor: '#88E60D',
                color: '#0E121B',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Симулировать скан
            </button>
          </>
        ) : (
          /* Telegram context — popup is open, show waiting state */
          <>
            {/* Animated scan icon */}
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                <div
                  key={corner}
                  style={{
                    position: 'absolute',
                    width: 28,
                    height: 28,
                    top: corner.startsWith('t') ? 0 : undefined,
                    bottom: corner.startsWith('b') ? 0 : undefined,
                    left: corner.endsWith('l') ? 0 : undefined,
                    right: corner.endsWith('r') ? 0 : undefined,
                    borderColor: '#88E60D',
                    borderStyle: 'solid',
                    borderTopWidth: corner.startsWith('t') ? 3 : 0,
                    borderBottomWidth: corner.startsWith('b') ? 3 : 0,
                    borderLeftWidth: corner.endsWith('l') ? 3 : 0,
                    borderRightWidth: corner.endsWith('r') ? 3 : 0,
                    borderRadius:
                      corner === 'tl' ? '6px 0 0 0'
                      : corner === 'tr' ? '0 6px 0 0'
                      : corner === 'bl' ? '0 0 0 6px'
                      : '0 0 6px 0',
                  }}
                />
              ))}
            </div>

            <div className="text-center space-y-2">
              <p style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, margin: 0 }}>
                Откройте сканер
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
                Наведите камеру на QR-код кофейни
              </p>
            </div>

            {/* Re-open button in case user accidentally dismissed the popup */}
            <button
              onClick={openScanner}
              style={{
                padding: '13px 32px',
                borderRadius: 14,
                backgroundColor: '#88E60D',
                color: '#0E121B',
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Сканировать QR
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
