/**
 * SalesRow — Transaction history row used in the profile screen.
 * Shows a stamp event description + timestamp on the left and a Score badge on the right.
 * Rounded card style: #F2F5F8 background, 375×67px.
 */

import type { FC } from 'react'
import { Score, type ScoreState } from './Score'

export interface SalesRowProps {
  /** Transaction description, e.g. "Получение бонуса" */
  description: string
  /** Formatted date/time string, e.g. "01.01.2026 18:45" */
  timestamp: string
  /** Score badge state */
  scoreState: ScoreState
  /** Score numeric value */
  scoreValue: number
  className?: string
}

export const SalesRow: FC<SalesRowProps> = ({
  description,
  timestamp,
  scoreState,
  scoreValue,
  className = '',
}) => {
  return (
    <div
      className={`flex w-full items-center justify-between rounded-2xl px-2.5 py-3 ${className}`}
      style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)', minHeight: '67px' }}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className="truncate text-base font-medium"
          style={{ color: '#000000' }}
        >
          {description}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: '#787878' }}
        >
          {timestamp}
        </span>
      </div>

      <Score state={scoreState} value={scoreValue} className="ml-3 shrink-0" />
    </div>
  )
}
