import { getTelegramWebApp } from './telegram'

export function getStartAppParam(): string | null {
  const param = getTelegramWebApp()?.initDataUnsafe?.start_param ?? null
  if (import.meta.env.DEV) {
    console.log('[deep-link] start_param:', param)
  }
  return param
}
