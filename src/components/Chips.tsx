/**
 * Chips — Pill-shaped label used for category filters and recently used shops.
 * Supports two sizes (big/small), dark/light mode, and focused (selected) state.
 * Focused state adds a visible border around the chip.
 */

import type { ButtonHTMLAttributes, FC } from 'react'

export type ChipsSize = 'big' | 'small'

export interface ChipsProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Text label displayed inside the chip */
  label: string
  /** Chip height — big (30px) or small (20px) */
  size?: ChipsSize
  /** Dark background variant */
  darkMode?: boolean
  /** Selected/active state — adds a border ring */
  focused?: boolean
}

const SIZE_CLASSES: Record<ChipsSize, string> = {
  big: 'h-[30px] px-3 text-[14px]',
  small: 'h-5 px-2 text-[12px]',
}

export const Chips: FC<ChipsProps> = ({
  label,
  size = 'big',
  darkMode = false,
  focused = false,
  className = '',
  ...rest
}) => {
  const bg = darkMode
    ? 'var(--tg-theme-bg-color, #181B25)'
    : 'var(--tg-theme-secondary-bg-color, #F5F7FA)'

  const textColor = darkMode
    ? 'var(--tg-theme-text-color, #F2F5F8)'
    : 'var(--tg-theme-text-color, #181B25)'

  const borderColor = darkMode ? '#2B303B' : '#99A0AE'

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full font-medium uppercase tracking-wider transition-opacity active:opacity-70 ${SIZE_CLASSES[size]} ${className}`}
      style={{
        backgroundColor: bg,
        color: textColor,
        border: focused ? `1px solid ${borderColor}` : '1px solid transparent',
      }}
      {...rest}
    >
      {label}
    </button>
  )
}
