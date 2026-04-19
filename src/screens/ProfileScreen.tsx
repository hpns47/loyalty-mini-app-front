/**
 * ProfileScreen — User profile view showing avatar, name, Telegram ID,
 * a QR code button, and a scrollable transaction history list.
 */

import { useEffect } from 'react'
import type { FC } from 'react'
import { AvatarSample } from '../components/AvatarSample'
import { Dock, type DockTab } from '../components/Dock'
import { IconButton } from '../components/IconButton'
import { SalesRow, type SalesRowProps } from '../components/SalesRow'
import { getTelegramWebApp } from '../lib/telegram'

export interface ProfileScreenProps {
  userName?: string
  userAvatarUrl?: string
  telegramId?: number
  username?: string
  /** Transaction history items */
  transactions?: Omit<SalesRowProps, 'className'>[]
  activeTab?: DockTab
  onTabChange?: (tab: DockTab) => void
  /** Opens the user's personal QR code */
  onShowQr?: () => void
}

export const ProfileScreen: FC<ProfileScreenProps> = ({
  userName = 'Guest',
  userAvatarUrl,
  telegramId,
  username,
  transactions = [],
  activeTab = 'profile',
  onTabChange,
  onShowQr,
}) => {
  // Root screen — hide both Telegram buttons
  useEffect(() => {
    const tg = getTelegramWebApp()
    tg?.BackButton?.hide?.()
    tg?.MainButton?.hide?.()
  }, [])

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--tg-theme-bg-color, #ffffff)' }}
    >
      {/* Profile header: avatar (left) + QR button (right) */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3">
        <AvatarSample src={userAvatarUrl} name={userName} size={44} />
        <IconButton icon="QR" onClick={onShowQr} aria-label="Show my QR code" />
      </div>

      {/* Name + username + Telegram ID */}
      <div className="px-4 pb-4">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--tg-theme-text-color, #0E121B)' }}
        >
          {userName}
        </h1>
        {username && (
          <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}>
            @{username}
          </p>
        )}
        {telegramId != null && (
          <p className="text-sm font-medium" style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}>
            TGID{telegramId}
          </p>
        )}
      </div>

      {/* Transaction history */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 space-y-2">
        {transactions.length > 0 ? (
          <>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--tg-theme-text-color, #0E121B)' }}
            >
              История
            </h2>
            {transactions.map((tx, i) => (
              <SalesRow key={i} {...tx} />
            ))}
          </>
        ) : (
          <div
            className="flex h-32 items-center justify-center rounded-2xl text-sm"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)',
              color: 'var(--tg-theme-hint-color, #99A0AE)',
            }}
          >
            Нет транзакций
          </div>
        )}
      </div>

      {/* Floating bottom dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-130px)] max-w-[270px]">
        <Dock activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
