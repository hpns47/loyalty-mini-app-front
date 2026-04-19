/**
 * BonusState — Single stamp progress bar segment used in the loyalty card track.
 * Renders as a small pill (~4px tall) with state-based color and optional glow shadow.
 * Four states map to the loyalty progress stages: empty, counted, active, and bonus earned.
 */

import type { CSSProperties, FC } from 'react'

export type BonusStateValue = 'default' | 'used' | 'current' | 'bonus'

export interface BonusStateProps {
  /** Visual state of this stamp segment */
  state: BonusStateValue
  /** When true, plays a scale-pop animation on mount */
  animated?: boolean
  className?: string
}

const GRADIENT_OVERLAY =
  'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%)'

const STATE_STYLES: Record<BonusStateValue, CSSProperties> = {
  default: {
    backgroundColor: '#CDCDCD',
  },
  used: {
    background: `${GRADIENT_OVERLAY}, #FFD9AE`,
  },
  current: {
    background: `${GRADIENT_OVERLAY}, #FFB35C`,
    boxShadow: '0px 2px 4px rgba(255, 179, 92, 0.25)',
  },
  bonus: {
    background: `${GRADIENT_OVERLAY}, #88E70D`,
    boxShadow: '0px 2px 4px rgba(136, 231, 13, 0.25)',
  },
}

export const BonusState: FC<BonusStateProps> = ({ state, animated, className = '' }) => {
  const style: CSSProperties = {
    ...STATE_STYLES[state],
    ...(animated ? { animation: 'stamp-pop 300ms ease-out forwards' } : {}),
  }

  return (
    <div
      className={`h-1 flex-1 rounded-full ${className}`}
      style={style}
      aria-label={`Stamp: ${state}`}
    />
  )
}
