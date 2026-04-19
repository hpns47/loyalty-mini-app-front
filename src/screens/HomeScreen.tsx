/**
 * HomeScreen — Main hub screen showing a greeting, active loyalty widget,
 * category filter chips, and a horizontal list of nearby/recent shops.
 */

import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { AvatarSample } from '../components/AvatarSample'
import { Chips } from '../components/Chips'
import { Dock, type DockTab } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { PlaceChip } from '../components/PlaceChip'
import { CardSkeleton, ListSkeleton } from '../components/Skeleton'
import { getTelegramWebApp } from '../lib/telegram'
import { useCards } from '../hooks/useCards'

export interface HomeShop {
  id: string
  name: string
  photoUrl?: string
  category?: string
  stampsCollected?: number
}

export interface HomeScreenProps {
  /** User's display name */
  userName?: string
  /** User's avatar photo URL */
  userAvatarUrl?: string
  /** Currently active shop (shown in loyalty widget) */
  activeShop?: HomeShop
  /** List of shops to display as PlaceChip cards */
  shops?: HomeShop[]
  /** Currently active dock tab */
  activeTab?: DockTab
  onTabChange?: (tab: DockTab) => void
  /** Called when a shop PlaceChip is tapped */
  onShopClick?: (shopId: string) => void
  /** Called when the QR icon button in the header is tapped */
  onQrClick?: () => void
}

const CATEGORIES = ['Все', 'Кофе', 'Еда', 'Чай']

export const HomeScreen: FC<HomeScreenProps> = ({
  userName = 'Guest',
  userAvatarUrl,
  activeTab = 'home',
  onTabChange,
  onShopClick,
  onQrClick,
}) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const { cards, loading, error, refetch } = useCards()

  // Root screen — hide both Telegram buttons
  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.BackButton?.hide?.()
    tg?.MainButton?.hide?.()
  }, [])

  const displayShops = cards.map((c) => ({
    id: c.shop_id,
    name: c.shop_name,
    stampsCollected: c.stamp_count,
  }))
  const activeCard = cards.find((c) => c.status === 'reward_ready') ?? cards[0]
  const displayActiveShop = activeCard
    ? { id: activeCard.shop_id, name: activeCard.shop_name, stampsCollected: activeCard.stamp_count }
    : undefined

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--tg-theme-bg-color, #ffffff)' }}
    >
      {/* Header: greeting + avatar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}>
            Добро пожаловать
          </p>
          <h1
            className="text-lg font-bold"
            style={{ color: 'var(--tg-theme-text-color, #0E121B)' }}
          >
            {userName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon="QR" onClick={onQrClick} aria-label="Show my QR code" />
          <AvatarSample name={userName} src={userAvatarUrl} />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 space-y-5">
        {/* Loading skeletons */}
        {loading && (
          <>
            <CardSkeleton />
            <ListSkeleton count={3} />
          </>
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
              Could not load shops
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

        {/* Success state */}
        {!loading && !error && (
          <>
            {/* Active loyalty widget */}
            {displayActiveShop && (
              <LoyaltyWidget
                shopName={displayActiveShop.name}
                stampsCollected={displayActiveShop.stampsCollected ?? 0}
              />
            )}

            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map((cat) => (
                <Chips
                  key={cat}
                  label={cat}
                  size="big"
                  focused={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>

            {/* Shops horizontal scroll */}
            {displayShops.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {displayShops.map((shop) => (
                  <PlaceChip
                    key={shop.id}
                    name={shop.name}
                    onClick={() => onShopClick?.(shop.id)}
                  />
                ))}
              </div>
            ) : (
              <div
                className="flex h-32 items-center justify-center rounded-2xl text-sm"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)',
                  color: 'var(--tg-theme-hint-color, #99A0AE)',
                }}
              >
                Нет заведений
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating bottom dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
