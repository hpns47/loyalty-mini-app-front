/**
 * Dock — Floating pill-shaped bottom navigation bar with three icon buttons.
 * Uses IconButton atoms for Home, QR scan, and Profile.
 * White pill with border and drop shadow; active tab button shows button-color background.
 */

import type { FC } from 'react'
import { IconButton } from './IconButton'

export type DockTab = 'home' | 'scan' | 'profile'

export interface DockProps {
  activeTab?: DockTab
  onTabChange?: (tab: DockTab) => void
  className?: string
}

const TABS: { id: DockTab; icon: 'Home' | 'qrscan' | 'user'; label: string }[] = [
  { id: 'home', icon: 'Home', label: 'Home' },
  { id: 'scan', icon: 'qrscan', label: 'Scan' },
  { id: 'profile', icon: 'user', label: 'Profile' },
]

export const Dock: FC<DockProps> = ({ activeTab = 'home', onTabChange, className = '' }) => {
  return (
    <nav
      className={`flex items-center justify-between rounded-[88px] border px-4 py-4 ${className}`}
      style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderColor: '#E1E4EA',
        boxShadow: '0px 4px 24px rgba(0,0,0,0.08)',
      }}
      aria-label="Main navigation"
    >
      {TABS.map(({ id, icon, label }) => (
        <IconButton
          key={id}
          icon={icon}
          pressed={activeTab === id}
          aria-label={label}
          aria-current={activeTab === id ? 'page' : undefined}
          onClick={() => onTabChange?.(id)}
        />
      ))}
    </nav>
  )
}
