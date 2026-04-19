import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCashierAuth } from '../useCashierAuth'
import { assertApiRunning } from '../../test-helpers/setup'
import { seedTestShop, cleanupTestShop, TEST_SHOP } from './seed'

const WAIT_OPTS = { timeout: 10_000 }

beforeAll(async () => {
  await assertApiRunning()
  await seedTestShop()
}, 15_000)

afterAll(async () => {
  await cleanupTestShop()
})

/** Set window.location.search to simulate URL query params */
function setLocationSearch(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search: qs ? `?${qs}` : '' },
    writable: true,
  })
}

describe('useCashierAuth', () => {
  beforeEach(() => {
    setLocationSearch({})
  })

  it('parses shop and key from URL and calls real validation', async () => {
    setLocationSearch({ shop: TEST_SHOP.slug, key: TEST_SHOP.cashierKey })

    const { result } = renderHook(() => useCashierAuth())

    expect(result.current.status).toBe('validating')
    expect(result.current.shopSlug).toBe(TEST_SHOP.slug)
    expect(result.current.cashierKey).toBe(TEST_SHOP.cashierKey)

    await waitFor(() => {
      expect(result.current.status).not.toBe('validating')
    }, WAIT_OPTS)

    expect(result.current.status).toBe('valid')
    expect(result.current.shopId).toBeTruthy()
  }, 15_000)

  it('on valid response: returns shopId, shopSlug, cashierKey', async () => {
    setLocationSearch({ shop: TEST_SHOP.slug, key: TEST_SHOP.cashierKey })

    const { result } = renderHook(() => useCashierAuth())

    await waitFor(() => {
      expect(result.current.status).toBe('valid')
    }, WAIT_OPTS)

    expect(result.current.shopId).toBe(TEST_SHOP.id)
    expect(result.current.shopSlug).toBe(TEST_SHOP.slug)
    expect(result.current.cashierKey).toBe(TEST_SHOP.cashierKey)
  }, 15_000)

  it('on invalid key (real bcrypt mismatch): status invalid', async () => {
    setLocationSearch({ shop: TEST_SHOP.slug, key: 'wrong-cashier-key' })

    const { result } = renderHook(() => useCashierAuth())

    await waitFor(() => {
      expect(result.current.status).not.toBe('validating')
    }, WAIT_OPTS)

    expect(result.current.status).toBe('invalid')
  }, 15_000)

  it('missing URL params: status invalid without API call', async () => {
    setLocationSearch({})

    const { result } = renderHook(() => useCashierAuth())

    await waitFor(() => {
      expect(result.current.status).toBe('invalid')
    }, WAIT_OPTS)

    expect(result.current.shopId).toBeNull()
  })

  it('missing key param only: status invalid', async () => {
    setLocationSearch({ shop: TEST_SHOP.slug })

    const { result } = renderHook(() => useCashierAuth())

    await waitFor(() => {
      expect(result.current.status).toBe('invalid')
    }, WAIT_OPTS)
  })
})
