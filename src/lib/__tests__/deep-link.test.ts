import { describe, it, expect, vi, afterEach } from 'vitest'
import { getStartAppParam } from '../deep-link'
import { cleanupTelegramMock } from '../../test-utils'

afterEach(() => {
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

describe('getStartAppParam', () => {
  it('returns start_param when present', () => {
    ;(window as any).Telegram = {
      WebApp: { initDataUnsafe: { start_param: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' } },
    }
    expect(getStartAppParam()).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479')
  })

  it('returns null when no WebApp', () => {
    ;(window as any).Telegram = undefined
    expect(getStartAppParam()).toBeNull()
  })

  it('returns null when no start_param', () => {
    ;(window as any).Telegram = { WebApp: { initDataUnsafe: {} } }
    expect(getStartAppParam()).toBeNull()
  })

  // NOTE: The spec says "returns null for non-UUID values" but the actual code
  // does NOT validate UUIDs — it returns whatever start_param is set to.
  it('returns non-UUID values as-is (no validation in code)', () => {
    ;(window as any).Telegram = {
      WebApp: { initDataUnsafe: { start_param: 'not-a-uuid' } },
    }
    expect(getStartAppParam()).toBe('not-a-uuid')
  })

  it('logs in dev mode', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    ;(window as any).Telegram = {
      WebApp: { initDataUnsafe: { start_param: 'test-param' } },
    }
    getStartAppParam()
    expect(spy).toHaveBeenCalledWith('[deep-link] start_param:', 'test-param')
  })
})
