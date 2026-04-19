import { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { Dock } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { getTelegramWebApp } from '../lib/telegram'
import { useCard } from '../hooks/useCard'
import { CardSkeleton } from '../components/Skeleton'
import { RewardScreen } from './RewardScreen'

interface Props {
  shopId: string
  onBack: () => void
}

export const LoyaltyCardScreen: FC<Props> = ({ shopId, onBack }) => {
  const { card, shop, loading, error, refetch, isOffline, isStale, isStatusStale } = useCard(shopId)
  const prevStampCount = useRef<number | null>(null)
  const [newlyFilledIndex, setNewlyFilledIndex] = useState<number | null>(null)

  // BackButton → navigates home; MainButton hidden
  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.BackButton?.show?.()
    tg?.BackButton?.onClick?.(onBack)
    tg?.MainButton?.hide?.()

    return () => {
      tg?.BackButton?.hide?.()
      tg?.BackButton?.offClick?.(onBack)
    }
  }, [onBack])

  // Detect stamp increase → animate + haptic
  useEffect(() => {
    if (!card) return

    if (prevStampCount.current !== null && card.stamp_count > prevStampCount.current) {
      const index = card.stamp_count - 1
      setNewlyFilledIndex(index)
      getTelegramWebApp()?.HapticFeedback?.impactOccurred?.('medium')
      const timer = setTimeout(() => setNewlyFilledIndex(null), 350)
      prevStampCount.current = card.stamp_count
      return () => clearTimeout(timer)
    }

    prevStampCount.current = card.stamp_count
  }, [card?.stamp_count]) // eslint-disable-line react-hooks/exhaustive-deps

  // Delegate to RewardScreen — it manages its own MainButton/BackButton
  if (!loading && !error && card && shop && card.status === 'reward_ready' && !isStatusStale) {
    return <RewardScreen shopName={shop.name} onBack={onBack} />
  }

  const remaining = card && shop ? Math.max(0, shop.stamp_threshold - card.stamp_count) : 0

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
          {shop?.name ?? 'Loyalty Card'}
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 space-y-4">
        {/* Loading skeleton */}
        {loading && (
          <CardSkeleton />
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl p-8 gap-3"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)' }}
          >
            <p
              className="text-sm text-center"
              style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}
            >
              Could not load your card
            </p>
            <button
              onClick={refetch}
              className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
              style={{ backgroundColor: 'var(--tg-theme-button-color, #3390EC)' }}
            >
              Try again
            </button>
          </div>
        )}

        {isOffline && (
          <div
            className="rounded-xl px-4 py-2 text-center text-xs font-medium"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)',
              color: 'var(--tg-theme-hint-color, #99A0AE)',
            }}
          >
            Using offline data
          </div>
        )}

        {/* Success state */}
        {!loading && !error && card && shop && (
          <>
            <LoyaltyWidget
              stampsCollected={card.stamp_count}
              totalStamps={shop.stamp_threshold}
              shopName={shop.name}
              newlyFilledIndex={newlyFilledIndex ?? undefined}
            />
            <p
              className="text-center text-sm"
              style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}
            >
              {remaining} more to go!
            </p>
            {isStale && (
              <p
                className="text-center text-xs"
                style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}
              >
                (possibly outdated)
              </p>
            )}
          </>
        )}
      </div>

      {/* Floating bottom dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab="home" />
      </div>
    </div>
  )
}
