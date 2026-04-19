/**
 * Score — Stamp delta badge used in transaction history rows.
 * Displays a +/- value in a rounded pill: green for additions, orange-red for removals.
 */

import type { FC } from 'react'

export type ScoreState = 'add' | 'remove'

export interface ScoreProps {
  /** Visual state — determines background color */
  state: ScoreState
  /** Numeric value to display, e.g. 1, 2 */
  value: number
  className?: string
}

const GRADIENT_OVERLAY =
  'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%)'

const STATE_STYLES: Record<ScoreState, { background: string }> = {
  add: {
    background: `${GRADIENT_OVERLAY}, #88E60D`,
  },
  remove: {
    background: `${GRADIENT_OVERLAY}, #FF6640`,
  },
}

export const Score: FC<ScoreProps> = ({ state, value, className = '' }) => {
  const sign = state === 'add' ? '+' : '−'
  const label = `${sign}${Math.abs(value)}`

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-sm font-bold text-white ${className}`}
      style={{ ...STATE_STYLES[state], minWidth: '2rem', minHeight: '1.4rem' }}
      aria-label={`Score: ${label}`}
    >
      {label}
    </div>
  )
}
