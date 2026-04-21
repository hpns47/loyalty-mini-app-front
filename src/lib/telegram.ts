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

/**
 * Opens the native Telegram QR scanner popup.
 * callback receives scanned text; return true to close the popup.
 * Returns false if the API is not available (non-Telegram environment).
 */
export function showScanQrPopup(
  hint: string,
  callback: (scanned: string) => boolean,
): boolean {
  const tg = getTelegramWebApp()
  if (!tg?.showScanQrPopup) return false
  tg.showScanQrPopup({ text: hint }, callback)
  return true
}

export function closeScanQrPopup(): void {
  getTelegramWebApp()?.closeScanQrPopup?.()
}
