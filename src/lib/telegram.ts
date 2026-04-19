export interface TelegramUser {
  id: number
  first_name: string
  username?: string
}

export function getTelegramWebApp() {
  return (window as any).Telegram?.WebApp ?? null
}

export function getTelegramUser(): TelegramUser | null {
  return getTelegramWebApp()?.initDataUnsafe?.user ?? null
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? ''
}
