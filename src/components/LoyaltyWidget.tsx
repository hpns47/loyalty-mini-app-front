/**
 * LoyaltyWidget — Full loyalty card widget (416×252px outer / 376×212px inner card).
 * Combines LoyaltyCard (photo area) with a 10-stamp progress track and icon badge.
 * Pass `stampsCollected` (0–10) to drive the progress visualization.
 */

import type { FC } from 'react'
import { BonusState, type BonusStateValue } from './BonusState'
import { LoyaltyCard, type LoyaltyCardState } from './LoyaltyCard'
import { LoyaltyIcon } from './LoyaltyIcon'

export interface LoyaltyWidgetProps {
  /** Number of stamps already collected (0–10) */
  stampsCollected?: number
  /** Total stamps required for a free coffee (default: 10) */
  totalStamps?: number
  /** Shop / brand name shown on the card */
  shopName?: string
  /** Index of the stamp segment to animate (0-based) */
  newlyFilledIndex?: number
  className?: string
}

const TOTAL = 10

function getCardState(collected: number, total: number): LoyaltyCardState {
  if (collected === 0) return 'noPurchases'
  if (collected >= total) return 'bonusEarned'
  return 'waiting'
}

function getStampState(index: number, collected: number, total: number): BonusStateValue {
  if (collected >= total) return 'used'
  if (index < collected - 1) return 'used'
  if (index === collected - 1) return 'current'
  return 'default'
}

export const LoyaltyWidget: FC<LoyaltyWidgetProps> = ({
  stampsCollected = 0,
  totalStamps = TOTAL,
  shopName,
  newlyFilledIndex,
  className = '',
}) => {
  const cardState = getCardState(stampsCollected, totalStamps)
  const remaining = Math.max(0, totalStamps - stampsCollected)
  const isBonusEarned = cardState === 'bonusEarned'

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border ${className}`}
      style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderColor: '#E1E4EA',
        boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top: loyalty card visual */}
      <LoyaltyCard
        state={cardState}
        shopName={shopName}
        stampsRemaining={remaining}
        className="rounded-b-none"
      />

      {/* Bottom: stamp progress track */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* 10 stamp bars */}
        <div className="flex flex-1 items-center gap-1">
          {Array.from({ length: totalStamps }, (_, i) => (
            <BonusState
              key={i}
              state={getStampState(i, stampsCollected, totalStamps)}
              animated={i === newlyFilledIndex}
            />
          ))}
        </div>

        {/* Coffee or gift icon */}
        <LoyaltyIcon
          icon={isBonusEarned ? 'gift' : 'coffee'}
          label={isBonusEarned ? 'Bonus earned' : 'Coffee stamp'}
          className="shrink-0"
        />
      </div>
    </div>
  )
}
