/**
 * LoyaltyCard — The visual card section of the loyalty widget (376×158px).
 * Shows shop name, remaining stamps count, and a decorative background graphic.
 * State drives the background: default gray, green radial glow when bonus earned.
 */

import type { FC } from 'react'

export type LoyaltyCardState = 'waiting' | 'bonusEarned' | 'noPurchases'

export interface LoyaltyCardProps {
  /** Current card visual state */
  state?: LoyaltyCardState
  /** Shop / brand name displayed on the card */
  shopName?: string
  /** Number of stamps remaining until next free coffee (0 when bonus earned) */
  stampsRemaining?: number
  className?: string
}

/** Decorative stamp/receipt graphic — shared across all card states */
const CardDecoration: FC = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 376 158"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M350.011 48.7823L352.836 49.5378C354.338 49.937 355.649 50.8566 356.536 52.1323C357.422 53.4081 357.827 54.9572 357.677 56.5032L355.115 82.9511C355.023 83.8979 354.726 84.8132 354.245 85.6337C353.763 86.4541 353.109 87.16 352.327 87.7022C351.545 88.2443 350.654 88.6099 349.716 88.7734C348.779 88.9369 347.817 88.8944 346.897 88.649L337.131 86.0369L300.469 192.035C299.926 193.601 298.81 194.903 297.345 195.679C295.881 196.455 294.176 196.648 292.575 196.219L203.094 172.287C201.489 171.862 200.106 170.845 199.222 169.44C198.338 168.036 198.021 166.348 198.334 164.719L219.567 54.5944L209.839 51.9925C208.919 51.7462 208.065 51.3028 207.334 50.6932C206.604 50.0835 206.015 49.3223 205.608 48.4622C205.202 47.6022 204.987 46.664 204.98 45.7128C204.973 44.7617 205.173 43.8204 205.567 42.9543L216.564 18.7627C217.207 17.3483 218.331 16.2081 219.737 15.5454C221.143 14.8827 222.738 14.7406 224.239 15.1444L227.013 15.8864L230.646 -3.00341C230.815 -3.88789 231.166 -4.72792 231.675 -5.47107C232.184 -6.21421 232.84 -6.84452 233.604 -7.32263C234.368 -7.80075 235.222 -8.11641 236.113 -8.24991C237.004 -8.38342 237.913 -8.3319 238.783 -8.09857L351.8 22.1278C352.671 22.36 353.484 22.7692 354.189 23.3297C354.895 23.8902 355.477 24.5899 355.899 25.3853C356.322 26.1807 356.576 27.0546 356.646 27.9525C356.715 28.8504 356.599 29.753 356.304 30.604L350.011 48.7823ZM337.319 45.3877L341.608 32.9684L242.196 6.38058L239.706 19.281L337.319 45.3877ZM222.045 41.6906L342.814 73.9903L344.088 60.7646L226.207 29.2374L220.702 41.3315L222.045 41.6906ZM232.26 57.989L212.374 161.202L290.075 181.984L324.426 82.6389L232.26 57.989Z"
      fill="#E1E4EA"
    />
    {/* Perforated edge cutouts */}
    <path
      d="M234 133.791V109.54H258.982V133.791H234ZM234 64.7116V40.4605H258.982V64.7116H234Z"
      fill="#E1E4EA"
    />
  </svg>
)

export const LoyaltyCard: FC<LoyaltyCardProps> = ({
  state = 'waiting',
  shopName,
  stampsRemaining,
  className = '',
}) => {
  const isBonusEarned = state === 'bonusEarned'
  const isNoPurchases = state === 'noPurchases'

  return (
    <div
      className={`relative h-[158px] w-full overflow-hidden rounded-2xl ${className}`}
      style={{ backgroundColor: '#F2F5F8' }}
    >
      {/* Green radial glow — bonus earned state */}
      {isBonusEarned && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(ellipse at 50% 120%, #88E60D 0%, transparent 70%)',
            opacity: 0.25,
          }}
        />
      )}

      {/* Decorative stamp graphic */}
      <CardDecoration />

      {/* Card content */}
      <div className="relative flex h-full flex-col justify-between p-4">
        {/* Top: shop name / status label */}
        <div>
          {shopName && (
            <span className="text-xs font-semibold uppercase tracking-widest text-[#525866]">
              {shopName}
            </span>
          )}
        </div>

        {/* Bottom: stamp count message */}
        <div>
          {isBonusEarned ? (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#525866]">
                Вам доступен бесплатный
              </p>
              <p className="text-[32px] font-semibold uppercase leading-none text-[#0D111B]">
                1 кофе на выбор
              </p>
            </div>
          ) : isNoPurchases ? (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#525866]">
                Вы ещё не состоите в программе лояльности
              </p>
              <p className="text-2xl font-semibold uppercase text-[#0D111B]">
                Добавить заведение
              </p>
            </div>
          ) : stampsRemaining !== undefined ? (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#525866]">
                До бесплатного бонуса осталось
              </p>
              <p className="text-[32px] font-semibold uppercase leading-none text-[#0D111B]">
                {stampsRemaining} кофе
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
