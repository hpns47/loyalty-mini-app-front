import { getTelegramUser } from './telegram'
import type { LoyaltyCard, CoffeeShop } from '../types'

type ShopSummary = Pick<CoffeeShop, 'id' | 'name' | 'slug' | 'stamp_threshold'>

export interface CacheEntry<T> {
  data: T
  cachedAt: number
}

export const STALE_THRESHOLD_MS = 5 * 60 * 1000
export const STATUS_TRUST_MS = 30 * 1000

function getUserPrefix(): string | null {
  const user = getTelegramUser()
  return user ? String(user.id) : null
}

function readEntry<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

function writeEntry<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }))
  } catch {
    // QuotaExceededError or restricted storage — silently ignore
  }
}

export function getCachedCard(
  shopId: string,
): CacheEntry<{ card: LoyaltyCard; shop: ShopSummary }> | null {
  const prefix = getUserPrefix()
  if (!prefix) return null
  return readEntry(`${prefix}_loyalty_card_${shopId}`)
}

export function setCachedCard(
  shopId: string,
  card: LoyaltyCard,
  shop: ShopSummary,
): void {
  const prefix = getUserPrefix()
  if (!prefix) return
  writeEntry(`${prefix}_loyalty_card_${shopId}`, { card, shop })
}

export function getCachedCards(): CacheEntry<import('../hooks/useCards').CardSummary[]> | null {
  const prefix = getUserPrefix()
  if (!prefix) return null
  return readEntry(`${prefix}_loyalty_cards_all`)
}

export function setCachedCards(cards: import('../hooks/useCards').CardSummary[]): void {
  const prefix = getUserPrefix()
  if (!prefix) return
  writeEntry(`${prefix}_loyalty_cards_all`, cards)
}

export function isStale(cachedAt: number): boolean {
  return Date.now() - cachedAt > STALE_THRESHOLD_MS
}

export function isStatusUntrusted(cachedAt: number): boolean {
  return Date.now() - cachedAt > STATUS_TRUST_MS
}
