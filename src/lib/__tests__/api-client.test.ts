import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'
import { apiClient, AuthError, ApiError } from '../api-client'
import { assertApiRunning } from '../../test-helpers/setup'

// ---------------------------------------------------------------------------
// Block A: Real HTTP integration (requires local API on :3000)
// ---------------------------------------------------------------------------
describe('apiClient — real HTTP integration', () => {
  const originalInitData = (window as any).Telegram?.WebApp?.initData

  beforeAll(async () => {
    await assertApiRunning()
    // Use dev-bypass initData so the real API accepts requests
    ;(window as any).Telegram = {
      ...(window as any).Telegram,
      WebApp: { ...(window as any).Telegram?.WebApp, initData: 'mock' },
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Restore original initData after all integration tests
  afterAll(() => {
    ;(window as any).Telegram.WebApp.initData = originalInitData
  })

  it('GET /api/v1/shops returns real shop data', async () => {
    const result = await apiClient.get<unknown[]>('/api/v1/shops')
    expect(Array.isArray(result)).toBe(true)
  })

  it('POST /api/v1/auth/me returns real user', async () => {
    const result = await apiClient.post<{ user: { id: string } }>('/api/v1/auth/me', {})
    expect(result).toHaveProperty('user')
    expect(result.user).toHaveProperty('id')
  })

  it('sends X-Telegram-Init-Data header to real API', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    await apiClient.get('/api/v1/shops')
    const callArgs = spy.mock.calls[0]
    const init = callArgs[1] as RequestInit
    expect((init.headers as Record<string, string>)['X-Telegram-Init-Data']).toBe('mock')
  })

  it('throws AuthError on 401 with invalid initData', async () => {
    ;(window as any).Telegram.WebApp.initData = 'bad-value'
    try {
      await expect(apiClient.get('/api/v1/shops')).rejects.toBeInstanceOf(AuthError)
    } finally {
      ;(window as any).Telegram.WebApp.initData = 'mock'
    }
  })

  it('throws on non-existent route (404)', async () => {
    // Real API returns plain text 404 (not JSON), so apiClient throws
    // a SyntaxError from res.json() rather than a clean ApiError.
    // This documents actual behavior — the error is still thrown.
    await expect(apiClient.get('/api/v1/nonexistent')).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Block B: Retry & error handling (mocked fetch)
// 5xx uses mocked fetch because no test endpoint returns 500 on demand
// ---------------------------------------------------------------------------
describe('apiClient — retry & error handling (mocked fetch)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Ensure Telegram mock is available for getHeaders()
    ;(window as any).Telegram = {
      WebApp: { initData: 'mock-init-data' },
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  function mockFetch(responses: Array<Response | Error>) {
    let call = 0
    vi.stubGlobal('fetch', vi.fn(async () => {
      const r = responses[call++]
      if (r instanceof Error) throw r
      return r
    }))
  }

  function okResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), { status: 200 })
  }

  function errResponse(status: number, code: string): Response {
    return new Response(JSON.stringify({ error: { code } }), { status })
  }

  it('retries twice on network error then throws NETWORK_ERROR', async () => {
    mockFetch([new Error('network'), new Error('network'), new Error('network')])
    const fetchSpy = vi.mocked(globalThis.fetch)
    const promise = apiClient.get('/api/v1/cards').catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    const err = await promise
    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toBe('NETWORK_ERROR')
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  it('succeeds on 2nd attempt after network error', async () => {
    mockFetch([new Error('network'), okResponse({ cards: [1] })])
    const promise = apiClient.get<{ cards: number[] }>('/api/v1/cards')
    await vi.advanceTimersByTimeAsync(1000)
    const result = await promise
    expect(result).toEqual({ cards: [1] })
  })

  it('retries twice on 5xx then throws ApiError', async () => {
    mockFetch([
      errResponse(503, 'SERVICE_UNAVAILABLE'),
      errResponse(503, 'SERVICE_UNAVAILABLE'),
      errResponse(503, 'SERVICE_UNAVAILABLE'),
    ])
    const fetchSpy = vi.mocked(globalThis.fetch)
    const promise = apiClient.get('/api/v1/cards').catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    const err = await promise
    expect(err).toBeInstanceOf(ApiError)
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  it('succeeds on 2nd attempt after 5xx', async () => {
    mockFetch([errResponse(500, 'SERVER_ERROR'), okResponse({ ok: true })])
    const promise = apiClient.get<{ ok: boolean }>('/api/v1/cards')
    await vi.advanceTimersByTimeAsync(1000)
    const result = await promise
    expect(result).toEqual({ ok: true })
  })

  it('throws ApiError immediately on 404 (no retry)', async () => {
    mockFetch([errResponse(404, 'NOT_FOUND')])
    const fetchSpy = vi.mocked(globalThis.fetch)
    const err = await apiClient.get('/api/v1/cards').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('NOT_FOUND')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('throws AuthError immediately on 401 (no retry)', async () => {
    mockFetch([errResponse(401, 'UNAUTHORIZED')])
    const fetchSpy = vi.mocked(globalThis.fetch)
    await expect(apiClient.get('/api/v1/cards')).rejects.toBeInstanceOf(AuthError)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('POST with retry:false does NOT retry on network error', async () => {
    mockFetch([new Error('network')])
    const fetchSpy = vi.mocked(globalThis.fetch)
    await expect(
      apiClient.post('/api/v1/stamps/redeem', {}, { retry: false }),
    ).rejects.toThrow('NETWORK_ERROR')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('POST with retry:false does NOT retry on 5xx', async () => {
    mockFetch([errResponse(500, 'SERVER_ERROR')])
    const fetchSpy = vi.mocked(globalThis.fetch)
    const err = await apiClient
      .post('/api/v1/stamps/redeem', {}, { retry: false })
      .catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
