import { useEffect } from 'react'
import type { FC } from 'react'
import { Dock } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { getTelegramWebApp } from '../lib/telegram'

interface Props {
  shopName: string
  onBack: () => void
}

export const RewardScreen: FC<Props> = ({ shopName, onBack }) => {
  useEffect(() => {
    const tg = getTelegramWebApp()

    // Haptic feedback: success notification on mount
    tg?.HapticFeedback?.notificationOccurred('success')

    // BackButton: show and wire to onBack
    tg?.BackButton?.show()
    tg?.BackButton?.onClick(onBack)

    // MainButton: informational only — shown but disabled
    tg?.MainButton?.setText('Claim at Counter')
    tg?.MainButton?.disable()
    tg?.MainButton?.show()

    return () => {
      tg?.BackButton?.hide()
      tg?.BackButton?.offClick(onBack)
      tg?.MainButton?.hide()
    }
  }, [onBack])

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--tg-theme-bg-color, #ffffff)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <IconButton icon="Back" onClick={onBack} />
        <h1
          className="text-lg font-bold truncate"
          style={{ color: 'var(--tg-theme-text-color, #0E121B)' }}
        >
          {shopName}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 space-y-4">
        <LoyaltyWidget stampsCollected={10} shopName={shopName} />

        <p
          className="text-center text-sm font-medium"
          style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}
        >
          Show this screen to the cashier
        </p>
      </div>

      {/* Floating bottom dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab="home" />
      </div>
    </div>
  )
}
