/**
 * QrScanScreen — Camera viewfinder screen for scanning shop QR codes.
 * Shows a dark overlay with a framed scan area, back button, and flash toggle.
 */

import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Dock, type DockTab } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { getTelegramWebApp } from '../lib/telegram'

export interface QrScanScreenProps {
  activeTab?: DockTab
  onTabChange?: (tab: DockTab) => void
  /** Navigate back to the previous screen */
  onBack?: () => void
  /** Called with raw QR data when a code is successfully scanned */
  onScanSuccess?: (data: string) => void
}

export const QrScanScreen: FC<QrScanScreenProps> = ({
  activeTab = 'scan',
  onTabChange,
  onBack,
}) => {
  const [flashOn, setFlashOn] = useState(false)

  // Uses in-screen IconButton for back — hide both Telegram buttons
  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.BackButton?.hide?.()
    tg?.MainButton?.hide?.()
  }, [])

  return (
    <div
      className="relative flex min-h-screen flex-col items-center"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Top bar: back button only */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center px-4">
        <IconButton icon="Back" onClick={onBack} aria-label="Go back" />
      </div>

      {/* Content: instruction → viewfinder → flash */}
      <div className="flex flex-1 flex-col items-center justify-center w-full gap-6">
        {/* Instruction text above viewfinder */}
        <p
          className="text-sm text-center px-8"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          Наведите камеру на QR-код для получения бонусов
        </p>

        {/* Viewfinder 300×300 */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ width: 300, height: 300, backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          {/* Corner bracket markers */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <div
              key={corner}
              className="absolute w-10 h-10"
              style={{
                top: corner.startsWith('t') ? 12 : undefined,
                bottom: corner.startsWith('b') ? 12 : undefined,
                left: corner.endsWith('l') ? 12 : undefined,
                right: corner.endsWith('r') ? 12 : undefined,
                borderColor: '#88E60D',
                borderStyle: 'solid',
                borderTopWidth: corner.startsWith('t') ? 3 : 0,
                borderBottomWidth: corner.startsWith('b') ? 3 : 0,
                borderLeftWidth: corner.endsWith('l') ? 3 : 0,
                borderRightWidth: corner.endsWith('r') ? 3 : 0,
                borderRadius:
                  corner === 'tl'
                    ? '8px 0 0 0'
                    : corner === 'tr'
                      ? '0 8px 0 0'
                      : corner === 'bl'
                        ? '0 0 0 8px'
                        : '0 0 8px 0',
              }}
            />
          ))}

          {/* Scan line */}
          <div
            className="absolute left-6 right-6 h-0.5"
            style={{ backgroundColor: '#88E60D', opacity: 0.7 }}
          />
        </div>

        {/* Flash button below viewfinder */}
        <IconButton
          icon={flashOn ? 'flash' : 'flashinactive'}
          pressed={flashOn}
          onClick={() => setFlashOn((v) => !v)}
          aria-label={flashOn ? 'Turn off flash' : 'Turn on flash'}
        />
      </div>

      {/* Floating bottom dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
