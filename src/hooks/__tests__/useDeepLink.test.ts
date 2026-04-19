import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDeepLink } from '../useDeepLink'
import { clearTelegramMock } from '../../test-helpers/setup'

function setTelegramStartParam(param?: string) {
  ;(window as any).Telegram = {
    WebApp: {
      initData: 'mock',
      initDataUnsafe: {
        user: { id: 123456, first_name: 'Test', username: 'testuser' },
        ...(param !== undefined ? { start_param: param } : {}),
      },
      themeParams: {},
      ready: () => {},
      expand: () => {},
    },
  }
}

describe('useDeepLink', () => {
  afterEach(() => {
    clearTelegramMock()
  })

  it('with valid UUID in startapp: returns shopId', () => {
    const uuid = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
    setTelegramStartParam(uuid)

    const { result } = renderHook(() => useDeepLink())
    expect(result.current.shopId).toBe(uuid)
  })

  it('with invalid value in startapp: returns null', () => {
    setTelegramStartParam('not-a-uuid')

    const { result } = renderHook(() => useDeepLink())
    expect(result.current.shopId).toBeNull()
  })

  it('without startapp param: returns null', () => {
    setTelegramStartParam() // no start_param

    const { result } = renderHook(() => useDeepLink())
    expect(result.current.shopId).toBeNull()
  })
})
