import { describe, it, expect, afterEach } from 'vitest'
import { getTelegramWebApp, getTelegramUser, getInitData } from '../telegram'
import { cleanupTelegramMock } from '../../test-utils'

afterEach(() => {
  cleanupTelegramMock()
})

describe('getTelegramWebApp', () => {
  it('returns WebApp object when present', () => {
    const webApp = getTelegramWebApp()
    expect(webApp).not.toBeNull()
    expect(webApp.initData).toBe('mock-init-data')
  })

  it('returns null when window.Telegram is undefined', () => {
    ;(window as any).Telegram = undefined
    expect(getTelegramWebApp()).toBeNull()
  })

  it('returns null when WebApp is undefined', () => {
    ;(window as any).Telegram = {}
    expect(getTelegramWebApp()).toBeNull()
  })
})

describe('getTelegramUser', () => {
  it('returns user object when present', () => {
    const user = getTelegramUser()
    expect(user).toEqual({ id: 123456, first_name: 'Test', username: 'testuser' })
  })

  it('returns null when no WebApp', () => {
    ;(window as any).Telegram = undefined
    expect(getTelegramUser()).toBeNull()
  })

  it('returns null when initDataUnsafe has no user', () => {
    ;(window as any).Telegram = { WebApp: { initDataUnsafe: {} } }
    expect(getTelegramUser()).toBeNull()
  })
})

describe('getInitData', () => {
  it('returns initData string when present', () => {
    expect(getInitData()).toBe('mock-init-data')
  })

  it('returns empty string when no WebApp', () => {
    ;(window as any).Telegram = undefined
    expect(getInitData()).toBe('')
  })

  it('returns empty string when initData is undefined', () => {
    ;(window as any).Telegram = { WebApp: {} }
    expect(getInitData()).toBe('')
  })
})
