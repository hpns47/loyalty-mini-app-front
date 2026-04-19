/**
 * AvatarSample — Circular user avatar, 44×44px.
 * Renders a photo with a circular clip; falls back to initials on error.
 */

import type { FC } from 'react'

export interface AvatarSampleProps {
  /** Image URL for the avatar */
  src?: string
  /** User's display name — used to generate initials fallback */
  name?: string
  /** Size override in px (default: 44) */
  size?: number
  className?: string
}

function getInitials(name = ''): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

export const AvatarSample: FC<AvatarSampleProps> = ({
  src,
  name = '',
  size = 44,
  className = '',
}) => {
  const initials = getInitials(name)
  const style = { width: size, height: size, minWidth: size }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`rounded-full object-cover ${className}`}
        style={style}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-sm font-semibold ${className}`}
      style={{
        ...style,
        backgroundColor: 'var(--tg-theme-button-color, #0E121B)',
        color: 'var(--tg-theme-button-text-color, #ffffff)',
      }}
      aria-label={name || 'User avatar'}
    >
      {initials || '?'}
    </div>
  )
}
