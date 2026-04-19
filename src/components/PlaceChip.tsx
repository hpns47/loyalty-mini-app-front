/**
 * PlaceChip — Shop/place photo card used in the "recently used" section of the home screen.
 * 247×140px card with a background photo, dark radial gradient scrim, shop name, and category chip.
 */

import type { FC } from 'react'
import { Chips } from './Chips'

export interface PlaceChipProps {
  /** Shop / place name */
  name: string
  /** Background photo URL for the place */
  photoUrl?: string
  /** Category label shown on the Chips badge (e.g. "coffee") */
  category?: string
  onClick?: () => void
  className?: string
}

export const PlaceChip: FC<PlaceChipProps> = ({
  name,
  photoUrl,
  category,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-[140px] w-[247px] shrink-0 flex-col justify-end overflow-hidden rounded-[10px] transition-opacity active:opacity-80 ${className}`}
      aria-label={name}
    >
      {/* Background photo */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)' }}
        />
      )}

      {/* Dark radial gradient scrim */}
      <div
        className="absolute inset-0 rounded-[10px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Content overlay */}
      <div className="relative flex w-full items-end justify-between p-3">
        <span className="truncate text-sm font-semibold text-white drop-shadow">{name}</span>
        {category && (
          <Chips
            label={category}
            size="small"
            darkMode
            className="shrink-0"
          />
        )}
      </div>
    </button>
  )
}
