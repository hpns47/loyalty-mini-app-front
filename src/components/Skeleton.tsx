import type { FC } from 'react'

const PULSE_BG = 'var(--tg-theme-secondary-bg-color, #F2F5F8)'

/**
 * CardSkeleton — mimics LoyaltyWidget shape (card photo area + stamp progress track).
 */
export const CardSkeleton: FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`w-full animate-pulse overflow-hidden rounded-2xl border ${className}`}
    style={{ borderColor: '#E1E4EA' }}
  >
    {/* Card photo area */}
    <div className="h-[158px] w-full" style={{ backgroundColor: PULSE_BG }} />
    {/* Stamp progress track */}
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ backgroundColor: PULSE_BG }}
          />
        ))}
      </div>
      <div
        className="h-8 w-8 shrink-0 rounded-full"
        style={{ backgroundColor: PULSE_BG }}
      />
    </div>
  </div>
)

/**
 * ListSkeleton — mimics PlaceChip horizontal row (247×140px cards).
 */
export const ListSkeleton: FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="h-[140px] w-[247px] shrink-0 animate-pulse rounded-[10px]"
        style={{ backgroundColor: PULSE_BG }}
      />
    ))}
  </div>
)
