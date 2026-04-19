/**
 * LoyaltyIcon — Circular icon badge used in the loyalty card section.
 * Renders a 28×28 rounded icon with a green background and white icon inside.
 * Two variants: 'coffee' (still collecting stamps) and 'gift' (bonus earned).
 */

import type { FC } from 'react'

export type LoyaltyIconVariant = 'coffee' | 'gift'

export interface LoyaltyIconProps {
  /** Icon variant to display */
  icon: LoyaltyIconVariant
  /** Accessible label */
  label?: string
  className?: string
}

const CoffeeIcon = () => (
  <path
    d="M18.8389 8.33594C19.4593 8.33594 20.0613 8.57348 20.5107 9.00684C20.9613 9.44131 21.2216 10.0383 21.2217 10.6689V12.6689C21.2217 13.2998 20.9614 13.8975 20.5107 14.332C20.0614 14.7653 19.4592 15.0029 18.8389 15.0029H18.4561V16.0029C18.456 16.9872 18.0507 17.9239 17.3408 18.6084C16.6322 19.2917 15.6784 19.6688 14.6914 19.6689H10.543C9.55598 19.6689 8.60223 19.2916 7.89355 18.6084C7.18368 17.9239 6.77743 16.9872 6.77734 16.0029V10.0029L6.78613 9.83398C6.82634 9.44366 7.00522 9.0824 7.28613 8.81152C7.60587 8.50328 8.03173 8.33594 8.46875 8.33594H18.8389Z"
    fill="white"
    stroke="#6FC500"
    strokeWidth="2"
  />
)

const GiftIcon = () => (
  <>
    <defs>
      <clipPath id="loyalty-icon-gift-clip">
        <rect width="16" height="16" fill="white" transform="translate(6 6)" />
      </clipPath>
    </defs>
    <g clipPath="url(#loyalty-icon-gift-clip)">
      <path
        d="M15.7988 7.00098C16.3956 7.001 16.9822 7.1567 17.499 7.45508C18.0159 7.75352 18.4448 8.18329 18.7432 8.7002C19.0416 9.21712 19.1983 9.80354 19.1982 10.4004C19.1982 10.4669 19.1953 10.5334 19.1914 10.5996H21.5986V13.7998H20.3984V18.7998C20.3984 19.2241 20.2298 19.6316 19.9297 19.9316C19.6297 20.2315 19.2229 20.4003 18.7988 20.4004H9.19824C8.77411 20.4003 8.36737 20.2315 8.06738 19.9316C7.76732 19.6316 7.59863 19.2241 7.59863 18.7998V13.7998H6.39844V10.5996H8.80469C8.78683 10.2955 8.80897 9.98806 8.87402 9.68555C9.0514 8.86121 9.5292 8.13181 10.2139 7.63965C10.8986 7.14749 11.7421 6.92685 12.5801 7.02148C13.0875 7.07881 13.5697 7.25169 13.9961 7.51758C14.1251 7.43683 14.2591 7.36375 14.3984 7.30078C14.8387 7.10194 15.3168 6.99921 15.7998 7L15.7988 7.00098ZM15.7979 10.2002C15.7476 10.2002 15.699 10.2188 15.6621 10.2529C15.6259 10.2865 15.6031 10.3327 15.5986 10.3818V10.5996H15.7988C15.8491 10.5996 15.8976 10.581 15.9346 10.5469C15.9711 10.513 15.9928 10.4665 15.9971 10.417L15.998 10.4004L15.9941 10.3604C15.9864 10.3221 15.9675 10.2868 15.9395 10.2588C15.902 10.2214 15.8517 10.2003 15.7988 10.2002H15.7979ZM12.1943 10.2002C12.1424 10.2 12.0921 10.2199 12.0547 10.2559C12.0173 10.2918 11.9951 10.3408 11.9932 10.3926C11.9912 10.4443 12.0095 10.4946 12.0439 10.5332C12.0777 10.5708 12.1246 10.594 12.1748 10.5986L12.2012 10.5996H12.3984V10.4004C12.3984 10.3526 12.3817 10.3058 12.3506 10.2695C12.3201 10.234 12.2776 10.2109 12.2314 10.2031L12.209 10.2002L12.1943 10.1992V10.2002Z"
        fill="white"
        stroke="#6FC500"
        strokeWidth="2"
      />
    </g>
  </>
)

export const LoyaltyIcon: FC<LoyaltyIconProps> = ({ icon, label, className = '' }) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={label ?? (icon === 'coffee' ? 'Coffee' : 'Gift')}
      role="img"
    >
      {/* Green circular background */}
      <rect width="28" height="28" rx="14" fill="#88E60D" />
      {/* White-to-transparent gradient overlay */}
      <rect
        width="28"
        height="28"
        rx="14"
        fill="url(#loyalty-icon-gradient)"
        fillOpacity="0.1"
      />
      <defs>
        <linearGradient
          id="loyalty-icon-gradient"
          x1="14"
          y1="0"
          x2="14"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {icon === 'coffee' ? <CoffeeIcon /> : <GiftIcon />}
    </svg>
  )
}
