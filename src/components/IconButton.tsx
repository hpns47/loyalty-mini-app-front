/**
 * IconButton — Circular 44px action button used in navigation, QR screens, and toolbars.
 * White background with a subtle drop shadow; icon color adapts to the Telegram theme.
 * Supports 7 icon variants and a pressed (active) visual state.
 */

import type { ButtonHTMLAttributes, FC } from 'react'

export type IconButtonIcon =
  | 'QR'
  | 'flash'
  | 'flashinactive'
  | 'Back'
  | 'Home'
  | 'user'
  | 'qrscan'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display */
  icon: IconButtonIcon
  /** Pressed / active visual state */
  pressed?: boolean
}

// Icon paths are centered within a 52×52 viewBox (44px circle + shadow bleed)
const ICON_PATHS: Record<IconButtonIcon, JSX.Element> = {
  QR: (
    <path
      d="M30.7992 28.0031V26.8031H27.1992V23.2031H30.7992V25.6031H33.1992V28.0031H31.9992V30.4031H29.5992V32.8031H27.1992V29.2031H29.5992V28.0031H30.7992ZM36.7992 32.8031H31.9992V30.4031H34.3992V28.0031H36.7992V32.8031ZM15.1992 11.2031H24.7992V20.8031H15.1992V11.2031ZM17.5992 13.6031V18.4031H22.3992V13.6031H17.5992ZM27.1992 11.2031H36.7992V20.8031H27.1992V11.2031ZM29.5992 13.6031V18.4031H34.3992V13.6031H29.5992ZM15.1992 23.2031H24.7992V32.8031H15.1992V23.2031ZM17.5992 25.6031V30.4031H22.3992V25.6031H17.5992ZM33.1992 23.2031H36.7992V25.6031H33.1992V23.2031ZM18.7992 14.8031H21.1992V17.2031H18.7992V14.8031ZM18.7992 26.8031H21.1992V29.2031H18.7992V26.8031ZM30.7992 14.8031H33.1992V17.2031H30.7992V14.8031Z"
      fill="currentColor"
    />
  ),
  flash: (
    <path
      d="M27.1984 19.5969H35.5984L24.7984 35.1969V24.3969H16.3984L27.1984 8.79688V19.5969Z"
      fill="currentColor"
    />
  ),
  flashinactive: (
    <path
      d="M27.1984 18.4016H36.7984L24.7984 36.4016V25.6016H16.3984L27.1984 7.60156V18.4016ZM24.7984 20.8016V16.2656L20.6368 23.2016H27.1984V28.4744L32.314 20.8016H24.7984Z"
      fill="currentColor"
    />
  ),
  Back: (
    <path
      d="M22.7256 21.9962L28.6656 27.9362L26.9688 29.633L19.332 21.9962L26.9688 14.3594L28.6656 16.0562L22.7256 21.9962Z"
      fill="currentColor"
    />
  ),
  Home: (
    <path
      d="M34.7766 29.7972C34.7766 30.0558 34.6738 30.3038 34.491 30.4866C34.3081 30.6695 34.0602 30.7722 33.8016 30.7722H18.2016C17.943 30.7722 17.695 30.6695 17.5121 30.4866C17.3293 30.3038 17.2266 30.0558 17.2266 29.7972V19.5499C17.2265 19.4014 17.2603 19.2547 17.3255 19.1212C17.3908 18.9877 17.4856 18.8709 17.6029 18.7797L25.4029 12.7132C25.5741 12.5801 25.7847 12.5078 26.0016 12.5078C26.2184 12.5078 26.4291 12.5801 26.6002 12.7132L34.4002 18.7797C34.5175 18.8709 34.6124 18.9877 34.6776 19.1212C34.7428 19.2547 34.7767 19.4014 34.7766 19.5499V29.7972ZM32.8266 28.8222V20.0257L26.0016 14.7178L19.1766 20.0257V28.8222H32.8266Z"
      fill="currentColor"
    />
  ),
  user: (
    <path
      d="M18.1992 31.7484C18.1992 29.6797 19.021 27.6958 20.4838 26.233C21.9466 24.7702 23.9305 23.9484 25.9992 23.9484C28.0679 23.9484 30.0519 24.7702 31.5147 26.233C32.9774 27.6958 33.7992 29.6797 33.7992 31.7484H31.8492C31.8492 30.1969 31.2329 28.709 30.1358 27.6119C29.0387 26.5148 27.5507 25.8984 25.9992 25.8984C24.4477 25.8984 22.9597 26.5148 21.8626 27.6119C20.7656 28.709 20.1492 30.1969 20.1492 31.7484H18.1992ZM25.9992 22.9734C22.7671 22.9734 20.1492 20.3556 20.1492 17.1234C20.1492 13.8913 22.7671 11.2734 25.9992 11.2734C29.2313 11.2734 31.8492 13.8913 31.8492 17.1234C31.8492 20.3556 29.2313 22.9734 25.9992 22.9734ZM25.9992 21.0234C28.154 21.0234 29.8992 19.2782 29.8992 17.1234C29.8992 14.9687 28.154 13.2234 25.9992 13.2234C23.8445 13.2234 22.0992 14.9687 22.0992 17.1234C22.0992 19.2782 23.8445 21.0234 25.9992 21.0234Z"
      fill="currentColor"
    />
  ),
  qrscan: (
    <path
      d="M34.7766 25.9016V30.7766H17.2266V25.9016H19.1766V28.8266H32.8266V25.9016H34.7766ZM17.2266 21.0266H34.7766V22.9766H17.2266V21.0266ZM34.7766 18.1016H32.8266V15.1766H19.1766V18.1016H17.2266V13.2266H34.7766V18.1016Z"
      fill="currentColor"
    />
  ),
}

const ARIA_LABELS: Record<IconButtonIcon, string> = {
  QR: 'Show QR code',
  flash: 'Flashlight on',
  flashinactive: 'Flashlight off',
  Back: 'Go back',
  Home: 'Home',
  user: 'Profile',
  qrscan: 'Scan QR code',
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  pressed = false,
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? ARIA_LABELS[icon]}
      aria-pressed={pressed}
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 ${className}`}
      style={{
        backgroundColor: pressed ? '#c9cfd8' : '#ffffff',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.05)',
        color: '#0d111b',
      }}
      {...rest}
    >
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {ICON_PATHS[icon]}
      </svg>
    </button>
  )
}
