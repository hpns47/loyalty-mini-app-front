// apps/web/src/lib/api-client.ts

const BASE_URL = import.meta.env.VITE_API_URL as string
const MAX_RETRIES = 2
const RETRY_DELAYS_MS = [1000, 2000] as const

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getHeaders(): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initData = (window as any).Telegram?.WebApp?.initData ?? ''
  return {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData,
  }
}

async function fetchWithRetry<T>(
  url: string,
  init: RequestInit,
  retry: boolean,
): Promise<T> {
  const maxAttempts = retry ? MAX_RETRIES + 1 : 1

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]),
      )
    }

    let res: Response
    try {
      res = await fetch(url, init)
    } catch {
      // Network error — retry if attempts remain
      if (attempt < maxAttempts - 1) continue
      throw new Error('NETWORK_ERROR')
    }

    if (res.ok) {
      return res.json() as Promise<T>
    }

    if (res.status === 401) {
      const body = (await res.json()) as { error?: { code?: string } }
      throw new AuthError(body.error?.code ?? 'UNAUTHORIZED')
    }

    if (res.status >= 500) {
      // Retry on 5xx if attempts remain
      if (attempt < maxAttempts - 1) continue
      const body = (await res.json()) as { error?: { code?: string } }
      throw new ApiError(body.error?.code ?? 'SERVER_ERROR', `HTTP ${res.status}`)
    }

    // Other 4xx — throw immediately, no retry
    const body = (await res.json()) as { error?: { code?: string } }
    throw new ApiError(body.error?.code ?? 'CLIENT_ERROR', `HTTP ${res.status}`)
  }

  // Unreachable, but satisfies TypeScript
  throw new Error('UNEXPECTED')
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return fetchWithRetry<T>(`${BASE_URL}${path}`, { headers: getHeaders() }, true)
  },

  post<T>(path: string, body: unknown, options?: { retry?: boolean }): Promise<T> {
    return fetchWithRetry<T>(
      `${BASE_URL}${path}`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      },
      options?.retry ?? true,
    )
  },
}
